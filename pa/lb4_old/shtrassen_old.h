#ifndef SHTRASSEN_H 
#define SHTRASSEN_H

#include <iostream>
#include <vector>
#include <fstream>
#include <cstdlib> 
#include <ctime>   
#include <random>
#include <thread>


void shtrassenMatrixMultiply(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B, std::vector<std::vector<int>> &C, int threadAmount);
std::vector<std::vector<int>> add(const std::vector<std::vector<int>>& A, const std::vector<std::vector<int>>& B);
std::vector<std::vector<int>> subtract(const std::vector<std::vector<int>>& A, const std::vector<std::vector<int>>& B);
std::vector<std::vector<int>> shtrassenRecurciveMultiply(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B);
void divideMatrix(const std::vector<std::vector<int>> &A, std::vector<std::vector<int>> &A11, std::vector<std::vector<int>> &A12, std::vector<std::vector<int>> &A21, std::vector<std::vector<int>> &A22);
std::vector<std::vector<int>> concatMatrix(const std::vector<std::vector<int>> &C11, const std::vector<std::vector<int>> &C12, const std::vector<std::vector<int>> &C21, const std::vector<std::vector<int>> &C22);
std::vector<std::vector<int>> multiplyMatrices(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B);
#endif
