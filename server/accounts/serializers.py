from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    name = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already in use.",
                code="conflict"
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["name"],
            email=validated_data["email"],
            password=validated_data["password"]
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = User.objects.filter(email=email).first()

        if user is None:
            raise serializers.ValidationError(
                "Invalid email or password.",
                code="authentication_failed"
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "Account is disabled.",
                code="account_disabled"
            )

        authenticated_user = authenticate(username=user.username, password=password)

        if authenticated_user is None:
            raise serializers.ValidationError(
                "Invalid email or password.",
                code="authentication_failed"
            )

        # Store user in validated_data for view to access
        data['user'] = authenticated_user
        return data

