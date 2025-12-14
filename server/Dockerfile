FROM python:3.12

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

RUN SECRET_KEY=nothing_secure_is_needed_for_build python manage.py collectstatic --noinput

CMD exec gunicorn --bind 0.0.0.0:$PORT --workers 1 --threads 8 --timeout 0 memory_palace.wsgi:application