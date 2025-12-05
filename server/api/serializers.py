from rest_framework import serializers
from .models import Room, Furniture, Flashcard


class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = [
            "id", "user", "furniture", "front", "back", "interval", "ease_factor",
            "repetition", "next_review", "created_at", "updated_at"
        ]
        read_only_fields = ("id", "created_at", "updated_at")


class FurnitureSerializer(serializers.ModelSerializer):
    flashcards = FlashcardSerializer(many=True, read_only=True)

    class Meta:
        model = Furniture
        fields = [
            "id", "user", "room", "name", "description",
            "created_at", "updated_at", "flashcards"
        ]


class RoomSerializer(serializers.ModelSerializer):
    furniture = FurnitureSerializer(many=True, read_only=True)

    class Meta:
        model = Room
        fields = [
            "id", "user", "name",
            "created_at", "updated_at", "furniture"
        ]