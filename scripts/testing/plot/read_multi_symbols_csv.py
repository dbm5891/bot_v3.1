import os
import re
import sys
import pandas as pd
from datetime import datetime, timedelta



# ----------------------------------------------
cwd = os.getcwd()
sys.path.append(f"{cwd}")
sys.path.append(f"{cwd}\\backtesting")
sys.path.append(f"{cwd}\\backtesting\\functional")



# ----------------------------------------------
# IMPORTANT: csv files are using utc time
# use this for plotting Israel time (utc+3):
# ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M', tz=pytz.timezone('Asia/Jerusalem')))
# 
# open          utc     israel (utc+3)
# pre market    8:00    11:00
# market        13:30   16:30
# after hours   20:00   23:00
# market close  0:00    03:00

# ----------------------------------------------
# read 5min timeframe data

path = f"{cwd}\\data_2020_2025\\by_dates"
# filename="5symbols_2022-05.csv" # per month
filename="503symbols_2022-05.csv" # per month
# filename="503symbols_2022-10.csv" # per month


# path = f"{cwd}\\data_2020_2025\\symbols"
# filename="NVR_5min_eth_2020-04-01_to_2025-04-10.csv" # month step

df_5m = pd.read_csv(f"{path}/{filename}", parse_dates=["timestamp"])
df_5m = df_5m.set_index("timestamp")
df_5m.sort_index(ascending=True, inplace=True)


# Selecting a subset of data (one day)
if 0:
    match = re.search(r"(\d+)symbols_(\d+)-(\d+).csv", filename)
    
    day=4
    month=int(match.group(3))
    year=int(match.group(2))
    time_begin = datetime(year=year, month=month, day=day, hour=0, minute=0)
    time_end = time_begin.replace(hour=23, minute=55)

    df_5m = df_5m.loc[time_begin:time_end]


from backtesting.functional.dataframes import print_df
print_df(df_5m)


# get symbols
# symbols = df_5m["symbol"].sort_values().unique()
symbols = df_5m["symbol"].unique()
# print(symbols)

from_date: pd.Timestamp = df_5m.index.tolist()[0]
to_date: pd.Timestamp = df_5m.index.tolist()[-1]

print(f'dates range: from [{from_date.strftime("%Y-%m-%d")}] to [{to_date.strftime("%Y-%m-%d")}] ({to_date-from_date})')
print(f"len(symbols): {len(symbols)}")

