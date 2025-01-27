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
import io, json
import pytesseract
from django.contrib.auth.models import Group
from rest_framework import status
from django.db.models import Count, Q

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Upload file to S3
s3 = boto3.client('s3')


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
                ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%b-%y)')
                annotation.history = [f'{ist_time}: uploaded by {uploader}']
                annotation.save()

                # Use UUID as the file key
                s3_file_key = f"{annotation.id}.{file_extension}"

                s3.upload_fileobj(uploaded_file, settings.S3_DOC_BUCKET, s3_file_key)

                # Update annotation record
                annotation.s3_file_key = s3_file_key
                annotation.save()

                
                # send message to SQS
                sqs = boto3.client('sqs')
                sqs.send_message(
                    QueueUrl=settings.SQS_PRE_LABEL_QUEUE_URL,
                    MessageBody=json.dumps({'id': str(annotation.id),"s3_doc_bucket": settings.S3_DOC_BUCKET, 's3_file_key': s3_file_key})
                )

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
            bucket = settings.S3_LABEL_BUCKET

        elif status == 'done':
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
        elif status == 'labelled' or status == 'accepted':
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
def assign_annotation(request):
    if request.method == 'POST':
        try:
            annotation_id = request.data['id']
            user_id = request.data['user_id']
            assigned_by = request.user
            annotation = Annotation.objects.get(id=annotation_id)
            if user_id == None:
                assign_to_user = None
                history_message = f'Unassigned by {assigned_by.username}'
            else:
                assign_to_user = User.objects.get(id=user_id)
                assigned_to_username = assign_to_user.username
                history_message = f'assigned to {assigned_to_username} by {assigned_by.username}'

            annotation.assigned_to_user = assign_to_user
            ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%b-%y)')

            annotation.history.append(f'{ist_time}: {history_message}')
            annotation.save()

            return JsonResponse({'status': 'success', 'message': f'Annotation {annotation_id} assigned to user {user_id}'}, safe=False)

        except Exception as e:
            logger.error(f"Error assigning annotation: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    try:
        # Ensure only superusers can access this endpoint
        if not request.user.is_superuser:
            return JsonResponse({'status': 'error', 'message': 'Only superusers can view users'}, status=403)

        # Optimize group fetching with prefetch_related
        users = User.objects.filter(is_superuser=False).prefetch_related('groups').values('id', 'username')
        user_data = [
            {
                'id': user['id'],
                'username': user['username'],
                'groups': list(User.objects.get(id=user['id']).groups.values_list('name', flat=True))
            }
            for user in users
        ]

        return JsonResponse({'status': 'success', 'data': user_data})
    
    except Exception as e:
        logger.error(f"Error retrieving users for {request.user.username}: {e}")
        return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred.'}, status=500)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_ocr_text(request):
    try:
        if request.method == 'POST' and 'file' in request.FILES:
            start_time = datetime.now()
            uploaded_file = request.FILES['file']
            ltwh = json.loads(request.POST['ltwh'])

            # Use Pillow to open the uploaded image file
            image = Image.open(uploaded_file)

            # get cordinates from normalized cordinates
            width, height = image.size
            left = ltwh[0] * width
            top = ltwh[1] * height
            right = left + ltwh[2] * width
            bottom = top + ltwh[3] * height

            image = image.crop((left, top, right, bottom))

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
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def smart_assign(request):
    status = request.data['status']
    user_group = request.data['userGroup']
    percentage = request.data['percentage']
    try:
        if not request.user.is_superuser:
            return JsonResponse({'status': 'error', 'message': 'Only superusers can access this endpoint'}, status=403)

        annotations = Annotation.objects.filter(status=status, assigned_to_user=None)
        users = User.objects.filter(groups__name=user_group).values('id', 'username')
        user_count = len(users)
        if user_count == 0:
            return JsonResponse({'status': 'error', 'message': 'No users found in the specified group'}, status=404)

        annotations_to_assign = int(len(annotations) * (percentage / 100))
        user_index = 0

        for annotation in annotations[:annotations_to_assign]:
            user_id = users[user_index]['id']
            annotation.assigned_to_user_id = user_id
            ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%b-%y)')
            annotation.history.append(f'{ist_time}: assigned to {users[user_index]["username"]} by {request.user.username}(smart assign)')
            annotation.save()
            user_index = (user_index + 1) % user_count

        return JsonResponse({'status': 'success', 'message': f'{annotations_to_assign} annotations assigned successfully'}, safe=False)

    except Exception as e:
        logger.error(f"Error assigning annotations: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    

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


@permission_classes([IsAuthenticated])
def get_smart_assigin_data(request):
    all_groups = Group.objects.all().values('name', 'user__username')
    groups_with_users = {}
    for group in all_groups:
        group_name = group['name']
        user_name = group['user__username']
        if group_name not in groups_with_users:
            groups_with_users[group_name] = []
        groups_with_users[group_name].append(user_name)


    annotation_status_counts = (
        Annotation.objects.values('status')
        .annotate(
            total_count=Count('status'),
            unassigned_count=Count('status', filter=Q(assigned_to_user=None))
        )
        .order_by('status')
    )
    status_counts = {
        item['status']: f"{item['unassigned_count']}/{item['total_count']}"
        for item in annotation_status_counts
    }

    return JsonResponse({"groups": groups_with_users, "status": status_counts}, status=status.HTTP_200_OK)