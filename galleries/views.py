import secrets

from django.contrib.auth.hashers import check_password, make_password
from rest_framework import generics
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from accounts.permissions import IsAdminUserRole

from .models import Gallery
from .serializers import (
    GalleryAccessSerializer,
    GalleryPinSerializer,
    GallerySerializer,
)


class GalleryCreateView(generics.CreateAPIView):
    serializer_class = GallerySerializer
    permission_classes = [IsAdminUserRole]

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]

        if event.created_by != self.request.user:
            raise PermissionDenied(
                "You can only create galleries for your own events."
            )

        share_token = secrets.token_urlsafe(32)

        serializer.save(
            share_token=share_token,
            created_by=self.request.user,
        )


class GallerySetPinView(generics.UpdateAPIView):
    serializer_class = GalleryPinSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return Gallery.objects.filter(
            event__created_by=self.request.user
        )

    def update(self, request, *args, **kwargs):
        gallery = self.get_object()

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        gallery.pin_hash = make_password(
            serializer.validated_data["pin"]
        )
        gallery.save(update_fields=["pin_hash"])

        return Response({
            "message": "Gallery PIN set successfully."
        })


class GalleryPublishView(generics.UpdateAPIView):
    serializer_class = GallerySerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return Gallery.objects.filter(
            event__created_by=self.request.user
        )

    def update(self, request, *args, **kwargs):
        gallery = self.get_object()

        gallery.is_published = True
        gallery.save(update_fields=["is_published"])

        return Response({
            "message": "Gallery published successfully.",
            "gallery_id": gallery.id,
            "is_published": gallery.is_published,
        })


class GalleryByEventView(generics.GenericAPIView):
    serializer_class = GallerySerializer
    permission_classes = [IsAdminUserRole]

    def get(self, request, event_id):
        try:
            gallery = Gallery.objects.get(
                event_id=event_id,
                event__created_by=request.user,
            )
        except Gallery.DoesNotExist:
            return Response(
                {"error": "Gallery not found."},
                status=404,
            )

        return Response(
            self.get_serializer(gallery).data
        )


class GalleryAccessView(generics.GenericAPIView):
    serializer_class = GalleryAccessSerializer
    permission_classes = []

    def post(self, request, share_token):
        try:
            gallery = Gallery.objects.get(
                share_token=share_token,
                is_published=True,
            )
        except Gallery.DoesNotExist:
            return Response(
                {"error": "Gallery not found or not published."},
                status=404,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if not check_password(
            serializer.validated_data["pin"],
            gallery.pin_hash,
        ):
            return Response(
                {"error": "Invalid PIN."},
                status=403,
            )

        photos = gallery.event.photos.filter(
            is_selected=True
        )

        return Response({
            "gallery_id": gallery.id,
            "event": gallery.event.name,
            "photos": [
                {
                    "id": photo.id,
                    "filename": photo.filename,
                    "storage_location": photo.storage_location,
                }
                for photo in photos
            ],
        })