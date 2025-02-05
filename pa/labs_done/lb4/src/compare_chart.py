import matplotlib.pyplot as plt


count = [1, 2, 3, 4, 5, 6]
block_times = [202068, 70785, 48217, 45140, 42434, 34214]
strassen_times = [59143, 33740, 24395, 21545, 18290, 15344]
plt.plot(count, block_times, marker='o', color='orange', label='Блочное умножение')
plt.plot(count, strassen_times, marker='o', color='blue', label='Быстрое умножение Штрассена')
plt.title('Зависимость времени выполнения от количества потоков')
plt.xlabel('Количество потоков, шт')
plt.ylabel('Время выполнения, мс')
plt.grid(True)
plt.legend()

plt.savefig('compare_chart.png')
