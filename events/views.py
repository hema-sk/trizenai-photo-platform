from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from accounts.permissions import IsAdminUserRole

from .models import Event, EventMember
from .serializers import EventMemberSerializer, EventSerializer


class EventCreateView(generics.CreateAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAdminUserRole]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class EventListView(generics.ListAPIView):
    serializer_class = EventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == "ADMIN":
            return Event.objects.filter(
                created_by=self.request.user
            )

        return Event.objects.filter(
            members__user=self.request.user
        ).distinct()


class EventMemberCreateView(generics.ListCreateAPIView):
    serializer_class = EventMemberSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        event_id = self.request.query_params.get("event")

        if event_id:
            return EventMember.objects.filter(
                event_id=event_id,
                event__created_by=self.request.user,
            )

        return EventMember.objects.filter(
            event__created_by=self.request.user
        )

    def perform_create(self, serializer):
        event = serializer.validated_data["event"]

        if event.created_by != self.request.user:
            raise PermissionDenied(
                "You can only add members to your own events."
            )

        serializer.save()