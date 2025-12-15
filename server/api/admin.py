from django.contrib import admin
from .models import UserPalace, PalaceTemplate, Furniture, Flashcard

admin.site.register(UserPalace)
admin.site.register(PalaceTemplate)
admin.site.register(Furniture)
admin.site.register(Flashcard)
