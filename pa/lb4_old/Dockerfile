FROM alpine:latest

# Установка необходимых пакетов
RUN apk add --no-cache g++

# Переход в рабочий каталог
WORKDIR /app

# Добавление файлов проекта в контейнер
COPY . .

# Компиляция приложения
RUN g++ main.cpp matrix.cpp shtrassen.cpp -o block_multiply

# Запуск приложения
CMD ["./block_multiply"]

ENTRYPOINT ["tail", "-f", "/dev/null"]