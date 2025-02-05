#ifndef MATRIX_OPERATIONS_H    
#define MATRIX_OPERATIONS_H

#include <iostream>
#include <vector>
#include <fstream>
#include <cstdlib> 
#include <ctime>   
#include <random>


std::vector<std::vector<int>> multiplyMatrices(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B, int rowsA, int colsA, int colsB);
std::vector<std::vector<int>> generateMatrix(int rows, int cols, const int maxValue);
void writeMatrixToFile(const std::string &filename, const std::vector<std::vector<int>> &matrix, int rows, int cols);




#endif