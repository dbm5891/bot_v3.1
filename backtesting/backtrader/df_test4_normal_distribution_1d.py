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
# read 1day timeframe data
filename="df_1d_percent.csv"
df_1d = pd.read_csv(f"{path}/{filename}")
df_1d["date"] = pd.to_datetime(df_1d["date"], format="%d/%m/%Y")
df_1d = df_1d.set_index("date")
df_1d.sort_index(ascending=True, inplace=True)

df_1d["percentage"]=df_1d["percentage"]*100

print(df_1d)
print(df_1d.info())


counts, bins, bars = plt.hist(df_1d["percentage"], bins=100, edgecolor='k')
print(f"counts={counts}")
print(f"bins={bins}")
print(f"bars={bars}")
mean=df_1d["percentage"].mean()
print(f"mean={mean}")
std=df_1d["percentage"].std(ddof=0)
print(f"std={std}")
sum=df_1d["percentage"].sum()
print(f"sum={sum}")

plt.title(f"num samples={len(df_1d)}")
plt.xlabel(f"[1D] bar percentage change")
plt.ylabel("count")
plt.show()


