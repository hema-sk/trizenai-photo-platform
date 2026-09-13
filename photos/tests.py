from io import BytesIO

from PIL import Image
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from events.models import Event, EventMember
from photos.models import Photo


User = get_user_model()


class PhotoPermissionTests(APITestCase):

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

        # Team Member 1
        self.member = User.objects.create_user(
            username="member1",
            email="member1@test.com",
            password="MemberTest123",
            role=User.Role.TEAM_MEMBER,
        )

        # Team Member 2
        self.member2 = User.objects.create_user(
            username="member2",
            email="member2@test.com",
            password="MemberTest123",
            role=User.Role.TEAM_MEMBER,
        )

        # Admin 1's event
        self.event = Event.objects.create(
            name="Admin 1 Event",
            description="Test event",
            location="Chennai",
            event_date="2026-09-20",
            created_by=self.admin,
        )

        # Admin 2's event
        self.event2 = Event.objects.create(
            name="Admin 2 Event",
            description="Another test event",
            location="Chennai",
            event_date="2026-09-21",
            created_by=self.admin2,
        )

        # Assign member 1 to Admin 1's event
        EventMember.objects.create(
            event=self.event,
            user=self.member,
        )

        # Assign member 2 to Admin 1's event
        EventMember.objects.create(
            event=self.event,
            user=self.member2,
        )

        # Photo uploaded by member 1
        self.photo1 = Photo.objects.create(
            event=self.event,
            uploaded_by=self.member,
            filename="member1-photo.jpg",
            storage_location="https://example.com/member1-photo.jpg",
            file_size=1000,
        )

        # Photo uploaded by member 2
        self.photo2 = Photo.objects.create(
            event=self.event,
            uploaded_by=self.member2,
            filename="member2-photo.jpg",
            storage_location="https://example.com/member2-photo.jpg",
            file_size=2000,
        )

        # Photo uploaded by Admin 2 to Admin 2's event
        self.photo3 = Photo.objects.create(
            event=self.event2,
            uploaded_by=self.admin2,
            filename="admin2-photo.jpg",
            storage_location="https://example.com/admin2-photo.jpg",
            file_size=3000,
        )

    def authenticate(self, user):
        """
        Authenticate a test user using the JWT login endpoint.
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

    def create_test_image(self):
        """
        Create a real JPEG image for ImageField validation.
        """
        image_file = BytesIO()

        image = Image.new(
            "RGB",
            (100, 100),
            "white",
        )

        image.save(
            image_file,
            format="JPEG",
        )

        image_file.seek(0)

        return SimpleUploadedFile(
            "new-photo.jpg",
            image_file.read(),
            content_type="image/jpeg",
        )

    def test_member_sees_own_photos(self):
        self.authenticate(self.member)

        response = self.client.get("/api/photos/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        photo_ids = [photo["id"] for photo in response.data]

        self.assertIn(self.photo1.id, photo_ids)
        self.assertNotIn(self.photo2.id, photo_ids)

    def test_member2_does_not_see_member1_photos(self):
        self.authenticate(self.member2)

        response = self.client.get("/api/photos/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        photo_ids = [photo["id"] for photo in response.data]

        self.assertIn(self.photo2.id, photo_ids)
        self.assertNotIn(self.photo1.id, photo_ids)

    def test_admin_sees_photos_from_own_event(self):
        self.authenticate(self.admin)

        response = self.client.get("/api/photos/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        photo_ids = [photo["id"] for photo in response.data]

        self.assertIn(self.photo1.id, photo_ids)
        self.assertIn(self.photo2.id, photo_ids)
        self.assertNotIn(self.photo3.id, photo_ids)

    def test_other_admin_does_not_see_another_admin_event_photos(self):
        self.authenticate(self.admin2)

        response = self.client.get("/api/photos/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        photo_ids = [photo["id"] for photo in response.data]

        self.assertIn(self.photo3.id, photo_ids)
        self.assertNotIn(self.photo1.id, photo_ids)
        self.assertNotIn(self.photo2.id, photo_ids)

    def test_unassigned_team_member_cannot_upload_to_event(self):
        # Create a third team member who is NOT assigned to the event
        unassigned_member = User.objects.create_user(
            username="unassigned",
            email="unassigned@test.com",
            password="MemberTest123",
            role=User.Role.TEAM_MEMBER,
        )

        self.authenticate(unassigned_member)

        uploaded_image = self.create_test_image()

        response = self.client.post(
            "/api/photos/upload/",
            {
                "event": self.event.id,
                "image": uploaded_image,
            },
            format="multipart",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_403_FORBIDDEN,
        )

    def test_member_can_delete_own_photo(self):
        self.authenticate(self.member)

        response = self.client.delete(
            f"/api/photos/{self.photo1.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_204_NO_CONTENT,
        )

        self.assertFalse(
            Photo.objects.filter(id=self.photo1.id).exists()
        )

    def test_member2_cannot_delete_member1_photo(self):
        self.authenticate(self.member2)

        response = self.client.delete(
            f"/api/photos/{self.photo1.id}/"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND,
        )

        self.assertTrue(
            Photo.objects.filter(id=self.photo1.id).exists()
        )

    def test_unauthenticated_user_cannot_view_photos(self):
        response = self.client.get("/api/photos/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )