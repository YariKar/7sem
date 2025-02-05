#include <iostream>
#include <thread>
#include <chrono>
#include "matrix_operations.h"

#define RESULT_FILE "thread_output.txt"


void setDefaultMatricesParams(int& rowsA, int& columnsA, int& rowsB, int& columnsB, int& maxValue) {
    rowsA = 20;
    columnsA = rowsB = 40;
    columnsB = 20;
    maxValue = 10;
}


void generateMatrixThread(std::vector<std::vector<int>>& matrixA, std::vector<std::vector<int>>& matrixB, int maxValue) {
    matrixA = generateMatrix(matrixA.size(), matrixA[0].size(), maxValue);
    matrixB = generateMatrix(matrixB.size(), matrixB[0].size(), maxValue);
    std::cout << "матрицы сгенерированы" << std::endl;
}


void multiplyMatrixThread(const std::vector<std::vector<int>>& matrixA, const std::vector<std::vector<int>>& matrixB, std::vector<std::vector<int>>& result, int rowsA, int colsA, int colsB) {
    result = multiplyMatrices(matrixA, matrixB, rowsA, colsA, colsB);
    std::cout << "матрицы перемножены" << std::endl;
}


void writeMatrixInFileThread(const std::vector<std::vector<int>>& result, int rows, int cols) {
    writeMatrixToFile(RESULT_FILE, result, rows, cols);
    std::cout << "матрицы записаны в файл" << std::endl;
}


int main(){
    int rowsA, columnsA, rowsB, columnsB, maxValue;
    setDefaultMatricesParams(rowsA, columnsA, rowsB, columnsB, maxValue);
    std::vector<std::vector<int>> matrixA(rowsA, std::vector<int>(columnsA)), matrixB(rowsB, std::vector<int>(columnsB)), result(rowsA, std::vector<int>(columnsB));
    
    auto timer_start = std::chrono::high_resolution_clock::now();

    std::thread th1(generateMatrixThread, std::ref(matrixA), std::ref(matrixB), maxValue);
    th1.join();
    
    std::thread th2(multiplyMatrixThread, std::ref(matrixA), std::ref(matrixB), std::ref(result),rowsA, columnsA,columnsB);
    th2.join();

    std::thread th3(writeMatrixInFileThread, std::ref(result), rowsA, columnsB);
    th3.join();

    auto timer_stop = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> elapsed = timer_stop - timer_start;

    std::cout << "Перемножение матриц заняло " << elapsed.count() << "мс" << std::endl;
    std::cout << "Результат находится в файле " << RESULT_FILE << std::endl;

    return 0;
}
