from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd
import matplotlib.dates as mdates
import pytz

from read_single_symbol_csv import df_5m
from backtesting.functional.dataframes import get_df_title


# define Matplotlib figure and axis
fig, ax = plt.subplots()


# x-axis (datetime)
x=(df_5m.index + pd.Timedelta(minutes=5)).tolist() # close
ax.plot(x, df_5m["close"], label="[5m] close", color="tab:orange") # else: plot 'close' as 'signal_column'


    
legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)
plt.grid()

# Format x-axis to include full date and time
ax.xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M', tz=pytz.timezone('Asia/Jerusalem')))
fig.autofmt_xdate()
title = f'{get_df_title(df_5m)}, symbol: \"{df_5m.iloc[0]["symbol"]}\"'

plt.title(title)
plt.show()


