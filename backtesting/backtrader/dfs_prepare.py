import os
import sys
import pandas as pd
from datetime import datetime, timedelta


# ----------------------------------------------
cwd = os.getcwd()
sys.path.append(f"{cwd}\\backtesting")
sys.path.append(f"{cwd}\\backtesting\\functional")
path = f"{cwd}\\backtesting\\csv_input"



# ----------------------------------------------
# read 5min timeframe data

filename="aapl_5m_2022-05-09_to_2023-07-12.csv"
# filename="amd_5m_2022-05-09_to_2023-07-12.csv"
# filename="TSLA_5m_2022-05-09_to_2023-07-12.csv"
df_5m = pd.read_csv(f"{path}/{filename}", parse_dates=["date"])
df_5m = df_5m.set_index("date")
df_5m.sort_index(ascending=True, inplace=True)
df_5m = df_5m.ffill()  # Forward-fill the NaN values

    


# ----------------------------------------------
# read 1day timeframe data
filename="aapl_1d_2019_to_2024.csv"
df_1d = pd.read_csv(f"{path}/{filename}")
df_1d["date"] = pd.to_datetime(df_1d["date"], format="%m/%d/%Y")
df_1d = df_1d.set_index("date")
df_1d.sort_index(ascending=True, inplace=True)


from functional.dataframes import print_df
if 0:
    print_df(df_5m)
    print_df(df_1d)


# default
time_begin = df_5m.index.tolist()[0]
time_end = df_5m.index.tolist()[-1]

# Selecting a subset of data
if 1:
    day=1
    month=10
    year=2022
    time_begin = datetime(year=year, month=month, day=day)
    time_end = time_begin + timedelta(days=31)
    # time_end = datetime(year=year, month=10, day=1)

    df_5m = df_5m.loc[time_begin:time_end]
    df_1d = df_1d.loc[time_begin:time_end]


