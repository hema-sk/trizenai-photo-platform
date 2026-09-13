from rest_framework import serializers

from .models import Gallery


class GallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = Gallery
        fields = [
            "id",
            "event",
            "share_token",
            "is_published",
            "created_at",
            "created_by",
        ]

        read_only_fields = [
            "id",
            "share_token",
            "is_published",
            "created_at",
            "created_by",
        ]


class GalleryPinSerializer(serializers.Serializer):
    pin = serializers.CharField(
        min_length=4,
        max_length=6,
        write_only=True,
    )

class GalleryAccessSerializer(serializers.Serializer):
    pin = serializers.CharField(
        min_length=4,
        max_length=6,
        write_only=True,
    )    