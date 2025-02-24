from django.urls import path
from .views import (
    get_annotations,
    upload_document,
    assign_annotation,
    smart_assign,
    get_smart_assign_data,
    get_annotations_count,
    get_groups_with_users,
    dashboard_view,
    pre_label
)
from .triage_views import (get_document, get_json, save, accept, submit, get_ocr_text, reject, get_next, get_prev)

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
    path("save/<str:status>/<str:id>/", save, name="save json"),
    path("accept/<str:status>/<str:id>/", accept, name="accept annotation"),
    path("submit/<str:status>/<str:id>/", submit, name="submit annotation"),
    path("reject/<str:status>/<str:id>/", reject, name="reject annotation"),
    path("get_ocr_text/", get_ocr_text, name="get ocr text"),
    path("get_next/<str:id>/", get_next, name="get next"),
    path("get_prev/<str:id>/", get_prev, name="get prev"),
    path("smart_assign/", smart_assign, name="smart assign"),
    path('get_smart_assign_data/', get_smart_assign_data, name='get_user_groups'),
    path('get_annotations_count/', get_annotations_count, name='get_annotations_count'),
    path('get_groups_with_users/', get_groups_with_users, name='get_groups_with_users'),
    path('dashboard_view/', dashboard_view, name='dashboard_view'),
    path('pre_label/', pre_label, name='pre_label')
]
