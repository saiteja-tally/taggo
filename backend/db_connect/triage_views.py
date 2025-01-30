from .models import Annotation
from django.http import JsonResponse, HttpResponse, Http404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from datetime import datetime
from django.conf import settings
import logging, boto3, json, io
from PIL import Image
from django.contrib.auth.models import User
import pytesseract

logger = logging.getLogger(__name__)

# Upload file to S3
s3 = boto3.client('s3')

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_annotation(request):
    if not request.user.groups.filter(name='reviewers').exists() and not request.user.is_superuser:
        return JsonResponse({'status': 'error', 'message': 'Only reviewers can accept annotations'}, status=403)

    id = request.data['doc_id']
    try:
        annotation = Annotation.objects.get(id=id)
        annotation.status = 'done'
        annotation.assigned_to_user = None
        ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%b-%y)')
        annotation.history.append(f'{ist_time}: accepted by {request.user.username}')
        annotation.save()
        return JsonResponse({'status': 'success', 'message': 'Annotation accepted'}, safe=False)

    except Exception as e:
        logger.error(f"Error accepting annotation: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    

def get_document(request, id: str):
    try:
        s3_file_key = Annotation.objects.values("s3_file_key").get(id=id)['s3_file_key']
        
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

    except Exception as e:
        logger.error(f"Error retrieving document: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
@permission_classes([IsAuthenticated])
def get_json(request, status: str, id: str):
    try:
        if status == 'uploaded':
            status_in_db = Annotation.objects.get(id=id).status
            if status_in_db == 'uploaded':
                return JsonResponse({'status': 'success', 'data': None}, safe=False)

            status = status_in_db

        if status == 'pre-labelled':
            bucket = settings.S3_PRE_LABEL_BUCKET
        
        elif status == 'labelled':
            bucket = settings.S3_LABELLING_BUCKET
        
        elif status == 'rejected':
            bucket = settings.S3_LABELLING_BUCKET

        elif status == 'accepted':
            bucket = settings.S3_LABEL_BUCKET

        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid status'}, status=400)

        s3_file_key = f"{id}.json"
        s3_response = s3.get_object(Bucket=bucket, Key=s3_file_key)
        json_content = s3_response['Body'].read().decode('utf-8')
        data = json.loads(json_content)

        return JsonResponse({'status': 'success', 'data': data}, safe=False)

    except Exception as e:
        logger.error(f"Error retrieving JSON document: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def save_json(request , status: str, id: str):
    try:
        json_data = request.body.decode('utf-8')
        if status == 'pre-labelled':
            user = 'inhouse-model'
            bucket = settings.S3_PRE_LABEL_BUCKET
        elif status == 'labelled' or status == 'rejected':
            user = request.user.username
            bucket = settings.S3_LABELLING_BUCKET
        elif status == 'accepted':
            user = request.user.username
            bucket = settings.S3_LABEL_BUCKET
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid status'}, status=400)

        s3_file_key = f"{id}.json"

        s3.put_object(Bucket=bucket, Key=s3_file_key, Body=json_data)

        # update annotation record
        annotation = Annotation.objects.get(id=id)
        annotation.status = status
        annotation.assigned_to_user = None
        ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%b-%y)')
        annotation.history.append(f'{ist_time}: {status} by {user}')
        annotation.save()

        return JsonResponse({'status': 'success', 'message': f'{status} JSON data saved successfully'}, safe=False)

    except Exception as e:
        logger.error(f"Error saving JSON data: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_ocr_text(request):
    try:
        if request.method == 'POST' and 'file' in request.FILES:
            start_time = datetime.now()
            uploaded_file = request.FILES['file']

            # Use Pillow to open the uploaded image file
            image = Image.open(uploaded_file)

            # Convert RGBA to RGB
            rgb_image = image.convert("RGB")

            # Save as JPEG
            rgb_image.save("ocr_crop.jpeg")
            # Apply OCR using pytesseract
            text = pytesseract.image_to_string(image)

            text = text.strip()

            end_time = datetime.now()

            logger.info(f"OCR completed in {end_time - start_time}")

            # Return the extracted text as JSON response
            return JsonResponse({'text': text})

        return JsonResponse({'error': 'POST method and file data required'}, status=400)
    except Exception as e:
        logger.error(f"Error processing OCR: {e}")
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_annotation(request):
    if not request.user.groups.filter(name='reviewers').exists() or not request.user.is_superuser:
        return JsonResponse({'status': 'error', 'message': 'Only reviewers can reject annotations'}, status=403)

    id = request.data['doc_id']
    reason = request.data['reason']
    try:
        annotation = Annotation.objects.get(id=id)
        annotation.status = 'rejected'
        annotation.assigned_to_user = None
        ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%b-%y)')
        annotation.history.append(f'{ist_time}: rejected by {request.user.username} because {reason}')
        annotation.save()
        return JsonResponse({'status': 'success', 'message': 'Annotation rejected'}, safe=False)

    except Exception as e:
        logger.error(f"Error rejecting annotation: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_next(request, id: str):
    try:
        current_annotation = Annotation.objects.get(id=id)
        if request.user.is_superuser:
            next_annotation = Annotation.objects.filter(inserted_time__lt=current_annotation.inserted_time).order_by('-inserted_time').first()
        else:
            next_annotation = Annotation.objects.filter(assigned_to_user=request.user, inserted_time__lt=current_annotation.inserted_time).order_by('-inserted_time').first()
        
        if next_annotation:
            annotation_data = next_annotation.__dict__
            if next_annotation.assigned_to_user_id:
                try:
                    user = User.objects.get(id=next_annotation.assigned_to_user_id)
                    annotation_data['assigned_to_user'] = user.username
                except User.DoesNotExist:
                    annotation_data['assigned_to_user'] = None
            else:
                annotation_data['assigned_to_user'] = None
            del annotation_data['_state']  # Remove the internal state field
            return JsonResponse({'status': 'success', 'annotation': annotation_data}, safe=False)
        return JsonResponse({'status': 'success', 'message': 'No more documents to label'}, safe=False)

    except Annotation.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Annotation not found'}, status=404)

    except Exception as e:
        logger.error(f"Error retrieving next annotation: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])    
def get_prev(request, id: str):
    try:
        current_annotation = Annotation.objects.get(id=id)
        if request.user.is_superuser:
            prev_annotation = Annotation.objects.filter(inserted_time__gt=current_annotation.inserted_time).order_by('inserted_time').first()
        else:
            prev_annotation = Annotation.objects.filter(assigned_to_user=request.user, inserted_time__gt=current_annotation.inserted_time).order_by('inserted_time').first()
        
        if prev_annotation:
            annotation_data = prev_annotation.__dict__
            if prev_annotation.assigned_to_user_id:
                try:
                    user = User.objects.get(id=prev_annotation.assigned_to_user_id)
                    annotation_data['assigned_to_user'] = user.username
                except User.DoesNotExist:
                    annotation_data['assigned_to_user'] = None
            else:
                annotation_data['assigned_to_user'] = None
            del annotation_data['_state']  # Remove the internal state field
            return JsonResponse({'status': 'success', 'annotation': annotation_data}, safe=False)
        return JsonResponse({'status': 'success', 'message': 'No more documents to label'}, safe=False)

    except Annotation.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'Annotation not found'}, status=404)
    except Exception as e:
        logger.error(f"Error retrieving previous annotation: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)