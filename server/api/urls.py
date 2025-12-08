from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, FurnitureViewSet, FlashcardViewSet

router = DefaultRouter()
router.register(r"rooms", RoomViewSet, basename="rooms")
router.register(r"furniture", FurnitureViewSet, basename="furniture")
router.register(r"flashcards", FlashcardViewSet, basename="flashcards")

urlpatterns = router.urls
