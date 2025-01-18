from django.shortcuts import render
from .models import Annotation
from django.http import JsonResponse, HttpResponse, Http404
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import logging
from django.db import transaction
import boto3
from datetime import datetime
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from PIL import Image
import io
# from reportlab.pdfgen import canvas


# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_annotations(request, perPage: int, page: int):
    if request.user.is_superuser:
        annotations_list = Annotation.objects.all().order_by('-inserted_time')
    else:
        annotations_list = Annotation.objects.filter(assigned_to_user=request.user).order_by('-inserted_time')
    paginator = Paginator(annotations_list, perPage)  # Use perPage for annotations per page

    try:
        annotations = paginator.page(page)
    except PageNotAnInteger:
        annotations = paginator.page(1)
    except EmptyPage:
        annotations = paginator.page(paginator.num_pages)

    data = []
    for annotation in annotations.object_list:
        annotation_data = annotation.__dict__
        if annotation.assigned_to_user_id:
            try:
                user = User.objects.get(id=annotation.assigned_to_user_id)
                annotation_data['assigned_to_user'] = user.username
            except User.DoesNotExist:
                annotation_data['assigned_to_user'] = None
        else:
            annotation_data['assigned_to_user'] = None
        del annotation_data['_state']  # Remove the internal state field
        data.append(annotation_data)

    return JsonResponse({
        'annotations': data,
        'page': annotations.number,
        'pages': paginator.num_pages
    }, safe=False)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_document(request):
    if request.method == 'POST':

        if not request.user.is_superuser:
            return JsonResponse({'status': 'error', 'message': 'Only superusers can upload documents'}, status=403)

        if 'document' not in request.FILES:
            return JsonResponse({'status': 'error', 'message': 'No file uploaded'}, status=400)

        uploaded_file = request.FILES['document']
        file_extension = uploaded_file.name.split('.')[-1].lower()

        try:
            with transaction.atomic():
                # Determine uploader
                uploader = request.user.username if request.user.is_authenticated else 'Anonymous'

                # Create a new annotation record
                annotation = Annotation(status='uploaded')
                ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%m-%y)')
                ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%b-%y)')
                annotation.history = [f'{ist_time}: uploaded by {uploader}']
                annotation.save()

                # Use UUID as the file key
                s3_file_key = f"{annotation.id}.{file_extension}"

                # Upload file to S3
                s3 = boto3.client('s3')
                s3.upload_fileobj(uploaded_file, settings.S3_DOC_BUCKET, s3_file_key)

                # Update annotation record
                annotation.s3_file_key = s3_file_key
                annotation.save()

                logger.info(f"File '{uploaded_file.name}' uploaded successfully by '{uploader}'")
                return JsonResponse({
                    'status': 'success',
                    'message': f"File '{uploaded_file.name}' uploaded successfully.",
                    'file_path': s3_file_key
                })

        except Exception as e:
            logger.error(f"Error uploading document '{uploaded_file.name}' by '{uploader}': {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


def get_document(request, id: str):
    try:
        s3_file_key = Annotation.objects.values("s3_file_key").get(id=id)['s3_file_key']
                
        # Initialize S3 client
        s3 = boto3.client('s3')

        # Retrieve file content from S3
        s3_response = s3.get_object(Bucket=settings.S3_DOC_BUCKET, Key=s3_file_key)
        file_content = s3_response['Body'].read()

        if not s3_file_key.endswith('.pdf'):
            img = Image.open(io.BytesIO(file_content))
            pdf_bytes = io.BytesIO()
            img.save(pdf_bytes, format='PDF')
            pdf_bytes.seek(0)
            file_content = pdf_bytes.read()

        # Set headers for PDF content
        response = HttpResponse(file_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{id}.pdf"'
        return response

    except Annotation.DoesNotExist:
        logger.error(f"Document with id:{id} does not exist.")
        raise Http404("Document not found")
    except Exception as e:
        logger.error(f"Error retrieving document: {e}")
        raise Http404(str(e))