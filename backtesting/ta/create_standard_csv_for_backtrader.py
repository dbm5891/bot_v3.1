import os
import sys
import backtrader as bt
from datetime import datetime, timedelta

from lists_compare_func import read_csv

# create standard csv file for cerebro run
df=read_csv()
print(df)

selected_columns = [
    "ruler_time_begin",
    "symbol",	
    "open",	
    "close",
    "high",
    "low",
    "volume"
]

new_df = df[selected_columns]

# Display the new DataFrame
print(new_df)
new_df = new_df.rename(columns={"ruler_time_begin": "date"})
new_df = new_df.set_index("date")
print(new_df)

cwd = os.getcwd()
sys.path.append(f"{cwd}\\bot")
# path = f"{cwd}\\scripts\\outputs_sim\\csv_candles_5min"
path = f"{cwd}\\backtesting\\csv_input"
filename = "AMD_5m_2022-05-09_to_2023-07-12.csv",
new_df.to_csv(f"{path}\\{filename}")

if 0:
    # Selecting a subset of data
    time_begin = datetime(year=2022, month=5, day=11, hour=11, minute=5)
    # time_end = datetime(year=2022, month=5, day=11, hour=19, minute=5)
    time_end = time_begin + timedelta(days=1) - timedelta(minutes=5)

    df_subset = df.loc[time_begin:time_end]
    print(df_subset)
    print(df_subset.info())




