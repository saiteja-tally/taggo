from django.db import models
import uuid
from django.contrib.auth.models import User

# Create your models here.
class Annotation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assigned_to_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    history = models.JSONField(default=list)
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('pre-labelled', 'Pre-labelled'),
        ('labelled', 'Labelled'),
        ('reviewed', 'Reviewed'),
        ('done', 'Done'),
    ]
    inserted_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='uploaded')
    s3_file_key = models.CharField(max_length=255)
    s3_pre_label_key = models.CharField(max_length=255, null=True, blank=True)
    s3_label_key = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Annotation {self.id} - {self.status}"
