from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Room
import json

def hello(request):
    return JsonResponse({'message': 'Hello world!'})

def foobar(request):
    return JsonResponse({'message': "Foobar endpoint"})

def rooms_list(request):
    """
    GET = return list of rooms
    POST = create new room
    """
    if request.method == "GET":
        rooms = Room.objects.all()
        data = [
            {
                "id": room.id,
                "name": room.name
            }
            for room in rooms
        ]
        return JsonResponse(data, safe=False)

    if request.method == "POST":
        body = json.loads(request.body)
        room = Room.objects.create(name=body["name"])
        return JsonResponse({"id": room.id, "name": room.name}, status=201)
        
@csrf_exempt
def room_detail(request, room_id):
    """
    PUT = update
    DELETE = delete
    """
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return JsonResponse({"error": "Room not found"}, status=404)

    if request.method == "PUT":
        body = json.loads(request.body)
        room.name = body.get("name", room.name)
        room.save()
        return JsonResponse({"id": room.id, "name": room.name})

    if request.method == "DELETE":
        room.delete()
        return JsonResponse({"status": "deleted"})

def room_furniture(request, room_id):
    """
    GET = return list of furniture from room
    """
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return JsonResponse({"error": "Room not found"}, status=404)

    furniture = room.furniture.all()
    data = []
    for object in furniture:
        data.append({
            "id": object.id,
            "iconUrl": None,
            "name": object.name
        })

    return JsonResponse(data, safe=False)