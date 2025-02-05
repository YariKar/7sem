#include <iostream>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <chrono>
#include "matrix.h"
#include <queue>
#include <unistd.h>


template <typename T>
class threadsafe_queue
{
private:
    mutable std::mutex mut;
    std::queue<std::shared_ptr<T>> data_queue;
    std::condition_variable data_cond;       // Условная переменная для потребителей
    std::condition_variable data_cond_push;  // Условная переменная для продюсеров
    size_t max_size;                         // Максимальный размер очереди

public:
    // Конструктор с указанием максимального размера очереди
    explicit threadsafe_queue(size_t max_size) : max_size(max_size) {}

    // Извлечение данных с блокировкой
    void wait_and_pop(T &value)
    {
        std::unique_lock<std::mutex> lk(mut);
        data_cond.wait(lk, [this] { return !data_queue.empty(); });  // Ждем, если очередь пуста
        value = std::move(*data_queue.front());
        data_queue.pop();
        data_cond_push.notify_one();  // Уведомляем продюсеров, что в очереди есть место
    }

    // Попытка извлечения без блокировки
    bool try_pop(T &value)
    {
        std::lock_guard<std::mutex> lk(mut);
        if (data_queue.empty())
            return false;
        value = std::move(*data_queue.front());
        data_queue.pop();
        data_cond_push.notify_one();  // Уведомляем продюсеров, что в очереди есть место
        return true;
    }

    // Извлечение данных с блокировкой, возвращает shared_ptr
    std::shared_ptr<T> wait_and_pop()
    {
        std::unique_lock<std::mutex> lk(mut);
        data_cond.wait(lk, [this] { return !data_queue.empty(); });  // Ждем, если очередь пуста
        std::shared_ptr<T> res = data_queue.front();
        data_queue.pop();
        data_cond_push.notify_one();  // Уведомляем продюсеров, что в очереди есть место
        return res;
    }

    // Попытка извлечения данных без блокировки, возвращает shared_ptr
    std::shared_ptr<T> try_pop()
    {
        std::lock_guard<std::mutex> lk(mut);
        if (data_queue.empty())
            return std::shared_ptr<T>();
        std::shared_ptr<T> res = data_queue.front();
        data_queue.pop();
        data_cond_push.notify_one();  // Уведомляем продюсеров, что в очереди есть место
        return res;
    }

    // Добавление данных с ожиданием, если очередь заполнена
    void push(T new_value)
    {
        std::shared_ptr<T> data(std::make_shared<T>(std::move(new_value)));
        std::unique_lock<std::mutex> lk(mut);
        data_cond_push.wait(lk, [this] { return data_queue.size() < max_size; });  // Ждем, если очередь полна
        data_queue.push(data);
        data_cond.notify_one();  // Уведомляем потребителей, что данные добавлены
    }

    // Проверка на пустоту
    bool empty() const
    {
        std::lock_guard<std::mutex> lk(mut);
        return data_queue.empty();
    }

    // Получение текущего размера очереди
    size_t size() const
    {
        std::lock_guard<std::mutex> lk(mut);
        return data_queue.size();
    }
};

// Задаем размеры матриц
const int rowsA = 30, colsA = 30; // Первая матрица
const int rowsB = 30, colsB = 30; // Вторая матрица

const int BLOCK_SIZE = 20; // Размер блока

std::tuple<std::vector<std::vector<int>>, std::vector<std::vector<int>>> produce_item()
{
    auto A = generateMatrix(rowsA, colsA);
    auto B = generateMatrix(rowsB, colsB);
    return std::make_tuple(A, B);
}

void process(std::tuple<std::vector<std::vector<int>>, std::vector<std::vector<int>>> matrix_tuple)
{
    auto first_matrix = std::get<0>(matrix_tuple);
    auto second_matrix = std::get<1>(matrix_tuple);

    std::vector<std::vector<int>> C(rowsA, std::vector<int>(colsB));
    blockMatrixMultiply(first_matrix, second_matrix, C, BLOCK_SIZE, rowsA, colsA, colsB);

    std::string fileResult = "rough_queue_output.txt";
    writeMatrixToFile(fileResult, C, rowsA, colsB);
}

void producer(threadsafe_queue<std::tuple<std::vector<std::vector<int>>, std::vector<std::vector<int>>>> &data_queue, int count)
{
    for (int i = 0; i < count; ++i) {
        auto data = produce_item();
        data_queue.push(data);
        std::cout << "Produced: " << i << std::endl;
    }
}

void consumer(threadsafe_queue<std::tuple<std::vector<std::vector<int>>, std::vector<std::vector<int>>>> &data_queue, int count)
{
    std::tuple<std::vector<std::vector<int>>, std::vector<std::vector<int>>> data;
    for (int i = 0; i < count; ++i) {
        data_queue.wait_and_pop(data);
        process(data);
        std::cout << "Consumed: " << i << std::endl;
    }
}

int main()
{
    const int queue_size = 5;

    int producer_count = 5;   // Количество производителей
    int consumer_count = 5;   // Количество потребителей
    int produce_per_producer = 10;  // Количество элементов, производимых каждым продюсером
    int consume_per_consumer = 10;  // Количество элементов, обрабатываемых каждым потребителем

    threadsafe_queue<std::tuple<std::vector<std::vector<int>>, std::vector<std::vector<int>>>> data_queue(queue_size);

    std::vector<std::thread> producers;
    std::vector<std::thread> consumers;

    // Создаем потоки производителей
    for (int i = 0; i < producer_count; ++i) {
        producers.emplace_back(producer, std::ref(data_queue), produce_per_producer);
    }

    // Создаем потоки потребителей
    for (int i = 0; i < consumer_count; ++i) {
        consumers.emplace_back(consumer, std::ref(data_queue), consume_per_consumer);
    }

    // Ожидаем завершения работы потоков
    for (auto& p : producers) {
        p.join();
    }

    for (auto& c : consumers) {
        c.join();
    }

    return 0;
}