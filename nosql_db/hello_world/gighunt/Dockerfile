# Dockerfile

FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml poetry.lock ./

RUN pip install --no-cache-dir poetry==1.8.5 && poetry install --no-root

COPY . .

CMD ["poetry", "run", "python", "gighunt/app.py"]
