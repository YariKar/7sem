import matplotlib.pyplot as plt


count = [1, 2, 3, 4, 5, 6]
block_times = [273215, 142097, 100036, 83828, 68686, 56472]
strassen_times = [60755, 36258, 31267, 22821, 23662, 22793]
plt.plot(count, block_times, marker='o', color='orange', label='Блочное умножение')
plt.plot(count, strassen_times, marker='o', color='blue', label='Быстрое умножение Штрассена')
plt.title('Зависимость времени выполнения от количества потоков')
plt.xlabel('Количество потоков, шт')
plt.ylabel('Время выполнения, мс')
plt.grid(True)
plt.legend()

plt.savefig('compare_chart.png')
