from matplotlib import pyplot as plt
import pandas as pd
import os
import sys
from datetime import datetime, timedelta



# ----------------------------------------------
cwd = os.getcwd()
sys.path.append(f"{cwd}\\backtesting")
sys.path.append(f"{cwd}\\backtesting\\functional")
path = f"{cwd}\\backtesting\\csv_input"


# ----------------------------------------------
# read 5min timeframe data
filename="aapl_5m_2022-05-09_to_2023-07-12.csv"
# filename="aapl_5m_2022-05-09_to_2023-07-12 - Copy.csv"
df_5m = pd.read_csv(f"{path}/{filename}", parse_dates=["date"])
df_5m = df_5m.set_index("date")
df_5m.sort_index(ascending=True, inplace=True)
df_5m = df_5m.ffill()  # Forward-fill the NaN values

df_5m['open_close_change'] = df_5m['close'] - df_5m['open']
df_5m['percentage'] = df_5m['open_close_change'] / df_5m['open']

print(df_5m)
print(df_5m.info())

# Selecting a subset of data
if 1:
    day=1
    month=10
    year=2022
    # time_begin = datetime(year=year, month=month, day=day, hour=16, minute=30)
    # time_end = time_begin + timedelta(days=30, hours=6, minutes=30)

    time_begin = datetime(year=year, month=month, day=day)
    time_end = time_begin + timedelta(days=100)
    # time_end = datetime(year=year, month=10, day=1)

    df_5m = df_5m.loc[time_begin:time_end]




df_5m["percentage"]=df_5m["percentage"]*100

print(df_5m)
print(df_5m.info())


counts, bins, bars = plt.hist(df_5m["percentage"], bins=100, edgecolor='k')
print(f"counts={counts}")
print(f"bins={bins}")
print(f"bars={bars}")
mean=df_5m["percentage"].mean()
print(f"mean={mean}")
std=df_5m["percentage"].std(ddof=0)
print(f"std={std}")
sum=df_5m["percentage"].sum()
print(f"sum={sum}")

plt.title(f"num samples={len(df_5m)}")
plt.xlabel(f"[5m] bar percentage change")
plt.ylabel("count")
plt.show()


