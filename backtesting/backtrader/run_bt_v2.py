from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
import matplotlib.dates as mdates
import pytz
import os
import sys

import time as tm
import backtrader as bt


cwd = os.getcwd()
sys.path.append(f"{cwd}")
sys.path.append(f"{cwd}\\scripts")



from run_bt_func import cerebro_run, print_current_runtime, print_summary
from scripts.testing.plot.read_multi_symbols_csv import df_5m, symbols
from backtesting.functional.dataframes import get_df_title
from testing.polygon.snp500_symbols import symbols32, symbols5

from strategies.st_time import Strategy18to19
from strategies.st_each_bar_long_lr import StrategyEachBar_Long_LR



# stat
trades_info_per_date: dict[pd.Timestamp, list[tuple]] = {}


start_time = tm.time()


# extract trading days
dates: list[pd.Timestamp] = df_5m.index.normalize().unique()
print(dates)
print(f"count unique trading dates: {len(dates)}")

# iterate trading days
for i, date in enumerate(dates):

    print("="*100)
    title_date = f"date: {date.date()} ({i+1}/{len(dates)})"
    print(title_date)

    # select today
    time_begin = date
    time_end = date.replace(hour=23, minute=55)
    df_date = df_5m.loc[time_begin:time_end]
    print(get_df_title(df_date))

    if not len(df_date):
        print(f"{date}: Empty DataFrame, skip")
        continue


    trades_info: list[tuple] = [] # reset for this date trades
    symbols = df_date["symbol"].unique() # this date symbols
    
    # symbols = symbols[0:20]
    # symbols = symbols5
    # symbols = symbols32
    # symbols=["NVR"]
    # symbols=["AAPL"]
    # symbols=["LUV"]

    for i, s in enumerate(symbols):

        title_symbol = f"[{i+1}/{len(symbols)}] {s}"
        print(f"{title_date}, {title_symbol}")

        # filter by symbol
        filtered_df: pd.DataFrame = df_date[df_date['symbol']==s]
        filtered_df = filtered_df.copy()

        # filter by price
        price_threshold = 500
        if filtered_df.iloc[0]["close"] >= price_threshold:
            print(f"{s}: price >= {price_threshold}, skip plot")
            continue

        if not len(filtered_df):
            print(f"{s}: Empty DataFrame, skip")
            continue

        
        # data is in UTC time
        # 08:00----------------13:30------------------------20:00-------------00:00
        # pre-market           market(RTH)                  after-hours       close
        trades_info.extend(
            cerebro_run(
                df=filtered_df,
                # strategy=Strategy18to19,
                strategy=StrategyEachBar_Long_LR,
                # plot=False,
            )
        )

        print_current_runtime(start_time)



    # date ended
    # print_summary(trades_info) # print this date summary
    trades_info_per_date[date] = trades_info # save this date

        
    
# print all dates summary
# unite to one dataframe
trades_info_global: list[tuple] = [] # reset for this date trades
for date, trades_info in trades_info_per_date.items():
    print_summary(trades_info, date)
    trades_info_global.extend(trades_info)

print("="*50)
print_summary(trades_info_global, dates[0], dates[-1], print_df=True)
print(f"count unique trading dates: {len(dates)}")
print_current_runtime(start_time)

    
