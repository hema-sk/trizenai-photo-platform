from django.urls import path

from .views import (
    GalleryAccessView,
    GalleryByEventView,
    GalleryCreateView,
    GalleryPublishView,
    GallerySetPinView,
)


urlpatterns = [
    path(
        "create/",
        GalleryCreateView.as_view(),
        name="gallery-create",
    ),
    path(
        "event/<int:event_id>/",
        GalleryByEventView.as_view(),
        name="gallery-by-event",
    ),
    path(
        "<int:pk>/set-pin/",
        GallerySetPinView.as_view(),
        name="gallery-set-pin",
    ),
    path(
        "<int:pk>/publish/",
        GalleryPublishView.as_view(),
        name="gallery-publish",
    ),
    path(
        "public/<str:share_token>/",
        GalleryAccessView.as_view(),
        name="gallery-access",
    ),
]