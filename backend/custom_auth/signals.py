from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

@receiver(post_save, sender=User)
def send_email_on_user_creation(sender, instance, created, **kwargs):
    if created:  # Trigger only for new users
        # Generate token using Django's PasswordResetTokenGenerator
        token = default_token_generator.make_token(instance)

        # Construct the email message
        subject = "Set Your Password"
        message = f"Hello {instance.username}, \nplease set your password using the link below.\n{settings.FRONTEND_URL}/set-password?uid={instance.pk}&token={token}\n\nThank you!"
        recipient = instance.email

        # Send the email
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [recipient])

        print(f"User created: {instance.username}(username)\nemail sent to {instance.email}")
