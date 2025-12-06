from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import validate_email

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True)
    repeatPassword = serializers.CharField(write_only=True)

    def validate(self, data):
        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError(
                {"email": "Email already in use."},
                code="conflict"
            )

        if data["password"] != data["repeatPassword"]:
            raise serializers.ValidationError(
                {"password": "Passwords do not match."}
            )

        return data

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["name"],
            email=validated_data["email"],
            password=validated_data["password"]
        )
        return user