from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.test import APITestCase

from events.models import Event, EventMember
from photos.models import Photo
from galleries.models import Gallery


User = get_user_model()


class GalleryTests(APITestCase):

    def setUp(self):
        # Admin 1
        self.admin = User.objects.create_user(
            username="admin1",
            email="admin1@test.com",
            password="AdminTest123",
            role=User.Role.ADMIN,
        )

        # Admin 2
        self.admin2 = User.objects.create_user(
            username="admin2",
            email="admin2@test.com",
            password="AdminTest123",
            role=User.Role.ADMIN,
        )

        # Team Member
        self.member = User.objects.create_user(
            username="member1",
            email="member1@test.com",
            password="MemberTest123",
            role=User.Role.TEAM_MEMBER,
        )

        # Admin 1's event
        self.event = Event.objects.create(
            name="Admin 1 Wedding",
            description="Test wedding event",
            location="Chennai",
            event_date="2026-09-20",
            created_by=self.admin,
        )

        # Admin 2's event
        self.event2 = Event.objects.create(
            name="Admin 2 Wedding",
            description="Another wedding event",
            location="Chennai",
            event_date="2026-09-21",
            created_by=self.admin2,
        )

        # Assign team member to Admin 1's event
        EventMember.objects.create(
            event=self.event,
            user=self.member,
        )

        # Selected photo
        self.selected_photo = Photo.objects.create(
            event=self.event,
            uploaded_by=self.member,
            filename="selected-photo.jpg",
            storage_location="https://example.com/selected-photo.jpg",
            file_size=1000,
            is_selected=True,
        )

        # Unselected photo
        self.unselected_photo = Photo.objects.create(
            event=self.event,
            uploaded_by=self.member,
            filename="unselected-photo.jpg",
            storage_location="https://example.com/unselected-photo.jpg",
            file_size=2000,
            is_selected=False,
        )

    def authenticate(self, user):
        """
        Log in through the real JWT endpoint.
        """

        if user.role == User.Role.ADMIN:
            password = "AdminTest123"
        else:
            password = "MemberTest123"

        response = self.client.post(
            "/api/auth/login/",
            {
                "username": user.username,
                "password": password,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        access_token = response.data["access"]

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access_token}"
        )

    def create_gallery(self):
        """
        Create a gallery for Admin 1's event.
        """

        self.authenticate(self.admin)

        response = self.client.post(
            "/api/galleries/create/",
            {
                "event": self.event.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED,
        )

        return response.data

    def set_pin(self, gallery_id, pin="1234"):
        """
        Set a gallery PIN.
        """

        response = self.client.patch(
            f"/api/galleries/{gallery_id}/set-pin/",
            {
                "pin": pin,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        return response

    def test_admin_can_create_gallery(self):
        response = self.create_gallery()

        self.assertEqual(
            response["event"],
            self.event.id,
        )

        self.assertIn(
            "share_token",
            response,
        )

        gallery = Gallery.objects.get(
            event=self.event
        )

        self.assertEqual(
            gallery.created_by,
            self.admin,
        )

        self.assertFalse(
            gallery.is_published
        )

    def test_admin_can_set_gallery_pin(self):
        gallery_data = self.create_gallery()

        gallery_id = gallery_data["id"]

        self.set_pin(
            gallery_id,
            "1234",
        )

        gallery = Gallery.objects.get(
            id=gallery_id
        )

        self.assertTrue(
            gallery.pin_hash
        )

        # PIN must be stored as a hash, not plain text.
        self.assertNotEqual(
            gallery.pin_hash,
            "1234",
        )

    def test_admin_can_publish_gallery(self):
        gallery_data = self.create_gallery()

        gallery_id = gallery_data["id"]

        self.set_pin(
            gallery_id,
            "1234",
        )

        response = self.client.patch(
            f"/api/galleries/{gallery_id}/publish/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        gallery = Gallery.objects.get(
            id=gallery_id
        )

        self.assertTrue(
            gallery.is_published
        )

    def test_team_member_cannot_create_gallery(self):
        self.authenticate(self.member)

        response = self.client.post(
            "/api/galleries/create/",
            {
                "event": self.event.id,
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_team_member_cannot_publish_gallery(self):
        gallery_data = self.create_gallery()

        gallery_id = gallery_data["id"]

        self.set_pin(
            gallery_id,
            "1234",
        )

        # Switch from Admin to Team Member
        self.authenticate(self.member)

        response = self.client.patch(
            f"/api/galleries/{gallery_id}/publish/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_wrong_pin_cannot_access_gallery(self):
        gallery_data = self.create_gallery()

        gallery_id = gallery_data["id"]
        share_token = gallery_data["share_token"]

        self.set_pin(
            gallery_id,
            "1234",
        )

        response = self.client.patch(
            f"/api/galleries/{gallery_id}/publish/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        # Public access does not require authentication.
        self.client.credentials()

        response = self.client.post(
            f"/api/galleries/public/{share_token}/",
            {
                "pin": "9999",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_correct_pin_can_access_published_gallery(self):
        gallery_data = self.create_gallery()

        gallery_id = gallery_data["id"]
        share_token = gallery_data["share_token"]

        self.set_pin(
            gallery_id,
            "1234",
        )

        response = self.client.patch(
            f"/api/galleries/{gallery_id}/publish/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        # Public customer access
        self.client.credentials()

        response = self.client.post(
            f"/api/galleries/public/{share_token}/",
            {
                "pin": "1234",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        photo_ids = [
            photo["id"]
            for photo in response.data["photos"]
        ]

        # Selected photo should be visible.
        self.assertIn(
            self.selected_photo.id,
            photo_ids,
        )

        # Unselected photo should NOT be visible.
        self.assertNotIn(
            self.unselected_photo.id,
            photo_ids,
        )

    def test_unpublished_gallery_cannot_be_accessed(self):
        gallery_data = self.create_gallery()

        gallery_id = gallery_data["id"]
        share_token = gallery_data["share_token"]

        self.set_pin(
            gallery_id,
            "1234",
        )

        # Do NOT publish the gallery.

        self.client.credentials()

        response = self.client.post(
            f"/api/galleries/public/{share_token}/",
            {
                "pin": "1234",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_invalid_gallery_link_returns_404(self):
        self.client.credentials()

        response = self.client.post(
            "/api/galleries/public/this-gallery-does-not-exist/",
            {
                "pin": "1234",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_admin_cannot_manage_another_admins_gallery(self):
        # Create Admin 1's gallery
        gallery_data = self.create_gallery()

        gallery_id = gallery_data["id"]

        self.set_pin(
            gallery_id,
            "1234",
        )

        # Switch to Admin 2
        self.authenticate(self.admin2)

        response = self.client.patch(
            f"/api/galleries/{gallery_id}/publish/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

    def test_admin_can_change_gallery_pin(self):
        gallery_data = self.create_gallery()

        gallery_id = gallery_data["id"]
        share_token = gallery_data["share_token"]

        # First PIN
        self.set_pin(
            gallery_id,
            "1234",
        )

        # Change PIN
        response = self.client.patch(
            f"/api/galleries/{gallery_id}/set-pin/",
            {
                "pin": "5678",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        # Publish gallery
        response = self.client.patch(
            f"/api/galleries/{gallery_id}/publish/",
            {},
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        # Public access
        self.client.credentials()

        # Old PIN should fail
        response = self.client.post(
            f"/api/galleries/public/{share_token}/",
            {
                "pin": "1234",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

        # New PIN should work
        response = self.client.post(
            f"/api/galleries/public/{share_token}/",
            {
                "pin": "5678",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )