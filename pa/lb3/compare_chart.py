import matplotlib.pyplot as plt


count = [1, 2, 3, 4, 5, 6, 7, 8, 9]
rough_times = [5134, 6771, 9648, 12449, 19697, 20586, 25313, 28401, 36447]
thin_times = [5110, 7154, 10148, 13476, 16639, 21170, 25072, 28385, 36451]
free_times = [5196, 6910, 8809, 12292, 15464, 18433, 23967, 29900, 31248]
plt.plot(count, rough_times, marker='o', color='orange', label='Очередь с "грубой" блокировкой')
plt.plot(count, thin_times, marker='o', color='blue', label='Очередь с "тонкой" блокировкой')
plt.plot(count, free_times, marker='o', color='green', label='Неблокирующая очередь')
plt.title('Зависимость очередей от количества производителей и потребителей')
plt.xlabel('Количество производителей и потребителей, шт')
plt.ylabel('Время выполнения, мс')
plt.grid(True)
plt.legend()

plt.savefig('compare_chart.png')
