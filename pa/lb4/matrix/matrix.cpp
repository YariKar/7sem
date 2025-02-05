#include "matrix.hpp"

#include <fstream>
#include <random>
#include <iostream>


std::vector<int> generateMatrix(const int size, const int maxValue) {
    std::vector<int> matrix(size*size);

    std::random_device random_device; 
    std::mt19937 gen(random_device()); 
    std::uniform_int_distribution<> uniform_distribution(-maxValue, maxValue);

    for (int i = 0; i < size*size; i++){
        matrix[i] = uniform_distribution(gen);
    }

    return matrix;
}


void writeMatrixInFile(const std::string& filename, const std::vector<int>& result, const int size) {
    std::ofstream outputFile(filename);

    if (!outputFile.is_open())
    {
        std::cerr << "Open file err: " << filename << std::endl;
        exit(-1);
    }

    for (int i = 0; i < size*size; i++) {
        char sep = ((i % size == size-1) ? '\n' : ' ');
        outputFile << result[i] << sep;
    }
    outputFile.close();
}


void printMatrix(const std::vector<int>& result, const int size) {
    for (int i = 0; i < size*size; i++) {
        char sep = ((i % size == size-1) ? '\n' : ' ');
        std::cout << result[i] << sep;
    }
}


std::vector<int> matricesMultiplication(const std::vector<int>& A, const std::vector<int>& B, const int size) {
    std::vector<int> result(size*size, 0);

    for(int i = 0; i < size; i++){
        for(int j = 0; j < size; j++){
            for(int k = 0; k < size; k++){
                result[i*size + j] += A[i*size + k] * B[k*size + j];
            }
        }
    }

    return result;
};


std::vector<int> matricesAddition(const std::vector<int>& A, const std::vector<int>& B, const int size) {
    std::vector<int> result(size*size, 0);

    for (int i = 0; i < size*size; i++) {
        result[i] = A[i] + B[i];
    }

    return result;
};


std::vector<int> matricesSubtraction(const std::vector<int>& A, const std::vector<int>& B, const int size) {
    std::vector<int> result(size*size, 0);

    for (int i = 0; i < size*size; i++) {
        result[i] = A[i] - B[i];
    }
    
    return result;
}