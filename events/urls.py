from django.urls import path

from .views import EventCreateView, EventListView, EventMemberCreateView


urlpatterns = [
    path("", EventListView.as_view(), name="event-list"),
    path("create/", EventCreateView.as_view(), name="event-create"),
    path("members/", EventMemberCreateView.as_view(), name="event-member-create"),
]