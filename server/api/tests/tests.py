from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from api.models import Room, Furniture, Flashcard
from django.contrib.auth.models import User


class MinimalTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create(username="test")

        self.room = Room.objects.create(
            name="Test Room",
            user=self.user
        )

        self.furniture = Furniture.objects.create(
            name="Test furniture",
            room=self.room,
            user=self.user
        )

        self.flashcard = Flashcard.objects.create(
            furniture=self.furniture,
            user=self.user,
            front="Q",
            back="A",
            interval=1,
            ease_factor=2.5,
            repetition=0
        )

    # ROOMS
    def test_room_list(self):
        url = reverse("room-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_room_create(self):
        url = reverse("room-list")
        res = self.client.post(
            url,
            {
                "name": "New test room",
                "user": self.user.id
            },
            format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    # FURNITURE
    def test_furniture_list(self):
        url = reverse("furniture-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_furniture_create(self):
        url = reverse("furniture-list")
        res = self.client.post(
            url,
            {
                "name": "New test furniture",
                "description": "",
                "room": self.room.id,
                "user": self.user.id
            },
            format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    # FLASHCARDS
    def test_flashcards_list(self):
        url = reverse("flashcards-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_flashcard_create(self):
        url = reverse("flashcards-list")
        res = self.client.post(
            url,
            {
                "front": "frontTest",
                "back": "backTest",
                "furniture": self.furniture.id,
                "user": self.user.id,
            },
            format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

