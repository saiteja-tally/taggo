from django.db import models
import uuid
from django.contrib.auth.models import User

# Create your models here.
class Annotation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assigned_to_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    history = models.JSONField(default=list)
    labelled_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='labelled_by')
    reviewed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_by')
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('pre-labelled', 'Pre-labelled'),
        ('in-labelling', 'In-Labelling'),
        ('in-review', 'In-Review'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed')
    ]
    inserted_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='uploaded')
    s3_file_key = models.CharField(max_length=255)
    s3_pre_label_key = models.CharField(max_length=255, null=True, blank=True)
    s3_label_key = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"Annotation {self.id} - {self.status}"
