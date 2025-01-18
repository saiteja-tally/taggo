from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.hashers import make_password
from django.views.decorators.http import require_POST
import json
from django.contrib.auth.models import User  # Assuming you are using the default User model

def get_username_from_user_id(request, user_id):
    # Try to get the user object by user_id, or return a 404 if not found
    user = get_object_or_404(User, id=user_id)

    # Return the username in the response
    return JsonResponse({"username": user.username})

