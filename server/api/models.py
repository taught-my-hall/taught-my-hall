from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Room(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rooms')

    name = models.CharField(max_length=100, unique=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (user: {self.user.username})"


class Furniture(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="furniture")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='furniture')

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} in room: {self.room.name}"


class Flashcard(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="flashcards")
    furniture = models.ForeignKey(Furniture, on_delete=models.CASCADE, related_name='flashcards')

    front = models.TextField()
    back = models.TextField()
    interval = models.IntegerField(default=1)
    ease_factor = models.FloatField(default=2.5)
    repetition = models.IntegerField(default=0)
    next_review = models.DateTimeField(default=timezone.now)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.front[:30]}..."