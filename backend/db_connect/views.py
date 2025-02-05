from .models import Annotation
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.conf import settings
import logging
from django.db import transaction
import boto3
from datetime import datetime
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
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
def get_annotations(request, assignee:str, status: str, perPage: int, page: int, searchID: str):
    if status == "all":
        if request.user.is_superuser:
            if assignee == "all":
                annotations_list = Annotation.objects.all().order_by('-inserted_time')
            elif assignee == "unassigned":
                annotations_list = Annotation.objects.filter(assigned_to_user=None).order_by('-inserted_time')
            else:
                annotations_list = Annotation.objects.filter(assigned_to_user__username=assignee).order_by('-inserted_time')
        else:
            annotations_list = Annotation.objects.filter(assigned_to_user=request.user).order_by('-inserted_time')
    else:
        if request.user.is_superuser:
            if assignee == "all":
                annotations_list = Annotation.objects.filter(status=status).order_by('-inserted_time')
            elif assignee == "unassigned":
                annotations_list = Annotation.objects.filter(status=status, assigned_to_user=None).order_by('-inserted_time')
            else:
                annotations_list = Annotation.objects.filter(status=status, assigned_to_user__username=assignee).order_by('-inserted_time')
        else:
            annotations_list = Annotation.objects.filter(assigned_to_user=request.user, status=status).order_by('-inserted_time')

    if searchID != 'null':
        annotations_list = annotations_list.filter(id__icontains=searchID)

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
                sqs = boto3.client('sqs', region_name="ap-south-1")
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_annotation(request):
    if request.method == 'POST':
        try:
            annotation_id = request.data['id']
            username = request.data['username']
            assigned_by = request.user
            annotation = Annotation.objects.get(id=annotation_id)
            if username == None:
                assign_to_user = None
                history_message = f'unassigned by {assigned_by.username}'
            else:
                assign_to_user = User.objects.get(username=username)
                assigned_to_username = assign_to_user.username
                history_message = f'assigned to {assigned_to_username} by {assigned_by.username}'

            annotation.assigned_to_user = assign_to_user
            ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%b-%y)')

            annotation.history.append(f'{ist_time}: {history_message}')
            annotation.save()

            return JsonResponse({'status': 'success', 'message': f'Annotation {annotation_id} assigned to user {username}'}, safe=False)

        except Exception as e:
            logger.error(f"Error assigning annotation: {e}")
            return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)
    

    
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
            annotation.status = 'in-labelling'
            ist_time = datetime.now().astimezone().strftime('%H:%M:%S (%d-%b-%y)')
            annotation.history.append(f'{ist_time}: assigned to {users[user_index]["username"]} by {request.user.username}(smart assign)')
            annotation.save()
            user_index = (user_index + 1) % user_count

        return JsonResponse({'status': 'success', 'message': f'{annotations_to_assign} annotations assigned successfully'}, safe=False)

    except Exception as e:
        logger.error(f"Error assigning annotations: {e}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_smart_assign_data(request):
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


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_annotations_count(request):
    try:
        total_count = Annotation.objects.count()
        inprogress_counts = Annotation.objects.filter(status__in=['uploaded', 'pre-labelled', 'labelling', 'labelled', 'accepted', 'rejected']).values('status').annotate(count=Count('status'))
        done_count = Annotation.objects.filter(status='done').count()

        # Initialize inprogress with all possible statuses
        inprogress = {status: 0 for status in ['uploaded', 'pre-labelled', 'labelling', 'labelled', 'accepted', 'rejected']}
        for status in inprogress_counts:
            inprogress[status['status']] = status['count']

        return JsonResponse({
            'total': total_count,
            'inprogress': inprogress,
            'done': done_count
        }, status=200)

    except Exception as e:
        logger.error(f"Error retrieving annotation counts: {e}")
        return JsonResponse({'status': 'error', 'message': 'An unexpected error occurred.'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_groups_with_users(request):
    if not request.user.is_superuser:
        return JsonResponse({'status': 'error', 'message': 'Only superusers can access this endpoint'}, status=403)

    all_groups = Group.objects.all().values('name', 'user__username')
    groups_with_users = {}
    for group in all_groups:
        group_name = group['name']
        user_name = group['user__username']
        if group_name not in groups_with_users:
            groups_with_users[group_name] = []
        groups_with_users[group_name].append(user_name)

    superusers = User.objects.filter(is_superuser=True).values_list('username', flat=True)
    groups_with_users['superusers'] = list(superusers)

    return JsonResponse(groups_with_users, status=200)