from django.db import models
from django.conf import settings
from events.models import Event


class Gallery(models.Model):
    event = models.OneToOneField(
        Event,
        on_delete=models.CASCADE,
        related_name="gallery",
    )

    share_token = models.CharField(
        max_length=100,
        unique=True,
    )

    pin_hash = models.CharField(
        max_length=128,
    )

    is_published = models.BooleanField(
        default=False,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_galleries",
    )

    def __str__(self):
        return f"Gallery - {self.event.name}"
