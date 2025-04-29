import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import linregress

# Sample DataFrame
data = {'x': range(1, 21), 'y': [3*i + np.random.randn()*2 for i in range(1, 21)]}
df = pd.DataFrame(data)

# Number of last values to consider
n = 10  

# Select last n rows
df_last_n = df.tail(n)

# Extract x and y values
x = df_last_n['x'].values
y = df_last_n['y'].values

# Perform linear regression
slope, intercept, r_value, p_value, std_err = linregress(x, y)

# Compute regression line
y_pred = slope * x + intercept

# Plot data
plt.scatter(df['x'], df['y'], label="Original Data", alpha=0.5)
plt.scatter(x, y, color='red', label=f"Last {n} Points")
plt.plot(x, y_pred, color='blue', linewidth=2, label="Regression Line")

plt.xlabel("X")
plt.ylabel("Y")
plt.legend()
plt.title(f"Linear Regression for Last {n} Values")
plt.show()
