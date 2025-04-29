from datetime import datetime, timedelta
from matplotlib import gridspec, pyplot as plt
from matplotlib.figure import Figure
from matplotlib.axes import Axes
import matplotlib.dates as mdates

import pandas as pd
import pytz
import os
import sys
import pandas_ta as ta


from func import plot_vlines, smma

# ----------------------------------------------
cwd = os.getcwd()
sys.path.append(f"{cwd}")
sys.path.append(f"{cwd}\\scripts")



from read_multi_symbols_csv import df_5m, symbols, from_date, to_date
from backtesting.functional.dataframes import get_df_title
from testing.polygon.snp500_symbols import symbols32, symbols5



# declare Matplotlib figure and axis
fig: Figure
axs: list[Axes]

# Grid with 4 rows, custom height ratios
# fig, axs = plt.subplots(nrows=3, ncols=1, sharex=True, height_ratios=[3, 1, 1])
fig, axs = plt.subplots(nrows=4, ncols=1, sharex=True, height_ratios=[3, 1, 1, 1])

# axs[0] main: prices + indicators (on plot)
# axs[1] percentage
# axs[2] indicator: ADX
# axs[3] indicator: OBV

symbols = ["AAPL"]
# symbols = symbols5
# symbols = symbols32
# symbols = symbols[0:100]

