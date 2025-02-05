#include "shtrassen.h"


void shtrassenMatrixMultiply(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B, std::vector<std::vector<int>> &C, int threadAmount)
{
    C = shtrassenRecurciveMultiply(A, B);
}

std::vector<std::vector<int>> add(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B) {
    int n = A.size();
    std::vector<std::vector<int>> result(n, std::vector<int>(n));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            result[i][j] = A[i][j] + B[i][j];
        }
    }
    return result;
}

std::vector<std::vector<int>> subtract(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B) {
    int n = A.size();
    std::vector<std::vector<int>> result(n, std::vector<int>(n));
    for (int i = 0; i < n; ++i) {
        for (int j = 0; j < n; ++j) {
            result[i][j] = A[i][j] - B[i][j];
        }
    }
    return result;
}

std::vector<std::vector<int>> shtrassenRecurciveMultiply(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B)
{
    int n = A.size();
    if(n>=32)
    {
        return multiplyMatrices(A, B);
    }
    // if (n == 1) {
    //     std::vector<std::vector<int>> result(1, std::vector<int>(1));
    //     result[0][0] = A[0][0] * B[0][0];
    //     return result;
    // }
    int newSize = n / 2;
    std::vector<std::vector<int>> A11(newSize, std::vector<int>(newSize)), A12(newSize, std::vector<int>(newSize)),
        A21(newSize, std::vector<int>(newSize)), A22(newSize, std::vector<int>(newSize)),
        B11(newSize, std::vector<int>(newSize)), B12(newSize, std::vector<int>(newSize)),
        B21(newSize, std::vector<int>(newSize)), B22(newSize, std::vector<int>(newSize));

    divideMatrix(A, A11, A12, A21, A22);
    divideMatrix(B, B11, B12, B21, B22);
    std::vector<std::vector<int>> D = shtrassenRecurciveMultiply(add(A11, A22), add(B11, B22));
    std::vector<std::vector<int>> D1 = shtrassenRecurciveMultiply(subtract(A12, A22), add(B21, B22));
    std::vector<std::vector<int>> D2 = shtrassenRecurciveMultiply(subtract(A21, A11), add(B11, B12));
    std::vector<std::vector<int>> H1 = shtrassenRecurciveMultiply(add(A11, A12), B22);
    std::vector<std::vector<int>> H2 = shtrassenRecurciveMultiply(add(A21, A22), B11);
    std::vector<std::vector<int>> V1 = shtrassenRecurciveMultiply(A22, subtract(B21, B11));
    std::vector<std::vector<int>> V2 = shtrassenRecurciveMultiply(A11, subtract(B12, B22));
    
    
    
    

    std::vector<std::vector<int>> C11 = add(subtract(add(D, V1), H1), D1);
    std::vector<std::vector<int>> C12 = add(V2, H1);
    std::vector<std::vector<int>> C21 = add(H2, V1);
    std::vector<std::vector<int>> C22 = add(subtract(add(D, V2), H2), D2);
    return concatMatrix(C11, C12, C21, C22);


}


void divideMatrix(const std::vector<std::vector<int>> &A, std::vector<std::vector<int>> &A11, std::vector<std::vector<int>> &A12, std::vector<std::vector<int>> &A21, std::vector<std::vector<int>> &A22)
{
    int newSize = A.size()/2;
    for (int i = 0; i < newSize; ++i) {
        for (int j = 0; j < newSize; ++j) {
            A11[i][j] = A[i][j];
            A12[i][j] = A[i][j + newSize];
            A21[i][j] = A[i + newSize][j];
            A22[i][j] = A[i + newSize][j + newSize];
        }
    }
}

std::vector<std::vector<int>> concatMatrix(const std::vector<std::vector<int>> &C11, const std::vector<std::vector<int>> &C12, const std::vector<std::vector<int>> &C21, const std::vector<std::vector<int>> &C22)
{
    int newSize = C11.size();
    int n = newSize*2;
    std::vector<std::vector<int>> C(n, std::vector<int>(n));
    for (int i = 0; i < newSize; ++i) {
        for (int j = 0; j < newSize; ++j) {
            C[i][j] = C11[i][j];
            C[i][j + newSize] = C12[i][j];
            C[i + newSize][j] = C21[i][j];
            C[i + newSize][j + newSize] = C22[i][j];
        }
    }

    return C;
}

std::vector<std::vector<int>> multiplyMatrices(const std::vector<std::vector<int>> &A, const std::vector<std::vector<int>> &B)
{
    int size = A.size();
    std::vector<std::vector<int>> result(size, std::vector<int>(size, 0));

    for (int i = 0; i < size; ++i)
    {
        for (int j = 0; j < size; ++j)
        {
            for (int k = 0; k < size; ++k)
            {
                result[i][j] += A[i][k] * B[k][j];
            }
        }
    }

    return result;
}

