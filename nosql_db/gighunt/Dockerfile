FROM python:3.12-slim

WORKDIR /app

COPY . .

RUN pip install --no-cache-dir poetry==1.8.5 && poetry install

CMD ["poetry", "run", "start-backend"]
