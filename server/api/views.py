from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny


from django.utils import timezone

from .models import Room, Furniture, Flashcard
from .serializers import RoomSerializer, FurnitureSerializer, FlashcardSerializer
from .services.spaced_repetition import apply_sm2


class RoomViewSet(viewsets.ModelViewSet):
    """
    GET /rooms/
        - Returns a list of all rooms.

    GET /rooms/<id>/
        - Returns a single room with its details.

    POST /rooms/
        - Creates a new room.

    PUT /rooms/<id>/
        - Updates an existing room

    DELETE /rooms/<id>/
        - Deletes a room.
    """
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["get"])
    def furniture(self, request, pk=None):
        """GET /rooms/<id>/furniture/"""
        room = self.get_object()
        items = room.furniture.all()
        return Response(FurnitureSerializer(items, many=True).data)


class FurnitureViewSet(viewsets.ModelViewSet):
    """
    GET /furniture/
        - Returns a list of all furniture.

    GET /furniture/<id>/
        - Returns a single furniture item.

    POST /furniture/
        - Creates a new furniture item.

    PUT /furniture/<id>/
        - Updates all fields of a furniture item.

    DELETE /furniture/<id>/
        - Deletes a furniture item.
    """
    queryset = Furniture.objects.all()
    serializer_class = FurnitureSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["post"])
    def add_flashcard(self, request, pk=None):
        """
        POST /furniture/<id>/add_flashcard/
        """
        furniture = self.get_object()
        serializer = FlashcardSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(
                furniture=furniture,
                user=request.user,
            )
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)


class FlashcardViewSet(viewsets.ModelViewSet):
    """
    GET /flashcards/
        - Returns all flashcards.

    GET /flashcards/<id>/
        - Returns a single flashcard.

    POST /flashcards/
        - Creates a new flashcard.

    PUT /flashcards/<id>/
        - Updates all fields of a flashcard.

    DELETE /flashcards/<id>/
        - Deletes a flashcard.
    """
    queryset = Flashcard.objects.all()
    serializer_class = FlashcardSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        """
        POST /flashcards/<id>/review/
        body = {"grade": int 0-5}
        """
        card = self.get_object()
        grade = request.data.get("grade")

        if grade is None or not (0 <= int(grade) <= 5):
            return Response({"error": "grade must be 0-5"}, status=400)

        card_data = {
            "id": card.id,
            "interval": card.interval,
            "ease_factor": card.ease_factor,
            "repetition": card.repetition,
            "next_review": card.next_review,
        }

        updated = apply_sm2(card_data, int(grade))

        # Save updated SM-2 fields
        card.interval = updated["interval"]
        card.ease_factor = updated["ease_factor"]
        card.repetition = updated["repetition"]
        card.next_review = updated["next_review"]
        card.save()

        return Response(FlashcardSerializer(card).data)

    @action(detail=False, methods=["get"])
    def queue(self, request):
        """
        GET /flashcards/queue/
        Optional: ?furnitureId=1
        """
        furniture_id = request.query_params.get("furnitureId")
        now = timezone.now()

        if furniture_id:
            cards = Flashcard.objects.filter(furniture_id=furniture_id)
        else:
            cards = Flashcard.objects.all()

        due_cards = cards.filter(next_review__lte=now)

        return Response(FlashcardSerializer(due_cards, many=True).data)
