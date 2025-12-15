from rest_framework.routers import DefaultRouter
from .views import UserPalaceViewSet, FurnitureViewSet, FlashcardViewSet

router = DefaultRouter()
router.register(r'palaces', UserPalaceViewSet, basename='palace')
router.register(r"furniture", FurnitureViewSet, basename="furniture")
router.register(r"flashcards", FlashcardViewSet, basename="flashcards")

urlpatterns = router.urls
