#include <vector>
#include <mutex>
#include <atomic>
#include <unordered_set>
#include <thread>
#include <iostream>

#define MAT_Y 500
#define MAT_N 500
#define MAT_X 500

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
class Handler {
private:
	// Узел
	struct Node {
		T data;
		std::atomic<Node*> next;
	};

	struct ThreadInfo {
		std::atomic<Node*> hp1;
		std::atomic<Node*> hp2;
		std::vector<Node*> dlist;
		int dcount = 0;
	};

	std::atomic<Node*> head;
	std::atomic<Node*> tail;

	std::vector<ThreadInfo> threadsInfo;

	void deleteRecursive(Node* elem) {
		if(elem != nullptr) {
			deleteRecursive(elem->next);
			delete elem;
		}
	}

	void retire(int threadNum, Node* ptrToDelete) {
		ThreadInfo& curTI = threadsInfo[threadNum];
		curTI.dlist[curTI.dcount++] = ptrToDelete;

		if(curTI.dcount == curTI.dlist.size()) {
			scan(threadNum);
		}
	}

	void scan(int threadNum) {
		std::unordered_set<Node*> hps;

		for(const auto& info : threadsInfo) {
			hps.insert(info.hp1);
			hps.insert(info.hp2);
		}

		int newDcount = 0;
		auto& myDlist = threadsInfo[threadNum].dlist;

		for(int i = 0; i < myDlist.size(); i++) {
			if(hps.count(myDlist[i])) {
				Node* ptr = myDlist[i];
				myDlist[i] = nullptr;
				myDlist[newDcount++] = ptr;
			} else {
				delete myDlist[i];
				myDlist[i] = nullptr;
			}
		}
		threadsInfo[threadNum].dcount = newDcount;
	}

public:
	Handler(int threadCount): threadsInfo(threadCount) {
		Node *dummy = new Node;
		head = dummy;
		tail = dummy;

		for(ThreadInfo& ti : threadsInfo) {
			ti.dlist.resize(4 * threadCount);
		}
	}

	~Handler(){
		for(const auto& info : threadsInfo) {
			for(Node* ptr : info.dlist) {
				delete ptr;
			}
		}

		deleteRecursive(head);
	}

	void push(const T& data, int threadNum) {
		Node* newTail = new Node{data};

		while(true) {
			Node* tmp = nullptr;
			Node* tail_ = tail.load();
			threadsInfo[threadNum].hp1.store(tail_);

			if(tail_ != tail.load())
				continue;

			if(tail_->next.compare_exchange_strong(tmp, newTail)) {
				tail.compare_exchange_strong(tail_, newTail);
				break;
			}

			tail.compare_exchange_strong(tail_, tail_->next.load());
		}
		threadsInfo[threadNum].hp1.store(nullptr);
	}

	bool pop(T& data, int threadNum) {
		while(true) {
			Node* head_ = head.load();
			threadsInfo[threadNum].hp1.store(head_);

			if(head_ != head.load())
				continue;

			Node* tail_ = tail.load();
			Node* nextHead = head_->next.load();
			threadsInfo[threadNum].hp2.store(nextHead);

			if(nextHead != head_->next.load())
				continue;

			// Очередь пуста
			if(nextHead == nullptr) {
				threadsInfo[threadNum].hp1.store(nullptr);
				return false;
			}

			if(head_ == tail_) {
				tail.compare_exchange_strong(tail_, nextHead);
			} else {
				if(head.compare_exchange_strong(head_, nextHead)) {
					data = nextHead->data;
					threadsInfo[threadNum].hp1.store(nullptr);
					threadsInfo[threadNum].hp2.store(nullptr);
					retire(threadNum, head_);

					break;
				}
			}
		}

		return true;
	}
};

class Matrix
{
public:
    Matrix(int rows = 0, int cols = 0)
        : _rows{rows}, _cols{cols}, _matrix(cols * rows, 0) {};
    Matrix(const Matrix &other)
        : _rows{other._rows}, _cols{other._cols}, _matrix{other._matrix} {}
    Matrix operator=(const Matrix &other)
    {
        if (this != &other)
        {
            _cols = other._cols;
            _rows = other._rows;
            _matrix = other._matrix;
        }

        return *this;
    }
    int getRows() const
    {
        return _rows;
    }
    int getCols() const
    {
        return _cols;
    }
    int getElem(int r, int c) const
    {
        return _matrix[r * _cols + c];
    }
    int &getElem(int r, int c)
    {
        return _matrix[r * _cols + c];
    }
    const int *data() const
    {
        return _matrix.data();
    }
    int *data()
    {
        return _matrix.data();
    }

private:
    int _rows;
    int _cols;
    std::vector<int> _matrix;
};

