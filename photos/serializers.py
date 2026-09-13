from rest_framework import serializers

from .models import Photo


class PhotoSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(write_only=True)

    class Meta:
        model = Photo
        fields = [
            "id",
            "event",
            "uploaded_by",
            "filename",
            "storage_location",
            "file_size",
            "created_at",
            "is_selected",
            "image",
        ]
        read_only_fields = [
    "id",
    "uploaded_by",
    "filename",
    "storage_location",
    "file_size",
    "created_at",
]

    def create(self, validated_data):
        validated_data.pop("image")
        return Photo.objects.create(**validated_data)