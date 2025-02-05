FROM alpine:latest

# Установка необходимых пакетов
RUN apk add --no-cache g++

# Переход в рабочий каталог
WORKDIR /app

# Добавление файлов проекта в контейнер
COPY . .

# Компиляция приложения
RUN g++ main.cpp matrix/matrix.cpp strassenMultiplication/strassenMultiplication.cpp checker/checker.cpp blocksMultiplication/blocksMultiplication.cpp -o multiply

# Запуск приложения
CMD ["./multiply"]