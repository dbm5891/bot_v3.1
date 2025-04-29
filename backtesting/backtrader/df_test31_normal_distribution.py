import numpy as np
import matplotlib.pyplot as plt

np.random.seed()

# Parameters
num_trials = 10000
threshold = 2  # Act only on extreme events
reversion_target = 1  # Target reversion level for profit
# Simulation
returns = []
for _ in range(num_trials):
    x = np.random.normal(0, 1)  # First random draw
    returns.append(x)
    
# Plotting the results
counts, bins, bars = plt.hist(returns, bins=100, edgecolor='k')
print(f"counts={counts}")
print(f"bins={bins}")
print(f"bars={bars}")
print(returns)
mean=np.mean(returns)
print(f"mean={mean}")
std=np.std(returns)
print(f"std={std}")
sum=np.sum(returns)
print(f"sum={sum}")

plt.title(f"Distribution of Returns({num_trials})")
plt.xlabel("Return")
plt.ylabel("Frequency")
plt.show()


