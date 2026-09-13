from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Event, EventMember


User = get_user_model()


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = [
            "id",
            "name",
            "description",
            "location",
            "event_date",
            "created_by",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_at",
        ]


class EventMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    class Meta:
        model = EventMember
        fields = [
            "id",
            "event",
            "user",
            "username",
            "assigned_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "username",
            "assigned_at",
        ]

    def validate(self, attrs):
        username = self.initial_data.get("username")
        email = self.initial_data.get("email")

        if not username and not email:
            raise serializers.ValidationError(
                "Provide a username or email."
            )

        try:
            if username:
                user = User.objects.get(username=username)
            else:
                user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Team member not found."
            )

        if user.role != User.Role.TEAM_MEMBER:
            raise serializers.ValidationError(
                "Only Team Members can be assigned to an event."
            )

        event = attrs.get("event")

        if EventMember.objects.filter(
            event=event,
            user=user
        ).exists():
            raise serializers.ValidationError(
                "This team member is already assigned to this event."
            )

        attrs["user"] = user
        return attrs