FROM nvidia/opengl:1.0-glvnd-runtime-ubuntu20.04

ENV TZ=Europe/Moscow
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone


# Обновляем систему и устанавливаем необходимые пакеты
RUN apt-get update && \
    apt-get install -y build-essential cmake ocl-icd-opencl-dev
RUN apt-get -y install sudo
RUN apt-get install -y opencl-headers




# Копирование исходников в контейнер
COPY . /app
WORKDIR /app


# Компиляция программы
RUN g++ -std=c++17 -o gpu_multiply main.cpp matrix/matrix.cpp -lOpenCL
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility,display
# Запуск программы при старте контейнера
CMD ["/app/gpu_multiply"]

