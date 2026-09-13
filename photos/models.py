from django.db import models
from django.conf import settings

from events.models import Event


class Photo(models.Model):
    event = models.ForeignKey(
        Event,
        on_delete=models.CASCADE,
        related_name="photos",
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="uploaded_photos",
    )

    filename = models.CharField(max_length=255)

    storage_location = models.URLField()

    file_size = models.PositiveBigIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    is_selected = models.BooleanField(default=False)

    def __str__(self):
        return self.filename