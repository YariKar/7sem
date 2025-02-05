#pragma once
#include <vector>
#include <string>


std::vector<int> generateMatrix(const int size, const int maxValue);
void writeMatrixInFile(const std::string& filename, const std::vector<int>& result, const int size);
void printMatrix(const std::vector<int>& result, const int size);

std::vector<int> matricesMultiplication(const std::vector<int>& A, const std::vector<int>& B, const int size);
std::vector<int> matricesAddition(const std::vector<int>& A, const std::vector<int>& B, const int size);
std::vector<int> matricesSubtraction(const std::vector<int>& A, const std::vector<int>& B, const int size);
