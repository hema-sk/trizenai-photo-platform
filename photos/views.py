from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Photo
from .serializers import PhotoSerializer
from accounts.permissions import IsAdminUserRole


class PhotoListView(generics.ListAPIView):
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "ADMIN":
            return Photo.objects.filter(
                event__created_by=self.request.user
            )

        return Photo.objects.filter(
            uploaded_by=self.request.user
        )


class PhotoCreateView(generics.CreateAPIView):
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]
        image = serializer.validated_data["image"]

        if self.request.user.role == "ADMIN":
            if event.created_by != self.request.user:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(
                    "You can only upload photos to your own events."
                )

        else:
            if not event.members.filter(user=self.request.user).exists():
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(
                    "You are not assigned to this event."
                )

        import cloudinary.uploader

        result = cloudinary.uploader.upload(
            image,
            folder=f"trizenai/events/{event.id}/"
        )

        serializer.save(
            uploaded_by=self.request.user,
            filename=image.name,
            storage_location=result["secure_url"],
            file_size=image.size,
        )


class PhotoSelectView(generics.UpdateAPIView):
    serializer_class = PhotoSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        return Photo.objects.filter(
            event__created_by=self.request.user
        )


class PhotoDeleteView(generics.DestroyAPIView):
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Photo.objects.filter(
            uploaded_by=self.request.user
        )