Matrix operator*(const Matrix &m1, const Matrix &m2)
{
    Matrix resMatrix(m1.getRows(), m2.getCols());

    for (int r = 0; r < resMatrix.getRows(); r++)
    {
        for (int c = 0; c < resMatrix.getCols(); c++)
        {
            for (int i = 0; i < m1.getCols(); i++)
            {
                resMatrix.getElem(r, c) += m1.getElem(r, i) * m2.getElem(i, c);
            }
        }
    }

    return resMatrix;
}

std::atomic_int tasksToComplete{0};
std::atomic_int outputMatrixLeft{0};

Matrix createMatrix(int rows, int cols)
{
	Matrix newMatrix(rows, cols);
	int j = 1;
	
	for(int r = 0; r < rows; r++) {
		for(int c = 0; c < cols; c++) {
			newMatrix.getElem(r, c) = j;
		}
	}

	return newMatrix;
}

void printMatrix(const Matrix& matrix)
{
	for(int r = 0; r < matrix.getRows(); r++){
		for(int c = 0; c < matrix.getCols(); c++){
			std::cout << matrix.getElem(r, c) << ' ';
		}
		std::cout << '\n';
	}
	std::cout << '\n';
}

void producer(Handler<std::pair<Matrix, Matrix>>& matrixPair, 
	int threadNum, int taskCount)
{
	for(int i = 0; i < taskCount; i++) {
		matrixPair.push({createMatrix(MAT_Y, MAT_N), createMatrix(MAT_N, MAT_X)}, threadNum);
	}
}

void consumer(Handler<std::pair<Matrix, Matrix>>& matrixPair, 
	Handler<Matrix>& outputMatrixes, int threadNumMP, int threadNumO)
{
	std::pair<Matrix, Matrix> task;
	while(tasksToComplete > 0) {
		if(matrixPair.pop(task, threadNumMP)) {
			tasksToComplete--;
			outputMatrixes.push(task.first * task.second, threadNumO);
		}
	}
}

void printResult(Handler<Matrix>& outputMatrixes, int threadNum)
{
	Matrix resultMatrix;
	while(outputMatrixLeft > 0) {
		if(outputMatrixes.pop(resultMatrix, threadNum)) {
			outputMatrixLeft--;
			//printMatrix(resultMatrix);
		}
	}
}

void testQueue(int amountCons, int amountProd, int amountTask){
	Handler<std::pair<Matrix, Matrix>> matrixPair(amountProd + amountCons);
	Handler<Matrix> outputMatrixes(amountCons + 1);

	tasksToComplete = amountTask * amountProd;
	outputMatrixLeft = amountTask * amountProd;
	std::vector<std::thread> producers;
	std::vector<std::thread> consumers;
	int i, j;

	for(i = 0; i < amountProd; i++) {
		producers.push_back(std::thread(producer, std::ref(matrixPair), i, amountTask));
	}

	for(j = 0; j < amountCons; j++, i++) {
		consumers.push_back(std::thread(consumer, std::ref(matrixPair), std::ref(outputMatrixes), i, j));
	}

	//std::thread output(printResult, std::ref(outputMatrixes), j);

	for(i = 0; i < amountProd; i++) {
		producers[i].join();
	}
	for(j = 0; j < amountCons; j++) {
		consumers[j].join();
	}
	output.join();
}


int main() {
	Timer timer;
	// for (int i =1; i< 10; i++)
	// {
	// 	std::cout<< "Количество производителей: "<< i<<" потребителей: "<< i <<std::endl;
    // 	timer.reset();
	// 	testQueue(i, i, 10);
	// 	std::cout << "Lock free: " << timer.elapsed() << " мс" << std::endl;
	// }
	int consAmount = 6;
	int prodAmount = 6;
	std::cout<< "Количество производителей: "<< prodAmount<<" потребителей: "<< consAmount <<std::endl;
	testQueue(6, 6, 10);
    std::cout << "Lock free: " << timer.elapsed() << " мс" << std::endl;
	return 0;
}