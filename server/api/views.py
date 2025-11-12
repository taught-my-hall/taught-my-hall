from django.shortcuts import render
from django.http import JsonResponse

def hello(request):
    return JsonResponse({'message': 'Hello world!'})

def foobar(request):
    return JsonResponse({'message': "Foobar endpoint"})