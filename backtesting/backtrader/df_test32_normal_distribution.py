import numpy as np
import matplotlib.pyplot as plt

np.random.seed(42)

# Parameters
num_trials = 100000
threshold = 2  # Act only on extreme events
reversion_target = 1  # Target reversion level for profit
total=0
# Simulation
returns = []
for _ in range(num_trials):
    x = np.random.normal(0, 1)  # First random draw
    if abs(x) >= threshold:
        next_x = np.random.normal(0, 1)  # Next step
        # returns.append(next_x)  # Profit
        # returns.append(abs(next_x))  # Profit

        if 1:
            # Check if reversion happened
            if abs(next_x) < abs(x) - reversion_target:
                returns.append(1)  # Profit
            else:
                returns.append(-1)  # Loss

# Results
num_trades = len(returns)
win_rate = returns.count(1) / num_trades
average_return = np.mean(returns)

# Plotting the results
counts, bins, bars = plt.hist(returns, bins=10, edgecolor='k')
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

plt.title("Distribution of Returns")
plt.xlabel("Return")
plt.ylabel("Frequency")
plt.show()

(num_trades, win_rate, average_return)

