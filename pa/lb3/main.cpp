#include "lockFree.h"
#include "matrix.h"

typedef std::pair<std::vector<std::vector<int>>, std::vector<std::vector<int>>> myPair;

const int rowsA = 500, colsA = 500; // Первая матрица
const int rowsB = 500, colsB = 500; // Вторая матрица

const int BLOCK_SIZE = 250; // Размер блока

myPair produce_item()
{
    auto A = generateMatrix(rowsA, colsA);
    auto B = generateMatrix(rowsB, colsB);
    return std::make_pair(A, B);
}

void process(myPair matrix_pair)
{
    auto first_matrix = std::get<0>(matrix_pair);
    auto second_matrix = std::get<1>(matrix_pair);

    std::vector<std::vector<int>> C(rowsA, std::vector<int>(colsB));
    blockMatrixMultiply(first_matrix, second_matrix, C, BLOCK_SIZE, rowsA, colsA, colsB);

    std::string fileResult = "lockfree_queue_output.txt";
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
    myPair data;
    for (int i = 0; i < count; ++i) {
        data_queue.pop(data);
        process(data);
    }
}

template <typename QueueType>
void testQueue(const int producersCount, const int consumersCount, const int producerPower, const int consumerPower) {
    QueueType queue = QueueType();

    std::vector<std::thread> producers;
    std::vector<std::thread> consumers;
    
    for (int i = 0; i < producersCount; i++) {
        producers.emplace_back(producer<QueueType>, std::ref(queue), producerPower);
    }
    for (int i = 0; i < consumersCount; i++) {
        consumers.emplace_back(consumer<QueueType>, std::ref(queue), consumerPower);
    }

    for (auto& producer : producers) {
        producer.join();
    }
    for (auto& consumer : consumers) {
        consumer.join();
    }
}

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


int main(int argc, char* argv[]) {
    int producersCount, consumersCount, producerPower, consumerPower;
     
    if (argc == 5) {
        producerPower = std::stoi(argv[1]);
        consumerPower = std::stoi(argv[2]); 
        producersCount = std::stoi(argv[3]);
        consumersCount = std::stoi(argv[4]);   
    } else {
        producersCount = consumersCount = 6;
        producerPower = consumerPower = 10;
    }
    
   
    Timer timer;
    std::cout<< "Количество производителей: "<< producersCount<<" потребителей: "<< consumersCount <<std::endl;
    timer.reset();
    testQueue<LockFreeQueue<myPair>>(producersCount, consumersCount, producerPower, consumerPower);
    std::cout << "Lock free: " << timer.elapsed() << " мс" << std::endl;
    
    return 0;
}

// producerPower = consumerPower = 10;
//     for (int i = 1; i< 10; i++)
//     { 
 //producersCount = consumersCount = i;
//     }
