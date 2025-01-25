from django.urls import path
from .views import (
    get_annotations,
    get_document,
    upload_document,
    get_json,
    get_users,
    assign_annotation,
    save_json,
    get_ocr_text,
    reject_annotation,
    get_next,
    get_prev,
    smart_assign,
    accept_annotation,
    get_smart_assigin_data
)

urlpatterns = [
    path(
        "get_annotations/<int:perPage>/<int:page>",
        get_annotations,
        name="get annotations",
    ),
    path("get_document/<str:id>", get_document, name="get document"),
    path("upload_document/", upload_document, name="upload document"),
    path("get_json/<str:status>/<str:id>/", get_json, name="get json"),
    path("get_users/", get_users, name="get labellers"),
    path("assign_annotation", assign_annotation, name="assign annotation"),
    path("save_json/<str:status>/<str:id>/", save_json, name="save json"),
    path("get_ocr_text/", get_ocr_text, name="get ocr text"),
    path("reject_annotation/", reject_annotation, name="reject annotation"),
    path("get_next/<str:id>/", get_next, name="get next"),
    path("get_prev/<str:id>/", get_prev, name="get prev"),
    path("smart_assign/", smart_assign, name="smart assign"),
    path("accept_annotation/", accept_annotation, name="accept annotation"),
    path('get_smart_assign_data/', get_smart_assigin_data, name='get_user_groups'),

]
