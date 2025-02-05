#include <iostream>
#include <thread>
#include <chrono>
#include "matrix_operations.h"

#define RESULT_FILE "multiply_output.txt"
#define THREADS_AMOUNT 2


void setDefaultMatricesParams(int& rowsA, int& columnsA, int& rowsB, int& columnsB, int& maxValue) {
    rowsA = 500;
    columnsA = rowsB = 500;
    columnsB = 500;
    maxValue = 10;
}


void thMultiplyMatrixBlock(const std::vector<std::vector<int>>& matrixA, const std::vector<std::vector<int>>& matrixB, std::vector<std::vector<int>>& result, std::vector<std::pair<int, int>> blockPositions) {
    for (int i = 0; i < blockPositions.size(); i++){
        for (int j = 0; j < matrixB.size(); j++) {
            result[blockPositions[i].first][blockPositions[i].second] += matrixA[blockPositions[i].first][j] * matrixB[j][blockPositions[i].second];
        }
    }
    std::cout << "блок матриц перемножен" << std::endl;
}


int main(){
    int rowsA, columnsA, rowsB, columnsB, maxValue;
    setDefaultMatricesParams(rowsA, columnsA, rowsB, columnsB, maxValue);
    std::vector<std::vector<int>> result(rowsA, std::vector<int>(columnsB));
    std::vector<std::thread> threads;

    auto timer_start = std::chrono::high_resolution_clock::now();

    const std::vector<std::vector<int>> matrixA = generateMatrix(rowsA, columnsA, maxValue);
    const std::vector<std::vector<int>> matrixB = generateMatrix(rowsB, columnsB, maxValue);
    std::cout << "матрицы сгенерированы" << std::endl;
    
    // multiplication
    int blockSize = std::ceil((double)rowsA * columnsB / THREADS_AMOUNT);
    std::cout << "размер блока = " << blockSize << std::endl;
    std::vector<std::pair<int,int>> blockPositions;
    for (int i = 0; i < rowsA; i++) {
        for (int j = 0; j < columnsB; j++) {
            blockPositions.emplace_back(std::pair<int, int>(i,j));
            if (blockPositions.size() == blockSize || (i + 1 == rowsA && j + 1 == columnsB)) {
                threads.emplace_back(std::thread(thMultiplyMatrixBlock, std::ref(matrixA), std::ref(matrixB), std::ref(result), blockPositions));
                blockPositions.clear();
            }
        }
    }

    for (auto& th : threads) {
        th.join();
    }

    writeMatrixToFile(RESULT_FILE, result, rowsA, columnsB);
    std::cout << "матрицы записаны в файл" << std::endl;

    auto timer_stop = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = timer_stop - timer_start;

    std::cout << "Перемножение матриц заняло: " << elapsed.count() << "мс" << std::endl;
    std::cout << "Результат находится в файле " << RESULT_FILE << std::endl;

    return 0;
}
