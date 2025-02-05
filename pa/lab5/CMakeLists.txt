cmake_minimum_required(VERSION 3.10)

# Название проекта
project(OpenCLApp)

# Установка стандарта C++
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Источники
set(SOURCES src/main.cpp)

# Подключение OpenCL
find_package(OpenCL REQUIRED)
include_directories(${OpenCL_INCLUDE_DIRS})
link_directories(${OpenCL_LIBRARY})

# Добавление файла ядра
set(KERNEL_FILE "${CMAKE_CURRENT_SOURCE_DIR}/src/block_matrix_multiply.cl")
configure_file(${KERNEL_FILE} ${CMAKE_CURRENT_BINARY_DIR}/src/block_matrix_multiply.cl COPYONLY)

# Создание исполняемого файла
add_executable(OpenCLApp ${SOURCES})

# Линковка с OpenCL
target_link_libraries(OpenCLApp ${OpenCL_LIBRARIES})
