#include <iostream>
#include <thread>
#include <chrono>
#include "matrix.h"
#include "shtrassen.h"
#define RESULT_FILE_BLOCK "multiply_output.txt"
#define RESULT_FILE_SHTRASSEN "shtrassen_output.txt"
#define THREADS_AMOUNT 6

const int rowsA = 128, colsA = 128; // Первая матрица
const int rowsB = 128, colsB = 128; // Вторая матрица

const int BLOCK_SIZE = 64; // Размер блока

class Timer
{
public:
    Timer() : start(std::chrono::high_resolution_clock::now()) {}

    void reset()
    {
        start = std::chrono::high_resolution_clock::now();
    }

    double elapsed() const
    {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
                   std::chrono::high_resolution_clock::now() - start)
                   .count();
    }

private:
    std::chrono::high_resolution_clock::time_point start;
};


void thMultiplyMatrixBlock(const std::vector<std::vector<int>>& matrixA, const std::vector<std::vector<int>>& matrixB, std::vector<std::vector<int>>& result, std::vector<std::pair<int, int>> blockPositions) {
    for (int i = 0; i < blockPositions.size(); i++){
        for (int j = 0; j < matrixB.size(); j++) {
            result[blockPositions[i].first][blockPositions[i].second] += matrixA[blockPositions[i].first][j] * matrixB[j][blockPositions[i].second];
        }
    }
    std::cout << "блок матриц перемножен" << std::endl;
}


bool isResultMatched(const std::string& filename1, const std::string& filename2) {
    std::ifstream inputFile1(filename1);
    std::ifstream inputFile2(filename2);

    if (!inputFile1.is_open() || !inputFile2.is_open()) {
        std::cerr << "Open file err " << std::endl;
        return false;
    }

    char char1, char2;
    while (inputFile1.get(char1) && inputFile2.get(char2)) {
        if (char1 != char2) {
            return false;
        }
    }

    return !(inputFile1.get(char1) || inputFile1.get(char2)); 
};

void runMultiply()
{
    Timer timer;
    std::vector<std::vector<int>> blockResult(rowsA, std::vector<int>(colsB));
    std::vector<int> flatShtrassenResult;
    std::vector<std::thread> threads;

    

    const std::vector<std::vector<int>> matrixA = generateMatrix(rowsA, colsA);
    const std::vector<std::vector<int>> matrixB = generateMatrix(rowsB, colsB);
    const std::vector<int> flatMatrixA = flatMatrix(matrixA, rowsA, colsA);
    const std::vector<int> flatMatrixB = flatMatrix(matrixB, rowsB, colsB);
    std::cout << "матрицы сгенерированы" << std::endl;

    timer.reset();
    blockMatrixMultiply(matrixA, matrixB, blockResult, BLOCK_SIZE, rowsA, colsA, colsB);
    auto blockTime = timer.elapsed();
    std::cout<<"блочное посчитал"<<std::endl;
    timer.reset();
    shtrassenMatrixMultiply(flatMatrixA, flatMatrixB, flatShtrassenResult, rowsA, THREADS_AMOUNT);
    //flatShtrassenResult = multiplyMatricesByStrassen(matrixA, matrixB, rowsA, THREADS_AMOUNT, true);
    auto shtrasTime = timer.elapsed();
    std::cout<<"штрассен посчитал"<<std::endl;
    for (auto& th : threads) {
        th.join();
    }

    writeMatrixToFile(RESULT_FILE_BLOCK, blockResult, rowsA, colsB);
    std::cout << "блочное умножение записано в файл" << std::endl;

    writeMatrixToFile(RESULT_FILE_SHTRASSEN, fromFlatMatrix(flatShtrassenResult, rowsA, colsB), rowsA, colsB);
    std::cout << "умножение Штрассена записано в файл" << std::endl;

    std::cout << "Блочное умножение матриц заняло: " << blockTime << "мс" << std::endl;
    std::cout << "Результат находится в файле " << RESULT_FILE_BLOCK << std::endl;

    std::cout << "Умножение Штрассена заняло: " << shtrasTime << "мс" << std::endl;
    std::cout << "Результат находится в файле " << RESULT_FILE_SHTRASSEN << std::endl;

    std::cout << "Совпадение результатов умножения: "<<std::boolalpha<<isResultMatched(RESULT_FILE_BLOCK, RESULT_FILE_SHTRASSEN)<<std::endl;


}




int main(){
    runMultiply();

    return 0;
}
