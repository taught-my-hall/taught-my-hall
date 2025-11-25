# Project Setup

## 1. Create `.env`

Copy `.env.example` to `.env` and fill in required values:

```bash
cp .env.example .env
```

---

## 2. Start the project

Build images, start database, apply migrations, and launch Django:

```bash
docker-compose up --build
```

* Django will apply migrations automatically.
* Development server runs at:

```
http://127.0.0.1:8000/
```

---

## 3. Optional commands

* Run migrations manually:

```bash
docker-compose exec web python manage.py migrate --noinput
```

* Stop the project:

```bash
docker-compose down -v
```

* Restart project after stopping (without rebuilding, if Dockerfile didn't change):

```bash
docker-compose up
```

* Rebuild and restart (needed if Dockerfile or requirements changed):

```bash
docker-compose up --build
```

---

## Notes

* Code changes in the project folder are reflected inside the container automatically.
* Use **HTTP** (not HTTPS) to access the development server.
* This setup is for development.
