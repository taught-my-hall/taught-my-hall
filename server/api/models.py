from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
from django.db import models
from django.utils import timezone


class UserPalace(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, # If the user is deleted, all their palaces are deleted as well
        related_name='palaces' 
    )

    name = models.CharField(max_length=100)
    palace_matrix = models.TextField(null=True, blank=True) 
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} (user: {self.user.username})"

class PalaceTemplate(models.Model):
    name = models.CharField(max_length=255)
    palace_matrix = models.TextField()  # JSON string [][]
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Furniture(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="user_furniture"
    )
    palace = models.ForeignKey(
        UserPalace,
        on_delete=models.CASCADE,
        related_name="furniture",
        null=True,
        blank=True
    )

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} in palace: {self.palace.name}"


class Flashcard(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="flashcards")
    furniture = models.ForeignKey(Furniture, on_delete=models.CASCADE, related_name='flashcards')

    front = models.TextField()
    back = models.TextField()
    icon_name = models.CharField(max_length=100, null=True, blank=True)

    furniture_slot_index = models.IntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(8)]
    )

    interval = models.IntegerField(default=1)
    ease_factor = models.FloatField(default=2.5)
    repetition = models.IntegerField(default=0)
    next_review = models.DateTimeField(default=timezone.now)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["furniture", "furniture_slot_index"],
                name="unique_flashcard_slot_per_furniture"
            )
        ]

    def __str__(self):
        return f"{self.front[:30]}..."

