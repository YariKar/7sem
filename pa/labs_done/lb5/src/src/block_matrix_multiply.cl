#define BLOCK_SIZE 16 // размер блока
#define SIMD_WORK_ITEMS 4 // число одновременно исполняемых рабочих элементов

__kernel
    __attribute((reqd_work_group_size(BLOCK_SIZE, BLOCK_SIZE, 1)))
    __attribute((num_simd_work_items(SIMD_WORK_ITEMS)))
    void
    mmul(__global int *restrict C, __global int *restrict A,
         __global int *restrict B, int M, int N, int K) {
  // локальная память для одного блока матриц А и В
  __local int A_local[BLOCK_SIZE][BLOCK_SIZE];
  __local int B_local[BLOCK_SIZE][BLOCK_SIZE];
  int block_x = get_group_id(0); // индекс блока
  int block_y = get_group_id(1);

  // локальный индекс (отступ внутри блока)
  int local_x = get_local_id(0);
  int local_y = get_local_id(1);

  // границы вычислений
  int a_start = M * BLOCK_SIZE * block_y;
  int a_end = a_start + M - 1;
  int b_start = BLOCK_SIZE * block_x;
  int running_sum = 0;

  // начать вычисление выходной матрицы С
  // каждая итерация цикла соответствует одному блоку матрицы
  for (int a = a_start, b = b_start; a <= a_end;
       a += BLOCK_SIZE, b += (BLOCK_SIZE * K)) {
    // копировать входные матрицы в локальную память
    A_local[local_x][local_y] = A[a + M * local_y + local_x];
    B_local[local_x][local_y] = B[b + K * local_y + local_x];
    // дождаться окончания копирования
    barrier(CLK_LOCAL_MEM_FENCE);

// вычислить один элемент матрицы С
// осуществить полную размотку цикла
#pragma unroll
    for (int k = 0; k < BLOCK_SIZE; ++k) {
      running_sum += A_local[k][local_y] * B_local[local_x][k];
    }
    // окончание обработки блока
    barrier(CLK_LOCAL_MEM_FENCE);
  }

  // записать результат вычислений
  C[get_global_id(1) * get_global_size(0) + get_global_id(0)] = running_sum;
}