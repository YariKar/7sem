#include "strassenMultiplication.hpp"
#include "../matrix/matrix.hpp"


std::vector<int> multiplyMatricesByStrassen(const std::vector<int>& A, const std::vector<int>& B, int size, int threadsAmount, bool isNewThreads) {
    if (size > 32) {
        const int newSize = size*size/4;
        std::vector<int> A11(newSize); std::vector<int> B11(newSize);
        std::vector<int> A12(newSize); std::vector<int> B12(newSize);
        std::vector<int> A21(newSize); std::vector<int> B21(newSize);
        std::vector<int> A22(newSize); std::vector<int> B22(newSize);

        splitMatrix(A, A11, A12, A21, A22, size);
        splitMatrix(B, B11, B12, B21, B22, size);

        std::vector<int> D(newSize); //D = multiplyMatricesByStrassen(matricesAddition(A11, A22, size/2), matricesAddition(B11, B22, size/2), size/2);
        std::vector<int> D1(newSize); //D1 = multiplyMatricesByStrassen(matricesSubtraction(A12, A22, size/2), matricesAddition(B21, B22, size/2), size/2);
        std::vector<int> D2(newSize); //D2 = multiplyMatricesByStrassen(matricesSubtraction(A21, A11, size/2), matricesAddition(B11, B12, size/2), size/2);
        std::vector<int> H1(newSize); //H1 = multiplyMatricesByStrassen(matricesAddition(A11, A12, size/2), B22, size/2);
        std::vector<int> H2(newSize); //H2 = multiplyMatricesByStrassen(matricesAddition(A21, A22, size/2), B11, size/2);
        std::vector<int> V1(newSize); //V1 = multiplyMatricesByStrassen(A22, matricesSubtraction(B21, B11, size/2), size/2);
        std::vector<int> V2(newSize); //V2 = multiplyMatricesByStrassen(A11, matricesSubtraction(B12, B22, size/2), size/2);
        if (isNewThreads)
        {
            diversificationTasksByThreads(threadsAmount, D, D1, D2, H1, H2, V1, V2, A11, A12, A21, A22, B11, B12, B21, B22, size);
        }else
        {
            D = multiplyMatricesByStrassen(matricesAddition(A11, A22, size/2), matricesAddition(B11, B22, size/2), size/2, threadsAmount, false);
            D1 = multiplyMatricesByStrassen(matricesSubtraction(A12, A22, size/2), matricesAddition(B21, B22, size/2), size/2, threadsAmount, false);
            D2 = multiplyMatricesByStrassen(matricesSubtraction(A21, A11, size/2), matricesAddition(B11, B12, size/2), size/2, threadsAmount, false);
            H1 = multiplyMatricesByStrassen(matricesAddition(A11, A12, size/2), B22, size/2, threadsAmount, false);
            H2 = multiplyMatricesByStrassen(matricesAddition(A21, A22, size/2), B11, size/2, threadsAmount, false);
            V1 = multiplyMatricesByStrassen(A22, matricesSubtraction(B21, B11, size/2), size/2, threadsAmount, false);
            V2 = multiplyMatricesByStrassen(A11, matricesSubtraction(B12, B22, size/2), size/2, threadsAmount, false);
        }
        
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

void diversificationTasksByThreads(
    const int threadsAmount, 
    std::vector<int>& D, std::vector<int>& D1, 
    std::vector<int>& D2, std::vector<int>& H1, 
    std::vector<int>& H2, std::vector<int>& V1, 
    std::vector<int>& V2,
    const std::vector<int>& A11, const std::vector<int>& A12, 
    const std::vector<int>& A21, const std::vector<int>& A22,
    const std::vector<int>& B11, const std::vector<int>& B12, 
    const std::vector<int>& B21, const std::vector<int>& B22,
    const int size
) {
    std::vector<std::function<void()>> tasks = {
        [&]() { D = multiplyMatricesByStrassen(matricesAddition(A11, A22, size/2), matricesAddition(B11, B22, size/2), size/2, 0, false); },
        [&]() { D1 = multiplyMatricesByStrassen(matricesSubtraction(A12, A22, size/2), matricesAddition(B21, B22, size/2), size/2, 0, false); },
        [&]() { D2 = multiplyMatricesByStrassen(matricesSubtraction(A21, A11, size/2), matricesAddition(B11, B12, size/2), size/2, 0, false); },
        [&]() { H1 = multiplyMatricesByStrassen(matricesAddition(A11, A12, size/2), B22, size/2, 0, false); },
        [&]() { H2 = multiplyMatricesByStrassen(matricesAddition(A21, A22, size/2), B11, size/2, 0, false); },
        [&]() { V1 = multiplyMatricesByStrassen(A22, matricesSubtraction(B21, B11, size/2), size/2, 0, false); },
        [&]() { V2 = multiplyMatricesByStrassen(A11, matricesSubtraction(B12, B22, size/2), size/2, 0, false); }
    };

    std::vector<std::thread> threads;
    int numThreads = std::min(threadsAmount, (int)tasks.size());
    int tasksPerThread = (tasks.size() + numThreads - 1) / numThreads;

    for (int t = 0; t < numThreads; ++t) {
        threads.emplace_back([&, t]() {
            int start = t * tasksPerThread;
            int end = std::min(start + tasksPerThread, (int)tasks.size());
            for (int i = start; i < end; ++i) {
                tasks[i]();
            }
        });
    }

    for (auto& thread : threads) {
        thread.join();
    }
}
