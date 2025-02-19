from django.db import models
import uuid
from django.contrib.auth.models import User
from django.utils import timezone
import pytz

# Create your models here.
class Annotation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assigned_to_user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    history = models.JSONField(default=list)
    labelled_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='labelled_by')
    labelled_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_by')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    STATUS_CHOICES = [
        ('uploaded', 'Uploaded'),
        ('pre-labelled', 'Pre-labelled'),
        ('in-labelling', 'In-Labelling'),
        ('in-review', 'In-Review'),
        ('accepted', 'Accepted'),
        ('completed', 'Completed')
    ]
    inserted_time = models.DateTimeField(auto_now_add=True)
    completed_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='uploaded')
    s3_file_key = models.CharField(max_length=255)
    s3_pre_label_key = models.CharField(max_length=255, null=True, blank=True)
    s3_label_key = models.CharField(max_length=255, null=True, blank=True)

    def save(self, *args, **kwargs):
        ist = pytz.timezone('Asia/Kolkata')
        if self.labelled_by and not self.labelled_at:
            self.labelled_at = timezone.now().astimezone(ist)
        if self.reviewed_by and not self.reviewed_at:
            self.reviewed_at = timezone.now().astimezone(ist)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Annotation {self.id} - {self.status}"
