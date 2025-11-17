from django.shortcuts import render
from django.http import JsonResponse
from .models import Room

def hello(request):
    return JsonResponse({'message': 'Hello world!'})

def foobar(request):
    return JsonResponse({'message': "Foobar endpoint"})

def rooms_list(request):
    rooms = Room.objects.all()

    data = [
        {
            "id": room.id,
            "name": room.name
        }
        for room in rooms
    ]

    return JsonResponse(data, safe=False)
