from django.urls import path
from .views import get_annotations, get_document, upload_document

urlpatterns = [
    path("get_annotations/<int:perPage>/<int:page>", get_annotations, name="get annotations"),
    path("get_document/<str:id>", get_document, name="get document"),
    path("upload_document/", upload_document, name="upload document"),
]