import csv
from datetime import datetime, timedelta
import os
import sys
import pandas as pd
import pandas_ta as ta
import backtrader as bt

# from lists_compare_func_df import prinf_df

# Define your strategy
class MultiTimeframeStrategy(bt.Strategy):
    def __init__(self):
        # Access the data feeds by index
        self.daily_data = self.datas[0]
        self.minute_data = self.datas[1]

        # Add a MovingAverageSimple indicator
        # self.daily_rsi20 = bt.indicators.RSI(self.daily_data.close, period=14)
        self.daily_sma20 = bt.indicators.SMA(self.daily_data.close, period=20)
        
        self.minute_rsi20 = bt.indicators.RSI(self.minute_data.close, period=14)
        self.minute_sma20 = bt.indicators.SMA(self.minute_data.close, period=20)
        # self.minute_sma20 = bt.indicators.EMA(self.minute_data.close, period=20)

    def next(self):
        # Print the current close prices
        txt=""
        txt=f"daily: {self.daily_data.datetime.datetime(0)},  close: {self.daily_data.close[0]}, sma20: {self.daily_sma20[0]}    "
        txt+=f"5-min: {self.minute_data.datetime.datetime(0)}, close: {self.minute_data.close[0]}, sma20: {self.minute_sma20[0]}"
        print(txt)
        pass

        

# Create a Cerebro instance
cerebro = bt.Cerebro()





# ----------------------------------------------

cwd = os.getcwd()
sys.path.append(f"{cwd}\\bot")
path = f"{cwd}\\backtesting\\csv_input"

time_begin = datetime(year=2022, month=1, day=1)
time_end = datetime(year=2022, month=7, day=1)

# ----------------------------------------------
# read 5min timeframe data

filename="aapl_5m_2022-05-09_to_2023-07-12.csv"
df_5m = pd.read_csv(f"{path}/{filename}", parse_dates=["date"])
df_5m = df_5m.set_index("date")
# df_5m.sort_values(by="date", inplace=True, ascending=True)
df_5m.sort_index(ascending=True, inplace=True)
df_5m['sma_20'] = ta.sma(df_5m['close'], length=20)
if 1:
    df_5m = df_5m.loc[time_begin:time_end]
# prinf_df(df_5m)


# ----------------------------------------------
# read 1day timeframe data
filename="aapl_1d_2019_to_2024.csv"
df_1d = pd.read_csv(f"{path}/{filename}")
df_1d["date"] = pd.to_datetime(df_1d["date"], format="%m/%d/%Y")
df_1d = df_1d.set_index("date")
df_1d.sort_index(ascending=True, inplace=True)
# df_1d.sort_values(by="date", inplace=True, ascending=True)
df_1d['sma_20'] = ta.sma(df_1d['close'], length=20)

# Selecting a subset of data
if 1:
    df_1d = df_1d.loc[time_begin:time_end]

# prinf_df(df_1d)




# Create a data feed from the DataFrame
daily_data = bt.feeds.PandasData(dataname=df_1d)
minute_data = bt.feeds.PandasData(dataname=df_5m)


# Add the data feeds to Cerebro
cerebro.adddata(daily_data)  # Add the daily data first
cerebro.adddata(minute_data)  # Add the 5-minute data second

# Add the strategy
cerebro.addstrategy(MultiTimeframeStrategy)

# Print out the starting conditions
print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())

# Run over everything
cerebro.run()

# Print out the final result
print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())

# Plot the results
# cerebro.plot() # default (close)
# cerebro.plot(style='bar', barup="g")
cerebro.plot(
    style='candle',
    barup="g",
    bardown="r",
    # volume=False,  # Hide volume for cleaner visualization
    fmt_x_ticks='%Y-%m-%d %H:%M',  # Custom format for x-axis
    fmt_x_data='%Y-%m-%d %H:%M',   # Custom format for tooltips
)