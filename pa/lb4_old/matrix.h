#ifndef MATRIX_H 
#define MATRIX_H

#include <iostream>
#include <vector>
#include <fstream>
#include <cstdlib> 
#include <ctime>   
#include <random>
#include <thread>


std::vector<std::vector<int>> generateMatrix(int rows, int cols);
void showMatrix(const std::vector<std::vector<int>> &matrix, int rows, int cols);
void writeMatrixToFile(const std::string &filename, const std::vector<std::vector<int>> &matrix, int rows, int cols);
std::vector<std::vector<int>> multiplyMatrices(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B, int rowsA, int colsA, int colsB);
void multiplyBlock(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B, std::vector<std::vector<int>> &C,
                   int blockRow, int blockCol, int blockSize, int rowsA, int colsA, int colsB);
void blockMatrixMultiply(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B, std::vector<std::vector<int>> &C, int blockSize, int rowsA, int colsA, int colsB);
std::vector<int> flatMatrix(std::vector<std::vector<int>> matrix, int rows, int cols);
std::vector<std::vector<int>> fromFlatMatrix(std::vector<int> flatMatrix, int rows, int cols);
#endif


