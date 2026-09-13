from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status


User = get_user_model()


class AuthenticationTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin_test",
            email="admin@test.com",
            password="AdminTest123",
            role=User.Role.ADMIN,
        )

        self.team_member = User.objects.create_user(
            username="member_test",
            email="member@test.com",
            password="MemberTest123",
            role=User.Role.TEAM_MEMBER,
        )

    def test_team_member_cannot_register_as_admin(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "username": "new_admin",
                "email": "newadmin@test.com",
                "password": "NewAdmin123",
                "role": "ADMIN",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(username="new_admin")

        self.assertEqual(
            user.role,
            User.Role.TEAM_MEMBER,
        )

    def test_admin_login(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "admin_test",
                "password": "AdminTest123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_team_member_login(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "member_test",
                "password": "MemberTest123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

    def test_invalid_login_fails(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "admin_test",
                "password": "WrongPassword123",
            },
            format="json",
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_unauthenticated_user_cannot_access_me(self):
        response = self.client.get("/api/auth/me/")

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

    def test_authenticated_user_can_access_me(self):
        response = self.client.post(
            "/api/auth/login/",
            {
                "username": "member_test",
                "password": "MemberTest123",
            },
            format="json",
        )

        access_token = response.data["access"]

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {access_token}"
        )

        response = self.client.get("/api/auth/me/")

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK,
        )

        self.assertEqual(
            response.data["username"],
            "member_test",
        )

        self.assertEqual(
            response.data["role"],
            "TEAM_MEMBER",
        )