for i, s in enumerate(symbols):

    print(f"[{i+1}/{len(symbols)}] {s}")
    label=f"{i+1}) {s}"

    # filter by symbol
    filtered_df: pd.DataFrame = df_5m[df_5m['symbol']==s]

    if not len(filtered_df):
        print(f"{s}: Empty DataFrame, skip plot")
        continue

    filtered_df = filtered_df.copy()

    

    
    # filter by price
    if 1:
        price_threshold = 500
        if filtered_df.iloc[0]["close"] >= price_threshold:
            print(f"{s}: price >= {price_threshold}, skip plot")
            continue

    

    
    

    

    if 1:
        # plot by close price (absolute)
        col="close"
        axs[0].plot((filtered_df.index + pd.Timedelta(minutes=0)).tolist(), filtered_df[col], label=f"{s}.{col}")
        if len(symbols) <= 32:
            plot_vlines(ax=axs[0], df=filtered_df, linewidth=2)

        axs[0].set_title(f"price.{col}")
    
    if 1:
        axs[1].set_title("percentage")
        today_start: pd.Timestamp = filtered_df.iloc[0].name # UTC pre-market open  8:00
        today_1330 = today_start.replace(hour=13, minute=30) # UTC market open      13:30

        # related to beginning price (relative, percentage)
        # filtered_df['pct'] = (filtered_df['close'] / filtered_df['close'].iloc[0] - 1) * 100
        filtered_df['pct'] = (filtered_df['close'] / filtered_df['close'].loc[today_1330] - 1) * 100
        
        # plot by percentage (relative)
        axs[1].plot((filtered_df.index + pd.Timedelta(minutes=0)).tolist(), filtered_df[f'pct'], label=label)
        
        
        col=f"pct"
        plot_vlines(ax=axs[1], df=df_5m, linewidth=2, y_min=filtered_df[col].min(), y_max=filtered_df[col].max())
    

    # =======================
    # ta
    # =======================

    # SMA
    if 1:
        # for length in [20, 50, 200]:
        for length in [20, 50]:
            col=f"{s}.sma({length})"
            filtered_df[col] = ta.sma(filtered_df['close'], length=length)
            axs[0].plot((filtered_df.index + pd.Timedelta(minutes=0)).tolist(), filtered_df[col], label=col, linestyle='dashed')

    # Alligator indicator (Bill Williams)
    if 1:
        # sma is much noisier than ssma 
        jaw=13
        teeth=8
        lips=5
        # for length in [20, 50, 200]:
        # for length in [5, 8, 13]:
        for length in [lips, teeth, jaw]:
            col=f"{s}.smma({length})"
            filtered_df[col] = smma(filtered_df['close'], period=length)
            axs[0].plot((filtered_df.index + pd.Timedelta(minutes=0)).tolist(), filtered_df[col], label=col)

        col=f"{s}.alligator_down"
        filtered_df[col] = (filtered_df[f"{s}.smma({5})"] < filtered_df[f"{s}.smma({8})"]) & (filtered_df[f"{s}.smma({8})"] < filtered_df[f"{s}.smma({13})"])
        alligator_down_df = filtered_df[filtered_df[col]==True]
        axs[0].plot(alligator_down_df.index.tolist(), alligator_down_df["close"], label=col, marker='o', markersize=8, color='salmon', alpha=0.30, linestyle='None')

        col=f"{s}.alligator_up"
        filtered_df[col] = (filtered_df[f"{s}.smma({5})"] > filtered_df[f"{s}.smma({8})"]) & (filtered_df[f"{s}.smma({8})"] > filtered_df[f"{s}.smma({13})"])
        alligator_up_df = filtered_df[filtered_df[col]==True]
        axs[0].plot(alligator_up_df.index.tolist(), alligator_up_df["close"], label=col, marker='o', markersize=8, color='lime', alpha=0.30, linestyle='None')


        
        
        # Measure Absolute Distances
        filtered_df['dist_jaw_teeth'] = (filtered_df[f"{s}.smma({jaw})"] - filtered_df[f"{s}.smma({teeth})"]).abs()
        filtered_df['dist_teeth_lips'] = (filtered_df[f"{s}.smma({teeth})"] - filtered_df[f"{s}.smma({lips})"]).abs()
        filtered_df['dist_jaw_lips'] = (filtered_df[f"{s}.smma({jaw})"] - filtered_df[f"{s}.smma({lips})"]).abs()

        # Total distance as a proxy for convergence
        filtered_df['alligator_spread'] = filtered_df['dist_jaw_teeth'] + filtered_df['dist_teeth_lips'] + filtered_df['dist_jaw_lips']
        filtered_df['normalized_spread'] = filtered_df['alligator_spread'] / filtered_df['close']


    
    
    
    # ADX
    if 1:
        axs[2].set_title("Average Directional Movement (ADX)")
        length=14
        adx_df = ta.adx(high=filtered_df["high"], low=filtered_df["low"], close=filtered_df["close"], length=length, append=True)
        
        for param in ["ADX", "DMP", "DMN"]:
            filtered_df[f"{s}.{param}({length})"] = adx_df[f"{param}_{length}"]
        
        col=f"{s}.ADX({length})"
        axs[2].plot(filtered_df.index.tolist(), filtered_df[col], label=col, color="b", linestyle='dashed')
        col=f"{s}.DMP({length})"
        axs[2].plot(filtered_df.index.tolist(), filtered_df[col], label=col, color="g")
        col=f"{s}.DMN({length})"
        axs[2].plot(filtered_df.index.tolist(), filtered_df[col], label=col, color="r")
        
        for y0 in [20, 25]:
            axs[2].plot(filtered_df.index.tolist(), pd.Series(y0, index=range(len(filtered_df))), label=y0, color="gold", linestyle='solid', alpha=0.50)

        col=f"{s}.ADX({length})"
        plot_vlines(ax=axs[2], df=df_5m, linewidth=2, y_min=filtered_df[col].min(), y_max=filtered_df[col].max())


    
    
    
    
    
    # OBV
    if 1:
        axs[3].set_title("On Balance Volume (OBV)")
        col=f"{s}.obv"
        filtered_df[col] = ta.obv(close=filtered_df['close'], volume=filtered_df['volume'])
        axs[3].plot(filtered_df.index.tolist(), filtered_df[col], label=col)

        length=20
        col2=f"{s}.obv.sma({length})"
        filtered_df[col2] = ta.sma(filtered_df[col], length=length)
        axs[3].plot(filtered_df.index.tolist(), filtered_df[col2], label=col2)

        plot_vlines(ax=axs[3], df=df_5m, linewidth=2, y_min=filtered_df[col].min(), y_max=filtered_df[col].max())

    
    
    # RSI
    if 0:
        axs[3].set_title("Relative Strength Index (RSI)")
        length=20
        col=f"{s}.rsi({length})"
        filtered_df[col] = ta.rsi(close=filtered_df['close'], length=length)
        axs[3].plot(filtered_df.index.tolist(), filtered_df[col], label=col)

        for y0 in [30, 50, 70]:
            axs[3].plot(filtered_df.index.tolist(), pd.Series(y0, index=range(len(filtered_df))), label=y0, color="gold", linestyle='solid', alpha=0.50)

        plot_vlines(ax=axs[3], df=df_5m, linewidth=2, y_min=filtered_df[col].min(), y_max=filtered_df[col].max())
    
    
    


    # alligator_spread / normalized_spread
    if 0:
        col=f"alligator_spread"
        col=f"normalized_spread"
        axs[3].set_title(col)
        axs[3].plot(filtered_df.index.tolist(), filtered_df[col], label=col)

        plot_vlines(ax=axs[3], df=df_5m, linewidth=2, y_min=filtered_df[col].min(), y_max=filtered_df[col].max())


    print(filtered_df)
    print(filtered_df.info())




# hide axes
# axs[1].remove() # percentage
# axs[2].remove() # ADX
    

# Add grid to all subplots
for ax in axs:
    legend = ax.legend(loc='best')
    legend.get_frame().set_alpha(0)  # Set transparency

    ax.grid(True)

# Format x-axis to include full date and time
# axs[0].xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M', tz=pytz.timezone('Asia/Jerusalem')))
axs[0].xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
fig.autofmt_xdate()
title = f'[{from_date.strftime("%Y-%m-%d")}] to [{to_date.strftime("%Y-%m-%d")}]'
title += f', count symbols: {len(symbols)}'

# plt.title(title)
plt.suptitle(title)
plt.show()


