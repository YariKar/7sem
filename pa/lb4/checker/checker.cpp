#include "checker.hpp"
#include <fstream>


bool isResultMatched(const std::string& filename1, const std::string& filename2) {
    std::ifstream inputFile1(filename1);
    std::ifstream inputFile2(filename2);

    if (!inputFile1.is_open() || !inputFile2.is_open()) {
        std::cerr << "Open file err " << std::endl;
        return false;
    }

    char char1, char2;
    while (inputFile1.get(char1) && inputFile2.get(char2)) {
        if (char1 != char2) {
            return false;
        }
    }

    return !(inputFile1.get(char1) || inputFile1.get(char2)); 
};
