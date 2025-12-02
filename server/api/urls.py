from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello),
    path('foobar/', views.foobar),
    path('rooms/', views.rooms_list),
    path('rooms/<int:room_id>/', views.room_detail),
    path('rooms/<int:room_id>/furniture/', views.room_furniture),
    path('furniture/', views.furniture_list),
    path('furniture/<int:furniture_id>/', views.furniture_detail),
    path("review/", views.review_flashcard),
    path("review/queue/", views.review_queue),
    path("questions/", views.flashcard_list),
    path("questions/<int:card_id>/", views.flashcard_detail),
]
