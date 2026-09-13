from django.urls import path

from .views import (
    PhotoCreateView,
    PhotoListView,
    PhotoSelectView,
    PhotoDeleteView,
)

urlpatterns = [
    path("", PhotoListView.as_view(), name="photo-list"),
    path("upload/", PhotoCreateView.as_view(), name="photo-upload"),
    path("<int:pk>/select/", PhotoSelectView.as_view(), name="photo-select"),
    path("<int:pk>/", PhotoDeleteView.as_view(), name="photo-delete"),
]