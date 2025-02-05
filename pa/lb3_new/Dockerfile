FROM alpine:latest

# Установка необходимых пакетов
RUN apk add --no-cache g++

COPY . /app
WORKDIR /app

# Компиляция приложения
RUN g++ main.cpp -o lock_free

# Запуск приложения
CMD ["/app/lock_free"]