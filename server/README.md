PROJECT SETUP

1. Start the PostgreSQL database with Docker

Before running Django, make sure the PostgreSQL database is up and running.
From the server directory, start the database container:
docker-compose up -d

2. Create a virtual environment
Open a terminal in the server directory and run:
python -m venv venv

3. Then activate it:

If you get a security restriction error, run this first (On Windows PowerShell):
Set-ExecutionPolicy Unrestricted -Scope Process

Activate the virtual environment:
.\venv\Scripts\Activate.ps1

On Mac/Linux:
source venv/bin/activate

4. Install all required dependencies:
pip install django psycopg2-binary python-dotenv djangorestframework django-cors-headers

5. Set up the environment variables
Create a file named .env in the server directory based on .env.example

6. Run the database migrations
python manage.py migrate

7. Start the development server
python manage.py runserver

The backend will be available at:
http://127.0.0.1:8000/
