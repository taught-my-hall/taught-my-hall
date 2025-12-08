from rest_framework import serializers
from django.contrib.auth.models import User


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True)

    def validate_email(self, data):
        if User.objects.filter(email=data["email"]).exists():
            raise serializers.ValidationError(
                {"email": "Email already in use."},
                code="conflict"
            )

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["name"],
            email=validated_data["email"],
            password=validated_data["password"]
        )
        return user