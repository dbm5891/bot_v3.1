from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd
import matplotlib.dates as mdates
import pytz
import os
import sys

from func import plot_vlines

# ----------------------------------------------
cwd = os.getcwd()
sys.path.append(f"{cwd}")
sys.path.append(f"{cwd}\\scripts")



from read_multi_symbols_csv import df_5m, symbols, from_date, to_date
from backtesting.functional.dataframes import get_df_title
from testing.polygon.snp500_symbols import symbols32, symbols5



# define Matplotlib figure and axis
fig, ax = plt.subplots()

# symbols = ["AAPL"]
# symbols = symbols5
symbols = symbols32
# symbols = symbols[0:20]

for i, s in enumerate(symbols):

    print(f"[{i+1}/{len(symbols)}] {s}")
    label=f"{i+1}) {s}"

    # filter by symbol
    filtered_df: pd.DataFrame = df_5m[df_5m['symbol']==s]
    filtered_df = filtered_df.copy()
    
    
    # filter by price
    price_threshold = 50
    if filtered_df.iloc[0]["close"] >= price_threshold:
        print(f"{s}: price >= {price_threshold}, skip plot")
        continue

    if not len(filtered_df):
        print(f"{s}: Empty DataFrame, skip plot")
        continue

    

    if 1:
        # plot by close price (absolute)
        ax.plot((filtered_df.index + pd.Timedelta(minutes=0)).tolist(), filtered_df[f'close'], label=label)
        if len(symbols) <= 32:
            plot_vlines(ax=ax, df=filtered_df, linewidth=1.5)

    
    if 0:
        today_start: pd.Timestamp = filtered_df.iloc[0].name # UTC pre-market open  8:00
        today_1330 = today_start.replace(hour=13, minute=30) # UTC market open      13:30

        # related to beginning price (relative, percentage)
        # filtered_df['pct'] = (filtered_df['close'] / filtered_df['close'].iloc[0] - 1) * 100
        filtered_df['pct'] = (filtered_df['close'] / filtered_df['close'].loc[today_1330] - 1) * 100
        
        # plot by percentage (relative)
        ax.plot((filtered_df.index + pd.Timedelta(minutes=0)).tolist(), filtered_df[f'pct'], label=label)




if 0:
    plot_vlines(ax=ax, df=df_5m, linewidth=1.5, y_min=-10, y_max=10)
    
legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency
plt.grid()

# Format x-axis to include full date and time
# ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M', tz=pytz.timezone('Asia/Jerusalem')))
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
fig.autofmt_xdate()
title = f'[{from_date.strftime("%Y-%m-%d")}] to [{to_date.strftime("%Y-%m-%d")}]'
title += f', count symbols: {len(symbols)}'

plt.title(title)
plt.show()


