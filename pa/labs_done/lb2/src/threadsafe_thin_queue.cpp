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
    struct node
    {
        std::shared_ptr<T> data;
        std::unique_ptr<node> next;
    };

    std::mutex head_mutex;
    std::unique_ptr<node> head;
    std::mutex tail_mutex;
    node *tail;
    std::condition_variable data_cond;         // Условная переменная для потребителей
    std::condition_variable data_cond_push;    // Условная переменная для продюсеров
    size_t current_size;                       // Текущий размер очереди
    size_t max_size;                           // Максимальный размер очереди

    node *get_tail()
    {
        std::lock_guard<std::mutex> tail_lock(tail_mutex);
        return tail;
    }

    std::unique_ptr<node> pop_head()
    {
        std::unique_ptr<node> old_head = std::move(head);
        head = std::move(old_head->next);
        --current_size;  // Уменьшаем размер при извлечении
        return old_head;
    }

    std::unique_lock<std::mutex> wait_for_data()
    {
        std::unique_lock<std::mutex> head_lock(head_mutex);
        data_cond.wait(head_lock, [&] { return head.get() != get_tail(); });
        return std::move(head_lock);
    }

    std::unique_ptr<node> wait_pop_head()
    {
        std::unique_lock<std::mutex> head_lock(wait_for_data());
        return pop_head();
    }

    std::unique_ptr<node> wait_pop_head(T &value)
    {
        std::unique_lock<std::mutex> head_lock(wait_for_data());
        value = std::move(*head->data);
        return pop_head();
    }

    std::unique_ptr<node> try_pop_head()
    {
        std::lock_guard<std::mutex> head_lock(head_mutex);
        if (head.get() == get_tail())
        {
            return std::unique_ptr<node>();
        }
        return pop_head();
    }

    std::unique_ptr<node> try_pop_head(T &value)
    {
        std::lock_guard<std::mutex> head_lock(head_mutex);
        if (head.get() == get_tail())
        {
            return std::unique_ptr<node>();
        }
        value = std::move(*head->data);
        return pop_head();
    }

public:
    // Конструктор с указанием максимального размера очереди
    explicit threadsafe_queue(size_t max_size) : head(new node), tail(head.get()), current_size(0), max_size(max_size) {}

    threadsafe_queue(const threadsafe_queue &other) = delete;
    threadsafe_queue &operator=(const threadsafe_queue &other) = delete;

    std::shared_ptr<T> try_pop()
    {
        std::unique_ptr<node> old_head = try_pop_head();
        if (old_head)
        {
            data_cond_push.notify_one();  // Уведомляем продюсеров о том, что место освободилось
        }
        return old_head ? old_head->data : std::shared_ptr<T>();
    }

    bool try_pop(T &value)
    {
        std::unique_ptr<node> old_head = try_pop_head(value);
        if (old_head)
        {
            data_cond_push.notify_one();  // Уведомляем продюсеров о том, что место освободилось
        }
        return old_head != nullptr;
    }

    bool empty()
    {
        std::lock_guard<std::mutex> head_lock(head_mutex);
        return (head.get() == get_tail());
    }

    void push(T new_value)
    {
        std::shared_ptr<T> new_data(std::make_shared<T>(std::move(new_value)));
        std::unique_ptr<node> p(new node);

        std::unique_lock<std::mutex> tail_lock(tail_mutex);
        data_cond_push.wait(tail_lock, [&] { return current_size < max_size; });  // Ждем, если очередь полна
        tail->data = new_data;
        node *const new_tail = p.get();
        tail->next = std::move(p);
        tail = new_tail;
        ++current_size;  // Увеличиваем размер после добавления
        tail_lock.unlock();
        data_cond.notify_one();  // Уведомляем потребителей, что данные добавлены
    }

    std::shared_ptr<T> wait_and_pop()
    {
        std::unique_ptr<node> old_head = wait_pop_head();
        if (old_head)
        {
            data_cond_push.notify_one();  // Уведомляем продюсеров о том, что место освободилось
        }
        return old_head->data;
    }

    void wait_and_pop(T &value)
    {
        std::unique_ptr<node> old_head = wait_pop_head(value);
        if (old_head)
        {
            data_cond_push.notify_one();  // Уведомляем продюсеров о том, что место освободилось
        }
    }

    // Получение текущего размера очереди
    size_t size() const
    {
        std::lock_guard<std::mutex> head_lock(head_mutex);
        return current_size;
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

    std::string fileResult = "thin_queue_output.txt";
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

    int producer_count = 4;   // Количество производителей
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