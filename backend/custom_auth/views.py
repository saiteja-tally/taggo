from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User  # Assuming you are using the default User model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

def get_username_from_user_id(request, user_id):
    # Try to get the user object by user_id, or return a 404 if not found
    user = get_object_or_404(User, id=user_id)

    # Return the username in the response
    return JsonResponse({"username": user.username})


class SetPasswordView(APIView):
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('password')

        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"success": "Password set successfully"}, status=status.HTTP_200_OK)

