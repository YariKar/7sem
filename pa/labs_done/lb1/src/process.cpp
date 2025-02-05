#include <iostream>
#include <unistd.h>
#include <sys/wait.h>
#include <chrono>
#include "matrix_operations.h"

std::string output_file = "process_output.txt";

// Преобразуем двумерный вектор в одномерный массив для передачи через pipe
std::vector<int> makeFlatMatrix(std::vector<std::vector<int>> volumetricMatrix, int rows, int cols)
{
    std::vector<int> flatMatrix;
    for (int i = 0; i < rows; ++i)
    {
        for (int j = 0; j < cols; ++j)
        {
            flatMatrix.push_back(volumetricMatrix[i][j]);
        }
    }
    return flatMatrix;
}

// Преобразуем одномерный массив обратно в двумерный вектор
std::vector<std::vector<int>> makeVolumetricMatrix(std::vector<int> flatMatrix, int rows, int cols)
{
    std::vector<std::vector<int>> volumetricMatrix(rows, std::vector<int>(cols));
    for (int i = 0; i < rows; ++i)
    {
        for (int j = 0; j < cols; ++j)
        {
            volumetricMatrix[i][j] = flatMatrix[i * cols + j];
        }
    }
    return volumetricMatrix;
}

void generateMatrixProcess(int pipe1_write, int rowsA, int colsA, int rowsB, int colsB)
    {
        const int maxValue = 10;
        std::vector<std::vector<int>> A = generateMatrix(rowsA, colsA, maxValue);
        std::vector<std::vector<int>> B = generateMatrix(rowsB, colsB, maxValue);

        std::vector<int> flatA = makeFlatMatrix(A, rowsA, colsA);
        std::vector<int> flatB = makeFlatMatrix(B, rowsB, colsB);

        write(pipe1_write, flatA.data(), flatA.size() * sizeof(int));
        write(pipe1_write, flatB.data(), flatB.size() * sizeof(int));

        close(pipe1_write);
    }


    void multiplyMatrixProcess(int pipe1_read, int pipe2_write, int rowsA, int colsA, int rowsB, int colsB)
    {
        std::vector<int> flatA(rowsA * colsA);
        std::vector<int> flatB(rowsB * colsB);

        read(pipe1_read, flatA.data(), flatA.size() * sizeof(int));
        read(pipe1_read, flatB.data(), flatB.size() * sizeof(int));

        std::vector<std::vector<int>> A = makeVolumetricMatrix(flatA, rowsA, colsA);
        std::vector<std::vector<int>> B = makeVolumetricMatrix(flatB, rowsB, colsB);

        std::vector<std::vector<int>> C = multiplyMatrices(A, B, rowsA, colsA, colsB);

        std::vector<int> flatC = makeFlatMatrix(C, rowsA, colsB);
        write(pipe2_write, flatC.data(), flatC.size() * sizeof(int));

        close(pipe1_read);
        close(pipe2_write);
    }

    void writeMatrixProcess(int pipe2_read, int rowsC, int colsC)
    {
        std::vector<int> flatC(rowsC * colsC);

        read(pipe2_read, flatC.data(), flatC.size() * sizeof(int));
        std::vector<std::vector<int>> C = makeVolumetricMatrix(flatC, rowsC, colsC);

        std::string fileResult = output_file;
        writeMatrixToFile(fileResult, C, rowsC, colsC);

        close(pipe2_read);
    }


int main()
{
    int pipe1[2], pipe2[2];

    int rowsA = 20;
    int colsA = 40;
    int rowsB = 40;
    int colsB = 20;

    if (pipe(pipe1) == -1 || pipe(pipe2) == -1)
    {
        perror("pipe");
        return 1;
    }

    auto timer_start = std::chrono::high_resolution_clock::now();

    pid_t pid1 = fork();
    if (pid1 == 0)
    {
        close(pipe1[0]);
        generateMatrixProcess(pipe1[1], rowsA, colsA, rowsB, colsB);
        return 0;
    }

    pid_t pid2 = fork();
    if (pid2 == 0)
    {
        close(pipe1[1]);
        close(pipe2[0]);
        multiplyMatrixProcess(pipe1[0], pipe2[1], rowsA, colsA, rowsB, colsB);
        return 0;
    }

    pid_t pid3 = fork();
    if (pid3 == 0)
    {
        close(pipe2[1]);
        writeMatrixProcess(pipe2[0], rowsA, colsB);
        return 0;
    }

    close(pipe1[0]);
    close(pipe1[1]);
    close(pipe2[0]);
    close(pipe2[1]);

    wait(nullptr);
    wait(nullptr);
    wait(nullptr);

    auto end = std::chrono::high_resolution_clock::now();

    auto timer_stop = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = timer_stop - timer_start;

    std::cout << "Перемножение матриц заняло: " << elapsed.count() << "мс" << std::endl;
    std::cout << "Результат находится в файле "<< output_file << std::endl;



    return 0;
}