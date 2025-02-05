#include "matrix_operations.h"


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

std::vector<std::vector<int>> generateMatrix(int rows, int cols, const int maxValue)
{
    std::vector<std::vector<int>> matrix(rows, std::vector<int>(cols));

    std::random_device random;
    std::default_random_engine random_engine(random());
    std::uniform_int_distribution<int> uniform_distribution(-maxValue, maxValue);

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