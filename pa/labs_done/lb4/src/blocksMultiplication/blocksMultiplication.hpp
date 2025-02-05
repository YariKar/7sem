#pragma once
#include <vector>
#include <thread>


void thMultiplyMatrixBlock(const std::vector<int>& matrixA, const std::vector<int>& matrixB, std::vector<int>& result, std::vector<std::pair<int, int>> blockPositions, const int size);
std::vector<int> multiplyMatricesByBlocks(const std::vector<int>& matrixA, const std::vector<int>& matrixB, const int size, const int threadsAmount);
