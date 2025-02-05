FROM alpine:latest

# Установка необходимых пакетов
RUN apk add --no-cache g++

# Переход в рабочий каталог
WORKDIR /app

# Добавление файлов проекта в контейнер
COPY . .

# Компиляция приложения
RUN g++ main.cpp matrix.cpp -o lock_free

# Запуск приложения
CMD ["./lock_free"]