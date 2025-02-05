#pragma once
#include <vector>
#include "../CTPL/ctpl_stl.h"


std::vector<int> multiplyMatricesByStrassen(const std::vector<int>& A, const std::vector<int>& B, const int size, ctpl::thread_pool* threadPool = nullptr);
void splitMatrix(const std::vector<int>& A, std::vector<int>& A11, std::vector<int>& A12, std::vector<int>& A21, std::vector<int>& A22, const int size);
std::vector<int> concatMatrices(const std::vector<int>& C11, const std::vector<int>& C12, const std::vector<int>& C21, const std::vector<int>& C22, const int resultSize);