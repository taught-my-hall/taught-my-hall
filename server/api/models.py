from django.db import models
from django.contrib.auth.models import User
from django.contrib.postgres.fields import ArrayField


class Room(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rooms')
    name = models.CharField(max_length=100, unique=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return f"{self.name} (user: {self.user.username})"


class Furniture(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='furniture')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    flashcards = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} in room: {self.room.name}"