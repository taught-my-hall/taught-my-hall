import re
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import json
from django.db import transaction
from rest_framework import status

from django.utils import timezone

from .models import UserPalace, PalaceTemplate, Furniture, Flashcard
from .serializers import UserPalaceSerializer, FurnitureSerializer, FlashcardSerializer
from .services.spaced_repetition import apply_sm2

CELL_RE = re.compile(r"^(?P<room>\d+?)_(?P<payload>[^_]+?)_$")

def normalize_frontend_cell(cell: str, *, user, palace):
    if cell is None:
        return None

    if not isinstance(cell, str):
        return None

    s = cell.strip()

    # tiles like "1_" "0_" "2_"
    if re.fullmatch(r"\d+_", s):
        return s

    m = CELL_RE.match(s)
    if not m:
        return None

    room = m.group("room")
    payload = m.group("payload")

    # already "room_<id>_"
    if payload.isdigit():
        return f"{room}_{payload}_"

    # "room_<name>_" -> create furniture and return "room_<newId>_"
    furniture = Furniture.objects.create(
        user=user,
        palace=palace,        
        name=payload,
        description="",
    )
    return f"{room}_{furniture.id}_"



class UserPalaceViewSet(viewsets.ModelViewSet):
    """
    GET /palaces/
        - Returns a list of all palaces.

    GET /palaces/<id>/
        - Returns a single palace with its details.

    POST /palaces/
        - Creates a new palace.

    PUT /palaces/<id>/
        - Updates an existing palace

    DELETE /palaces/<id>/
        - Deletes a palace.
    """
    serializer_class = UserPalaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # return only palaces that belong to the logged-in user
        user = self.request.user
        return UserPalace.objects.filter(user=user).order_by("created_at", "id")

    def perform_create(self, serializer):
        # always set user to request.user
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data.get("name")
        matrix = serializer.validated_data.get("palace_matrix")

        with transaction.atomic():
            palace = UserPalace.objects.create(
                user=request.user,
                name=name
            )

            if matrix is not None:
                for r, row in enumerate(matrix):
                    for c, cell in enumerate(row):
                        matrix[r][c] = normalize_frontend_cell(
                            cell,
                            user=request.user,
                            palace=palace
                        )

            if matrix is not None:
                palace.palace_matrix = json.dumps(matrix)
                palace.save(update_fields=["palace_matrix"])


        output = self.get_serializer(palace)
        return Response(output.data, status=status.HTTP_201_CREATED)


    def update(self, request, *args, **kwargs):
        palace = self.get_object()  

        serializer = self.get_serializer(palace, data=request.data)  
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data.get("name")
        matrix = serializer.validated_data.get("palace_matrix")

        if matrix is not None and not isinstance(matrix, list):
            return Response({"error": "palace_matrix must be a 2D array"}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            if name is not None:
                palace.name = name


            if matrix is not None:
                for r, row in enumerate(matrix):
                    for c, cell in enumerate(row):
                        matrix[r][c] = normalize_frontend_cell(
                            cell,
                            user=request.user,
                            palace=palace
                        )

                palace.palace_matrix = json.dumps(matrix)


            palace.save()

        output = self.get_serializer(palace)
        return Response(output.data, status=status.HTTP_200_OK)




    @action(detail=True, methods=["get"])
    def furniture(self, request, pk=None):
        """
        GET /palaces/<id>/furniture/
        Returns furniture only if the palace belongs to the logged-in user
        """
        palace = self.get_object()

        # SECURITY CHECK
        if palace.user != request.user:
            return Response({"error": "Not allowed"}, status=403)

        items = palace.furniture.all()
        return Response(FurnitureSerializer(items, many=True).data)
    
    @action(detail=True, methods=["get"], url_path="flashcards")
    def flashcards(self, request, pk=None):
        """
        GET /palaces/<id>/flashcards/?onlyInReview=true|false

        Returns all user's flashcards from given palace.
        If onlyInReview=true -> returns only cards due for review (next_review <= now).
        """
        palace = self.get_object()

        only_in_review = request.query_params.get("onlyInReview", "false").lower() == "true"
        now = timezone.now()

        qs = Flashcard.objects.filter(
            user=request.user,
            furniture__palace=palace,
        )
        
        if only_in_review:
            qs = qs.filter(next_review__lte=now)

        qs = qs.order_by("next_review", "id")

        return Response(FlashcardSerializer(qs, many=True).data, status=status.HTTP_200_OK)


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

    GET /furniture/<id>/flashcards/
        - Returns all flashcards belonging to this furniture.

    POST /furniture/<id>/add_flashcard/
        - Creates a new flashcard for this furniture.
    """
    
    serializer_class = FurnitureSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only furniture owned by the logged-in user
        return Furniture.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        furniture = self.get_object()   # furnitureId z URL
        serializer.save(
            furniture=furniture,
            user=self.request.user
        )


    @action(detail=True, methods=["post"], url_path="flashcards")
    def add_flashcard(self, request, pk=None):
        """
        POST /furniture/<id>/flashcard/
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

    @action(detail=True, methods=["get"])
    def flashcards(self, request, pk=None):
        """
        GET /furniture/<id>/flashcards/
        Returns all flashcards associated with this specific furniture.
        """
        furniture = self.get_object()  # This checks user permission automatically via get_queryset

        # Fetch flashcards linked to this furniture
        cards = Flashcard.objects.filter(furniture=furniture)

        return Response(FlashcardSerializer(cards, many=True).data)



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
        # Return only flashcards owned by the authenticated user,
        # ordered by next scheduled review (earliest first)   
        return Flashcard.objects.filter(user=self.request.user).order_by("next_review", "id")


    def perform_create(self, serializer):
        # Automatically assign user to flashcard
        serializer.save(user=self.request.user)


    @action(detail=True, methods=["post"])
    def review(self, request, pk=None):
        """
        POST /flashcards/<id>/review/
        Body: {"grade": 0–5}
        """
        card = self.get_object()
        
        # USER FILTER ENFORCEMENT
        if card.user != request.user:
            return Response({"error": "Not allowed"}, status=403)
            
        # Validate input
        grade = request.data.get("grade")
        if grade is None:
            return Response({"error": "grade is required"}, status=400)

        try:
            grade = int(grade)
        except ValueError:
            return Response({"error": "grade must be an integer"}, status=400)

        if not (0 <= grade <= 5):
            return Response({"error": "grade must be between 0 and 5"}, status=400)

        # Prepare card data for SM2
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

        # Save updated values
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

        due_cards = cards.filter(next_review__lte=now).order_by("next_review", "id")

        return Response(FlashcardSerializer(due_cards, many=True).data)
