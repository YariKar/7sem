#define CL_HPP_ENABLE_EXCEPTIONS

#include <CL/cl2.hpp>
#include <iostream>
#include <vector>
#include <chrono>
#include <cmath>
#include <fstream>
#include <sstream>
#include <stdexcept>

#define BLOCK_SIZE 16
#define CL_FILE_PATH "src/block_matrix_multiply.cl"
#define OUTPUT_FILE_PATH "result_matrix.txt"

// Утилитарная функция для проверки ошибок
void checkErr(cl_int err, const std::string &operation)
{
    if (err != CL_SUCCESS)
    {
        std::cerr << "Ошибка: " << operation << " (" << err << ")" << std::endl;
        exit(1);
    }
}

// Функция для загрузки OpenCL-кода из файла
std::string loadKernel(const std::string &filename)
{
    std::ifstream file(filename);
    if (!file.is_open())
    {
        throw std::runtime_error("Не удалось открыть файл ядра: " + filename);
    }

    std::ostringstream oss;
    oss << file.rdbuf();
    return oss.str();
}

// Функция для генерации матрицы
std::vector<int> generateMatrix(int rows, int cols)
{
    std::vector<int> matrix(rows * cols);

    for (int i = 0; i < rows; ++i)
    {
        for (int j = 0; j < cols; ++j)
        {
            matrix[i * cols + j] = i * j;
        }
    }

    return matrix;
}

// Функция для записи матрицы в текстовый файл
void writeMatrixToFile(const std::vector<int> &matrix, int rows, int cols, const std::string &filename)
{
    std::ofstream outFile(filename);
    if (!outFile.is_open())
    {
        throw std::runtime_error("Не удалось открыть файл для записи: " + filename);
    }

    for (int i = 0; i < rows; ++i)
    {
        for (int j = 0; j < cols; ++j)
        {
            outFile << matrix[i * cols + j] << " ";
        }
        outFile << "\n";
    }
    outFile.close();
}

int main()
{
    const int M = 1024, N = 1024, K = 1024; // Размеры матриц
    std::vector<int> A = generateMatrix(M, N);
    std::vector<int> B = generateMatrix(N, K);
    std::vector<int> C(M * K, 0);

    try
    {
        // Получение списка доступных платформ
        std::vector<cl::Platform> platforms;
        cl::Platform::get(&platforms);
        if (platforms.empty())
        {
            throw std::runtime_error("OpenCL платформы не найдены.");
        }

        // Используем первую платформу
        cl::Platform platform = platforms.front();
        std::cout << "Используемая платформа: " << platform.getInfo<CL_PLATFORM_NAME>() << std::endl;

        // Получение списка устройств
        std::vector<cl::Device> devices;
        platform.getDevices(CL_DEVICE_TYPE_ALL, &devices);
        if (devices.empty())
        {
            throw std::runtime_error("OpenCL устройства не найдены.");
        }

        // Используем первое устройство
        cl::Device device = devices.front();
        std::cout << "Используемое устройство: " << device.getInfo<CL_DEVICE_NAME>() << std::endl;

        // Создание контекста и очереди команд
        cl::Context context(device);
        cl::CommandQueue queue(context, device, CL_QUEUE_PROFILING_ENABLE);

        // Создание буферов
        cl::Buffer bufferA(context, CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR, sizeof(int) * A.size(), A.data());
        cl::Buffer bufferB(context, CL_MEM_READ_ONLY | CL_MEM_COPY_HOST_PTR, sizeof(int) * B.size(), B.data());
        cl::Buffer bufferC(context, CL_MEM_WRITE_ONLY, sizeof(int) * C.size());

        // Создание программы и ядра
        std::string kernelSource = loadKernel(CL_FILE_PATH);
        cl::Program program(context, kernelSource);
        try
        {
            program.build({device});
        }
        catch (const cl::Error &)
        {
            std::cerr << "Ошибка компиляции ядра: "
                      << program.getBuildInfo<CL_PROGRAM_BUILD_LOG>(device) << std::endl;
            throw;
        }

        cl::Kernel kernel(program, "mmul");
        kernel.setArg(0, bufferC);
        kernel.setArg(1, bufferA);
        kernel.setArg(2, bufferB);
        kernel.setArg(3, M);
        kernel.setArg(4, N);
        kernel.setArg(5, K);

        // Определение размеров рабочей группы и глобальной сетки
        cl::NDRange global(M, K);
        cl::NDRange local(BLOCK_SIZE, BLOCK_SIZE);

        // Запуск ядра и измерение времени
        auto start = std::chrono::high_resolution_clock::now();
        cl::Event event;
        queue.enqueueNDRangeKernel(kernel, cl::NullRange, global, local, nullptr, &event);
        queue.finish();
        auto end = std::chrono::high_resolution_clock::now();

        // Копирование результата обратно на хост
        queue.enqueueReadBuffer(bufferC, CL_TRUE, 0, sizeof(int) * C.size(), C.data());

        // Время выполнения ядра
        cl_ulong timeStart, timeEnd;
        event.getProfilingInfo(CL_PROFILING_COMMAND_START, &timeStart);
        event.getProfilingInfo(CL_PROFILING_COMMAND_END, &timeEnd);
        double kernelTimeMs = (timeEnd - timeStart) * 1e-6;

        // Время выполнения хост-программы
        double hostTimeMs = std::chrono::duration<double, std::milli>(end - start).count();

        // Расчёт производительности
        double gflops = (2.0 * M * N * K / 1e9) / (kernelTimeMs / 1000.0);

        std::cout << "Время выполнения хост-программы: " << hostTimeMs << " мс" << std::endl;
        std::cout << "Время выполнения ядра: " << kernelTimeMs << " мс" << std::endl;
        std::cout << "Производительность: " << gflops << " GFLOPS" << std::endl;

        // Запись результата в файл
        writeMatrixToFile(C, M, K, OUTPUT_FILE_PATH);
        std::cout << "Результат записан в файл: " << OUTPUT_FILE_PATH << std::endl;
    }
    catch (const cl::Error &e)
    {
        std::cerr << "OpenCL ошибка: " << e.what() << " (" << e.err() << ")" << std::endl;
        return 1;
    }
    catch (const std::runtime_error &e)
    {
        std::cerr << "Ошибка: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
