#include "matrix.h"

// Функция для генерации случайной матрицы
std::vector<std::vector<int>> generateMatrix(int rows, int cols)
{
    std::vector<std::vector<int>> matrix(rows, std::vector<int>(cols));

    // Инициализация генератора случайных чисел
    std::random_device random;
    std::default_random_engine random_engine(random());
    std::uniform_int_distribution<int> uniform_distribution(1, 10);

    for (int i = 0; i < rows; ++i)
    {
        for (int j = 0; j < cols; ++j)
        {
            matrix[i][j] = uniform_distribution(random_engine);
            ; // Заполняем случайными числами от 0 до 9
        }
    }

    return matrix;
}

// Функция для вывода матрицы в консоль
void showMatrix(const std::vector<std::vector<int>> &matrix, int rows, int cols)
{
    for (int i = 0; i < rows; ++i)
    {
        for (int j = 0; j < cols; ++j)
        {
            std::cout << matrix[i][j] << " ";
        }
        std::cout << std::endl;
    }
}

// Функция для записи матрицы в файл
void writeMatrixToFile(const std::string &filename, const std::vector<std::vector<int>> &matrix, int rows, int cols)
{
    std::ofstream file(filename);
    if (!file.is_open())
    {
        std::cerr << "Не удалось открыть файл для записи: " << filename << std::endl;
        exit(1);
    }

    for (int i = 0; i < rows; ++i)
    {
        for (int j = 0; j < cols; ++j)
        {
            file << matrix[i][j] << " ";
        }
        file << std::endl;
    }

    file.close();
}

// Функция для умножения двух матриц
std::vector<std::vector<int>> multiplyMatrices(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B, int rowsA, int colsA, int colsB)
{
    std::vector<std::vector<int>> result(rowsA, std::vector<int>(colsB, 0));

    for (int i = 0; i < rowsA; ++i)
    {
        for (int j = 0; j < colsB; ++j)
        {
            for (int k = 0; k < colsA; ++k)
            {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }

    return result;
}

// Функция для перемножения блоков
void multiplyBlock(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B, std::vector<std::vector<int>> &C,
                   int blockRow, int blockCol, int blockSize, int rowsA, int colsA, int colsB)
{
    for (int i = blockRow; i < std::min(blockRow + blockSize, rowsA); ++i)
    {
        for (int j = blockCol; j < std::min(blockCol + blockSize, colsB); ++j)
        {
            int sum = 0;
            for (int k = 0; k < colsA; ++k)
            {
                sum += A[i][k] * B[k][j];
            }
            C[i][j] += sum;
        }
    }
}

// Функция для многопоточного перемножения матриц блоками
void blockMatrixMultiply(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B, std::vector<std::vector<int>> &C, int blockSize, int rowsA, int colsA, int colsB)
{
    // Коллекция потоков
    std::vector<std::thread> threads;

    // Разбиение на блоки и запуск потоков
    for (int i = 0; i < rowsA; i += blockSize)
    {
        for (int j = 0; j < colsA; j += blockSize)
        {
            // Создаем и запускаем поток для обработки конкретного блока
            threads.push_back(std::thread(multiplyBlock, cref(A), cref(B), ref(C), i, j, blockSize, rowsA, colsA, colsB));
        }
    }

    // Ожидание завершения всех потоков
    for (auto &t : threads)
    {
        if (t.joinable())
            t.join();
    }
    threads.clear();
}