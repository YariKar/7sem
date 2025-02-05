#include "strassenMultiplication.hpp"
#include <iostream>
#include <thread>
#include <future>
#include <cmath>
#include "../matrix/matrix.hpp"


std::vector<int> multiplyMatricesByStrassen(const std::vector<int>& A, const std::vector<int>& B, const int size, ctpl::thread_pool* threadPool) {
    if (size > 32) {
        const int newSize = size*size/4;
        std::vector<int> A11(newSize, 0); std::vector<int> B11(newSize, 0);
        std::vector<int> A12(newSize, 0); std::vector<int> B12(newSize, 0);
        std::vector<int> A21(newSize, 0); std::vector<int> B21(newSize, 0);
        std::vector<int> A22(newSize, 0); std::vector<int> B22(newSize, 0);

        splitMatrix(A, A11, A12, A21, A22, size);
        splitMatrix(B, B11, B12, B21, B22, size);

        std::vector<int> D(newSize, 0);
        std::vector<int> D1(newSize, 0);
        std::vector<int> D2(newSize, 0);
        std::vector<int> H1(newSize, 0);
        std::vector<int> H2(newSize, 0);
        std::vector<int> V1(newSize, 0);
        std::vector<int> V2(newSize, 0);

        if (threadPool == nullptr || threadPool->size() == 0) {
            D = multiplyMatricesByStrassen(matricesAddition(A11, A22, size/2), matricesAddition(B11, B22, size/2), size/2, threadPool);
            D1 = multiplyMatricesByStrassen(matricesSubtraction(A12, A22, size/2), matricesAddition(B21, B22, size/2), size/2, threadPool);
            D2 = multiplyMatricesByStrassen(matricesSubtraction(A21, A11, size/2), matricesAddition(B11, B12, size/2), size/2, threadPool);
            H1 = multiplyMatricesByStrassen(matricesAddition(A11, A12, size/2), B22, size/2, threadPool);
            H2 = multiplyMatricesByStrassen(matricesAddition(A21, A22, size/2), B11, size/2, threadPool);
            V1 = multiplyMatricesByStrassen(A22, matricesSubtraction(B21, B11, size/2), size/2, threadPool);
            V2 = multiplyMatricesByStrassen(A11, matricesSubtraction(B12, B22, size/2), size/2, threadPool);
        } else {
            auto futureD = threadPool->n_idle() > 0 ? threadPool->push([&](int) {
                return multiplyMatricesByStrassen(
                    matricesAddition(A11, A22, size / 2),
                    matricesAddition(B11, B22, size / 2),
                    size / 2,
                    threadPool);
            }) : std::async(std::launch::deferred, [&]() {
                return multiplyMatricesByStrassen(
                    matricesAddition(A11, A22, size / 2),
                    matricesAddition(B11, B22, size / 2),
                    size / 2,
                    threadPool);
            });
            // std::cout <<"pool D\n";
            auto futureD1 = threadPool->n_idle() > 0 ? threadPool->push([&](int) {
                return multiplyMatricesByStrassen(
                    matricesSubtraction(A12, A22, size / 2),
                    matricesAddition(B21, B22, size / 2),
                    size / 2, 
                    threadPool);
            }) : std::async(std::launch::deferred, [&]() {
                return multiplyMatricesByStrassen(
                    matricesSubtraction(A12, A22, size / 2),
                    matricesAddition(B21, B22, size / 2),
                    size / 2, 
                    threadPool);
            });
            // std::cout <<"pool D1\n";
            auto futureD2 = threadPool->n_idle() > 0 ? threadPool->push([&](int) {
                return multiplyMatricesByStrassen(
                    matricesSubtraction(A21, A11, size / 2),
                    matricesAddition(B11, B12, size / 2),
                    size / 2, 
                    threadPool);
            }) : std::async(std::launch::deferred, [&]() {
                return multiplyMatricesByStrassen(
                    matricesSubtraction(A21, A11, size / 2),
                    matricesAddition(B11, B12, size / 2),
                    size / 2, 
                    threadPool);
            });
            // std::cout <<"pool D2\n";
            auto futureH1 = threadPool->n_idle() > 0 ? threadPool->push([&](int) {
                return multiplyMatricesByStrassen(
                    matricesAddition(A11, A12, size / 2),
                    B22,
                    size / 2, 
                    threadPool);
            }) : std::async(std::launch::deferred, [&]() {
                return multiplyMatricesByStrassen(
                    matricesAddition(A11, A12, size / 2),
                    B22,
                    size / 2, 
                    threadPool);
            });
            // std::cout <<"pool H1\n";
            auto futureH2 = threadPool->n_idle() > 0 ? threadPool->push([&](int) {
                return multiplyMatricesByStrassen(
                    matricesAddition(A21, A22, size / 2),
                    B11,
                    size / 2, 
                    threadPool);
            }) : std::async(std::launch::deferred, [&]() {
                return multiplyMatricesByStrassen(
                    matricesAddition(A21, A22, size / 2),
                    B11,
                    size / 2, 
                    threadPool);
            });
            // std::cout <<"pool H2\n";
            auto futureV1 = threadPool->n_idle() > 0 ? threadPool->push([&](int) {
                return multiplyMatricesByStrassen(
                    A22,
                    matricesSubtraction(B21, B11, size / 2),
                    size / 2,
                    threadPool);
            }) : std::async(std::launch::deferred, [&]() {
                return multiplyMatricesByStrassen(
                    A22,
                    matricesSubtraction(B21, B11, size / 2),
                    size / 2,
                    threadPool);
            });
            // std::cout <<"pool V1\n";
            auto futureV2 = threadPool->n_idle() > 0 ? threadPool->push([&](int) {
                return multiplyMatricesByStrassen(
                    A11,
                    matricesSubtraction(B12, B22, size / 2),
                    size / 2,
                    threadPool);
            }) : std::async(std::launch::deferred, [&]() {
                return multiplyMatricesByStrassen(
                    A11,
                    matricesSubtraction(B12, B22, size / 2),
                    size / 2,
                    threadPool);
            });
            // std::cout <<"pool V2\n";
            // Получаем результаты
            D = futureD.get();
            D1 = futureD1.get();
            D2 = futureD2.get();
            H1 = futureH1.get();
            H2 = futureH2.get();
            V1 = futureV1.get();
            V2 = futureV2.get();
        }
        // std::cout << "get D " << '\n';
        // printMatrix(D, newSize);
        std::vector<int> C11(newSize); C11 = matricesSubtraction(matricesAddition(matricesAddition(D, D1, size/2), V1, size/2), H1, size/2);
        std::vector<int> C12(newSize); C12 = matricesAddition(V2, H1, size/2);
        std::vector<int> C21(newSize); C21 = matricesAddition(V1, H2, size/2);
        std::vector<int> C22(newSize); C22 = matricesSubtraction(matricesAddition(matricesAddition(D, D2, size/2), V2, size/2), H2, size/2);

        std::vector<int> result = concatMatrices(C11, C12, C21, C22, size);
        return result;
    } else {
        return matricesMultiplication(A, B, size);
    }
};


void splitMatrix(const std::vector<int>& A, std::vector<int>& A11, std::vector<int>& A12, std::vector<int>& A21, std::vector<int>& A22, const int size) {
    const int n = size/2;
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            A11[i * n + j] = A[i * size + j];
            A12[i * n + j] = A[i * size + j + n];
            A21[i * n + j] = A[(i + n) * size + j];
            A22[i * n + j] = A[(i + n) * size + j + n];
        }
    }
};


std::vector<int> concatMatrices(const std::vector<int>& C11, const std::vector<int>& C12, const std::vector<int>& C21, const std::vector<int>& C22, const int resultSize) {
    std::vector<int> result(resultSize*resultSize);
    int n = resultSize / 2;

    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            result[i * resultSize + j] = C11[i * n + j];
            result[i * resultSize + j + n] = C12[i * n + j];
            result[(i + n) * resultSize + j] = C21[i * n + j];
            result[(i + n) * resultSize + j + n] = C22[i * n + j];
        }
    }

    return result;
};