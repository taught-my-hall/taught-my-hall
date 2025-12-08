from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer
from rest_framework_simplejwt.tokens import AccessToken


class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            # If email is already in use return HTTP_409
            if "email" in serializer.errors:
                return Response(serializer.errors, status=status.HTTP_409_CONFLICT)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        token  = AccessToken.for_user(user)

        return Response(
        {
                "message": "User created",
                "token": str(token)
            },
            status=status.HTTP_201_CREATED
        )
