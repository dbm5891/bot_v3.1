import pandas as pd
import numpy as np

# Sample dataset
dates = pd.date_range("2024-02-01 09:30", periods=100, freq="5T")
prices = np.cumsum(np.random.randn(len(dates))) + 100

df = pd.DataFrame({"datetime": dates, "price": prices})
df["time"] = df["datetime"].dt.time
df.set_index("datetime", inplace=True)

# Function to calculate rolling regression slope with error handling
def rolling_regression(group):
    results = []
    for i in range(len(group)):
        sub_df = group.iloc[: i + 1]  # Take all points from 11:00 AM to the current bar
        x = np.arange(len(sub_df))

        # Ensure no NaN/Inf values
        y = sub_df["price"].values
        if np.isnan(y).any() or np.isinf(y).any():
            results.append(np.nan)
            continue

        # Normalize x values
        x = (x - x.mean()) / (x.std() + 1e-8)  # Avoid division by zero

        try:
            slope, _ = np.polyfit(x, y, 1)
        except np.linalg.LinAlgError:
            slope = np.nan  # Assign NaN if regression fails

        results.append(slope)

    return results

# Apply rolling regression for each day separately
if 1:
    df["slope"] = (
        df.groupby(df.index.date, group_keys=False)
        .apply(lambda x: rolling_regression(x[x["time"] >= pd.to_datetime("9:00").time()]))
    )

    # Expand lists into separate rows
    df = df.explode("slope")

# Show dataframe
print(df)