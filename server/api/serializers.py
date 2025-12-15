from rest_framework import serializers
from .models import UserPalace, PalaceTemplate, Furniture, Flashcard
import json



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
            "id", "user", "palace", "name", "description",
            "created_at", "updated_at", "flashcards"
        ]


class UserPalaceSerializer(serializers.ModelSerializer):
    furniture = FurnitureSerializer(many=True, read_only=True)
    palace_matrix = serializers.JSONField(required=False)

    class Meta:
        model = UserPalace
        fields = [
            "id", "user", "name", "palace_matrix",
            "created_at", "updated_at", "furniture"
        ]
        read_only_fields = ("id", "created_at", "updated_at", "user")

    def create(self, validated_data):
        matrix = validated_data.get("palace_matrix")
        if matrix is not None:
            validated_data["palace_matrix"] = json.dumps(matrix)
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.palace_matrix:
            data["palace_matrix"] = json.loads(instance.palace_matrix)
        return data

class PalaceTemplateSerializer(serializers.ModelSerializer):
    palace_matrix = serializers.JSONField()

    class Meta:
        model = PalaceTemplate
        fields = ["id", "name", "palace_matrix", "created_at"]
        read_only_fields = ("id", "created_at")

    def create(self, validated_data):
        validated_data["palace_matrix"] = json.dumps(validated_data["palace_matrix"])
        return super().create(validated_data)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["palace_matrix"] = json.loads(instance.palace_matrix)
        return data
