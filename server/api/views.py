from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


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
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # return only rooms that belong to the logged-in user
        user = self.request.user
        return Room.objects.filter(user=user)

    def perform_create(self, serializer):
        # always set user to request.user
        serializer.save(user=self.request.user)


    @action(detail=True, methods=["get"])
    def furniture(self, request, pk=None):
        """GET /rooms/<id>/furniture/ — allowed only if room belongs to user"""
        room = self.get_object()

        # SECURITY CHECK
        if room.user != request.user:
            return Response({"error": "Not allowed"}, status=403)

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
    
    serializer_class = FurnitureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only furniture owned by the logged-in user
        return Furniture.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Force user = request.user so no one can create furniture for someone else
        serializer.save(user=self.request.user)
   

    @action(detail=True, methods=["post"])
    def add_flashcard(self, request, pk=None):
        """
        POST /furniture/<id>/add_flashcard/
        Adds flashcard ONLY if furniture belongs to request.user
        """
        furniture = self.get_object()

        # SECURITY CHECK
        if furniture.user != request.user:
            return Response({"error": "Not allowed"}, status=403)

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
    serializer_class = FlashcardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only return flashcards belonging to the logged-in user
        return Flashcard.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign user to flashcard
        serializer.save(user=self.request.user)


    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        """
        POST /flashcards/<id>/review/
        body = {"grade": int 0-5}
        """
        card = self.get_object()
        
        # USER FILTER ENFORCEMENT
        if card.user != request.user:
            return Response({"error": "Not allowed"}, status=403)
            
        grade = request.data.get("grade")

        if grade is None:
            return Response({"error": "grade is required"}, status=400)

        try:
            grade = int(grade)
        except ValueError:
            return Response({"error": "grade must be an integer"}, status=400)

        if not (0 <= grade <= 5):
            return Response({"error": "grade must be between 0 and 5"}, status=400)

        card_data = {
            "id": card.id,
            "interval": card.interval,
            "ease_factor": card.ease_factor,
            "repetition": card.repetition,
            "next_review": card.next_review,
        }

        updated = apply_sm2(card_data, grade)
        
        from datetime import datetime
        iso_value = updated["next_review"]
        next_review_dt = datetime.fromisoformat(iso_value.replace("Z", "+00:00"))

        card.interval = updated["interval"]
        card.ease_factor = updated["ease_factor"]
        card.repetition = updated["repetition"]
        card.next_review = next_review_dt
        card.save()
        
        return Response({
            "message": "Review updated successfully",
            "flashcard": FlashcardSerializer(card).data
        }, status=200)

    @action(detail=False, methods=["get"])
    def queue(self, request):
        """
        GET /flashcards/queue/
        Optional: ?furnitureId=1
        Returns only flashcards belonging to the logged-in user.
        """
        furniture_id = request.query_params.get("furnitureId")
        now = timezone.now()
        
        cards = Flashcard.objects.filter(user=request.user)

        if furniture_id:
            cards = cards.filter(furniture_id=furniture_id)

        due_cards = cards.filter(next_review__lte=now)

        return Response(FlashcardSerializer(due_cards, many=True).data)
