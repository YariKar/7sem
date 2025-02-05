#include <iostream>
#include <chrono>
#include "matrix/matrix.hpp"
#include "checker/checker.hpp"
#include "blocksMultiplication/blocksMultiplication.hpp"
#include "strassenMultiplication/strassenMultiplication.hpp"
#include "CTPL/ctpl_stl.h"


#define MATRIX_SIZE 1024
#define THREADS_COUNT 12
#define MAX_VALUE 10
#define BLOCKS_FILE "blocksResult.txt"
#define STRASSEN_FILE "strassenResult.txt"

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


void runMatrixMultiply(const int size, const int threadsCount) {    
    Timer timer;
    const std::vector<int> matrixA = generateMatrix(size, MAX_VALUE);
    const std::vector<int> matrixB = generateMatrix(size, MAX_VALUE);
    std::cout << "матрицы сгенерированы" << std::endl;

    timer.reset();
    std::vector<int> blocksResult = multiplyMatricesByBlocks(matrixA, matrixB, size, threadsCount);
    auto blockTime = timer.elapsed();
    std::cout<<"блочное посчитал"<<std::endl;

    ctpl::thread_pool threadPool(threadsCount);
    
    timer.reset();
    std::vector<int> strassenResult = multiplyMatricesByStrassen(matrixA, matrixB, size, &threadPool);
    auto shtrasTime = timer.elapsed();
    std::cout<<"штрассен посчитал"<<std::endl;

    writeMatrixInFile(BLOCKS_FILE, blocksResult, size);
    std::cout << "блочное умножение записано в файл" << std::endl;
    writeMatrixInFile(STRASSEN_FILE, strassenResult, size);
    std::cout << "умножение Штрассена записано в файл" << std::endl;

    std::cout << "Блочное умножение матриц заняло: " << blockTime << "мс" << std::endl;
    std::cout << "Результат находится в файле " << BLOCKS_FILE << std::endl;

    std::cout << "Умножение Штрассена заняло: " << shtrasTime << "мс" << std::endl;
    std::cout << "Результат находится в файле " << STRASSEN_FILE << std::endl;

    std::cout << "Совпадение результатов умножения: "<<std::boolalpha<<isResultMatched(BLOCKS_FILE, STRASSEN_FILE)<<std::endl;
};

void compareTestThreads()
{
    int size = 2048;
    for (int threadCount = 1; threadCount<=7; threadCount++)
    {
        std::cout<<"тест умножения при размерности: "<<size<<" количестве потоков: "<<threadCount<<std::endl;
        runMatrixMultiply(size, threadCount);
    }
}

int main(int argc, char* argv[]) {
    int size, threadsCount;
    
    if (argc == 3) {
        size = std::stoi(argv[1]); 
        threadsCount = std::stoi(argv[2]); 
    } else {
        size = MATRIX_SIZE;
        threadsCount = THREADS_COUNT;
    }

    runMatrixMultiply(size, threadsCount);
    //compareTestThreads();
    return 0;
};
