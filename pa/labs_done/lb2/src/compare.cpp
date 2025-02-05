#include <iostream>
#include <thread>
#include <vector>
#include <queue>
#include <mutex>
#include <condition_variable>
#include <tuple>
#include <chrono>
#include "matrix.h"

// Таймер для измерения времени
class Timer
{
public:
    Timer() : start(std::chrono::high_resolution_clock::now()) {}

    void reset()
    {
        start = std::chrono::high_resolution_clock::now();
    }

    double elapsed() const
    {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
                   std::chrono::high_resolution_clock::now() - start)
                   .count();
    }

private:
    std::chrono::high_resolution_clock::time_point start;
};

template <typename T>
class threadsafe_queue_rough
{
private:
    mutable std::mutex mut;
    std::queue<std::shared_ptr<T>> data_queue;
    std::condition_variable data_cond;       // Условная переменная для потребителей
    std::condition_variable data_cond_push;  // Условная переменная для продюсеров
    size_t max_size;                         // Максимальный размер очереди

public:
    // Конструктор с указанием максимального размера очереди
    explicit threadsafe_queue_rough(size_t max_size) : max_size(max_size) {}

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

template <typename T>
class threadsafe_queue_thin
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
    explicit threadsafe_queue_thin(size_t max_size) : head(new node), tail(head.get()), current_size(0), max_size(max_size) {}

    threadsafe_queue_thin(const threadsafe_queue_thin &other) = delete;
    threadsafe_queue_thin &operator=(const threadsafe_queue_thin &other) = delete;

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
const int rowsA = 500, colsA = 500; // Первая матрица
const int rowsB = 500, colsB = 500; // Вторая матрица

const int BLOCK_SIZE = 250; // Размер блока

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

    std::string fileResult = "compare_queue_output.txt";
    writeMatrixToFile(fileResult, C, rowsA, colsB);
}

template <typename QueueType>
void producer(QueueType& data_queue, int count)
{
    for (int i = 0; i < count; ++i) {
        auto data = produce_item();
        data_queue.push(data);
    }
}

template <typename QueueType>
void consumer(QueueType& data_queue, int count)
{
    std::tuple<std::vector<std::vector<int>>, std::vector<std::vector<int>>> data;
    for (int i = 0; i < count; ++i) {
        data_queue.wait_and_pop(data);
        process(data);
    }
}

// Функция тестирования производительности
template <typename QueueType>
void test_performance(int producer_count, int consumer_count, int produce_per_producer, int consume_per_consumer, int queue_size) {
    QueueType queue(queue_size);
    std::vector<std::thread> producers;
    std::vector<std::thread> consumers;

    // Создаем потоки производителей
    for (int i = 0; i < producer_count; ++i) {
        producers.emplace_back(producer<QueueType>, std::ref(queue), produce_per_producer);
    }

    // Создаем потоки потребителей
    for (int i = 0; i < consumer_count; ++i) {
        consumers.emplace_back(consumer<QueueType>, std::ref(queue), consume_per_consumer);
    }

    // Ожидаем завершения работы потоков
    for (auto& p : producers) {
        p.join();
    }

    for (auto& c : consumers) {
        c.join();
    }
}

int main() {
    const int queue_size = 5;

    int produce_per_producer = 10;  // Количество элементов, производимых каждым продюсером
    int consume_per_consumer = 10;  // Количество элементов, обрабатываемых каждым потребителем

    for (int count = 1; count <10; count++)
    {
        int producer_count = count;   // Количество производителей
        int consumer_count = count;   // Количество потребителей
        Timer timer;
        std::cout<< "Количество производителей и потребителей = "<<count<<std::endl;
        // Тестируем очередь с грубой блокировкой
        timer.reset();
        test_performance<threadsafe_queue_rough<std::tuple<std::vector<std::vector<int>>, std::vector<std::vector<int>>>>>(producer_count, consumer_count, produce_per_producer, consume_per_consumer, queue_size);
        std::cout << "Грубая блокировка: " << timer.elapsed() << " мс" << std::endl;

        // Тестируем очередь с тонкой блокировкой
        timer.reset();
        test_performance<threadsafe_queue_thin<std::tuple<std::vector<std::vector<int>>, std::vector<std::vector<int>>>>>(producer_count, consumer_count, produce_per_producer, consume_per_consumer, queue_size);
        std::cout << "Тонкая блокировка: " << timer.elapsed() << " мс" << std::endl;

        std::cout<<std::endl;
    }
    

    return 0;
}