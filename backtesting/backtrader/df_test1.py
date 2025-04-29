import numpy as np
from datetime import datetime
from dfs_set_ta_indicators_5m import df_5m



# Selecting a subset of data
day=10
time_begin = datetime(year=2022, month=5, day=day, hour=11, minute=0)
time_end = datetime(year=2022, month=5, day=day+1, hour=3, minute=0)

df_subset = df_5m.loc[time_begin:time_end]
print(df_subset)
print(df_subset.info())


# Compute the difference
difference = df_subset["sma(50)"] - df_subset["sma(200)"]

# Identify where the sign changes (crosses occur)
crosses = np.sign(difference).diff().fillna(0) != 0

# Count the number of crosses
num_crosses = crosses.sum()

print(f"Number of crosses: {num_crosses}")