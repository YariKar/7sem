#include "blocksMultiplication.hpp"
#include <cmath>


void thMultiplyMatrixBlock(const std::vector<int>& matrixA, const std::vector<int>& matrixB, std::vector<int>& result, std::vector<std::pair<int, int>> blockPositions, const int size) {
    for (const auto& pos : blockPositions) {
        int row = pos.first;
        int col = pos.second;

        int sum = 0;
        for (int k = 0; k < size; k++) {
            sum += matrixA[row * size + k] * matrixB[k * size + col];
        }
        result[row * size + col] = sum;
    }
};


std::vector<int> multiplyMatricesByBlocks(const std::vector<int>& matrixA, const std::vector<int>& matrixB, const int size, const int threadsAmount) {
    std::vector<int> result(size*size);
    int totalElements = size * size;
    int blockSize = std::ceil((double)totalElements / threadsAmount);

    std::vector<std::pair<int, int>> blockPositions;
    std::vector<std::thread> threads;

    for (int index = 0; index < totalElements; index++) {
        int row = index / size;
        int col = index % size;

        blockPositions.emplace_back(row, col);
        if (blockPositions.size() == blockSize || index + 1 == totalElements) {
            threads.emplace_back(thMultiplyMatrixBlock, std::cref(matrixA), std::cref(matrixB), std::ref(result), blockPositions, size);
            blockPositions.clear();
        }
    }

    for (auto& thread : threads) {
        thread.join();
    }
    return result;
};
