#pragma once
#include <memory>
#include <atomic>
#include <iostream>
#include <array>
#include <functional>
#include <tuple>
#include <vector>


template <typename T>
class LockFreeQueue {
private:
    struct Node {
        T data;
        std::shared_ptr<Node> next;

        Node() : next(nullptr) {}

        explicit Node(T data) : data(data), next(nullptr) {}
    };

    std::shared_ptr<Node> head;
    std::shared_ptr<Node> tail;

public:
    explicit LockFreeQueue();
    ~LockFreeQueue();
    void push(T value);
    bool pop(T& value);
};

template <typename T>
LockFreeQueue<T>::LockFreeQueue() {
    auto dummy = std::make_shared<Node>(); // Начальная фиктивная нода
    std::atomic_store(&head, dummy);
    std::atomic_store(&tail, dummy);
}

template <typename T>
LockFreeQueue<T>::~LockFreeQueue() {
    while (head) {
        head = head->next; // Удаление узлов через shared_ptr, освобождающее память автоматически
    }
}

template <typename T>
void LockFreeQueue<T>::push(T value) {
    auto newTail = std::make_shared<Node>(value);

    while (true) {
        auto oldTail = std::atomic_load(&tail);
        std::shared_ptr<Node> tailNext = nullptr;

        // Атомарно присваиваем newTail, если tail->next пустой
        if (std::atomic_compare_exchange_strong(&oldTail->next, &tailNext, newTail)) {
            // Атомарно перемещаем tail на newTail
            std::atomic_compare_exchange_strong(&tail, &oldTail, newTail);
            return;
        } else {
            // Если tail изменился, обновляем его
            std::atomic_compare_exchange_strong(&tail, &oldTail, std::atomic_load(&oldTail->next));
        }
    }
}

template <typename T>
bool LockFreeQueue<T>::pop(T& value) {
    while (true) {
        auto oldHead = std::atomic_load(&head);
        auto oldTail = std::atomic_load(&tail);
        auto newHead = std::atomic_load(&oldHead->next);

        if (oldHead == oldTail) {
            // Если очередь пуста
            if (!newHead) {
                continue;
            }
            // Обновляем tail, если он отстал
            std::atomic_compare_exchange_strong(&tail, &oldTail, newHead);
        } else {
            if (newHead) {
                value = newHead->data;
                // Перемещаем head на newHead
                if (std::atomic_compare_exchange_strong(&head, &oldHead, newHead)) {
                    return true;
                }
            }
        }
    }
}
