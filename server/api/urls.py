from django.urls import path
from . import views

urlpatterns = [
    path('hello/', views.hello),
    path('foobar/', views.foobar),
    path('rooms/', views.rooms_list),
    path('rooms/<int:room_id>/', views.room_detail),
    path('rooms/<int:room_id>/furniture/', views.room_furniture),
]
