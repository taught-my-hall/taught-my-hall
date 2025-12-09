from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import connection

class Command(BaseCommand):
    help = "Seed a default user with id=1 using Django's built-in User model"

    def handle(self, *args, **kwargs):
        # If user with id=1 already exists — do nothing
        if User.objects.filter(id=1).exists():
            self.stdout.write(self.style.WARNING("User with id=1 already exists."))
            return

        # Create user normally (Django hashes the password)
        temp_user = User.objects.create_user(
            username="sampleuser",
            email="sample@example.com",
            password="password123"
        )

        # Force ID=1 by SQL update — allowed only in seed scripts
        with connection.cursor() as cursor:
            cursor.execute("UPDATE auth_user SET id = 1 WHERE id = %s", [temp_user.id])

        # Fix Postgres sequence so future users get correct IDs
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT setval(pg_get_serial_sequence('auth_user', 'id'), "
                "(SELECT MAX(id) FROM auth_user))"
            )

        self.stdout.write(self.style.SUCCESS("User with id=1 successfully created."))
