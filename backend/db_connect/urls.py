from django.urls import path
from .views import (
    get_annotations,
    upload_document,
    assign_annotation,
    smart_assign,
    get_smart_assign_data,
    get_annotations_count,
    get_groups_with_users
)
from .triage_views import (get_document, get_json, save_json, get_ocr_text, reject_annotation, get_next, get_prev)

urlpatterns = [
    path(
        "get_annotations/<str:assignee>/<str:status>/<int:perPage>/<int:page>/<str:searchID>",
        get_annotations,
        name="get annotations",
    ),
    path("get_document/<str:id>", get_document, name="get document"),
    path("upload_document/", upload_document, name="upload document"),
    path("get_json/<str:status>/<str:id>/", get_json, name="get json"),
    path("assign_annotation", assign_annotation, name="assign annotation"),
    path("save_json/<str:status>/<str:id>/", save_json, name="save json"),
    path("get_ocr_text/", get_ocr_text, name="get ocr text"),
    path("reject_annotation/", reject_annotation, name="reject annotation"),
    path("get_next/<str:id>/", get_next, name="get next"),
    path("get_prev/<str:id>/", get_prev, name="get prev"),
    path("smart_assign/", smart_assign, name="smart assign"),
    path('get_smart_assign_data/', get_smart_assign_data, name='get_user_groups'),
    path('get_annotations_count/', get_annotations_count, name='get_annotations_count'),
    path('get_groups_with_users/', get_groups_with_users, name='get_groups_with_users')
]
