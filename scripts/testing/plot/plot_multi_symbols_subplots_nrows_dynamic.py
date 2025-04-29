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
import numpy as np



from func import Plotter, Plotter_daily_vlines, plot_vlines, smma

# ----------------------------------------------
cwd = os.getcwd()
sys.path.append(f"{cwd}")
sys.path.append(f"{cwd}\\scripts")



from read_multi_symbols_csv import df_5m, symbols, from_date, to_date
from backtesting.functional.dataframes import get_df_title
from testing.polygon.snp500_symbols import symbols32, symbols5




symbols = ["AAPL"]
# symbols = ["TSLA"]
# symbols = symbols5
# symbols = symbols32
# symbols = symbols[0:100]






# 1. prepare data
plots: list[Plotter] = [] # plot data
plots_vlines: list[Plotter] = [] # plot daily vlines boundries

# 2. build the figure



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
    if 0:
        price_threshold = 500
        if filtered_df.iloc[0]["close"] >= price_threshold:
            print(f"{s}: price >= {price_threshold}, skip plot")
            continue

    

    
    

    

    if 1:
        col=f"close"
        plots.append(Plotter(subplot="main", subplot_title="price", df=filtered_df, column=col, label=f"{s}.close"))
        plots_vlines.append(Plotter_daily_vlines(subplot="main", df=filtered_df, column=col))
    
    
    
    
    if 1:
        col=f"{s}.pct"
        today_start: pd.Timestamp = filtered_df.iloc[0].name # UTC pre-market open  8:00
        today_1330 = today_start.replace(hour=13, minute=30) # UTC market open      13:30

        # related to beginning price (relative, percentage)
        # filtered_df[col] = (filtered_df['close'] / filtered_df['close'].iloc[0] - 1) * 100
        
        # related to market open price (relative, percentage): utc time
        filtered_df[col] = (filtered_df['close'] / filtered_df['close'].loc[today_1330] - 1) * 100
        
        
        plots.append(Plotter(subplot="pct", df=filtered_df, column=col, label=col))
        plots_vlines.append(Plotter_daily_vlines(subplot="pct", df=filtered_df, column=col))
        
        
        
        

    # =======================
    # ta
    # =======================

    # SMA
    if 1:
        # for length in [20, 50, 200]:
        for length in [20, 50]:
            col=f"{s}.sma({length})"
            filtered_df[col] = ta.sma(filtered_df['close'], length=length)

            plots.append(Plotter(subplot="main", df=filtered_df, column=col, label=col, linestyle='dashed'))



    # bbands
    if 1:
        bb_length=20
        bb_std=2.0
        bb_mamode="sma"
        bbands = ta.bbands(close=filtered_df['close'], length=bb_length, std=bb_std, mamode=bb_mamode)
        
        filtered_df[f"bbands({bb_length}, {bb_std}, {bb_mamode}, upper)"] = bbands[f"BBU_{bb_length}_{bb_std}"]
        filtered_df[f"bbands({bb_length}, {bb_std}, {bb_mamode}, middle)"] = bbands[f"BBM_{bb_length}_{bb_std}"]
        filtered_df[f"bbands({bb_length}, {bb_std}, {bb_mamode}, lower)"] = bbands[f"BBL_{bb_length}_{bb_std}"]    
        filtered_df[f"bbands({bb_length}, {bb_std}, {bb_mamode}, bandwidth)"] = bbands[f"BBB_{bb_length}_{bb_std}"]
        filtered_df[f"bbands({bb_length}, {bb_std}, {bb_mamode}, percent)"] = bbands[f"BBP_{bb_length}_{bb_std}"]

        col=f"bbands({bb_length}, {bb_std}, {bb_mamode}, upper)"
        plots.append(Plotter(subplot="main", df=filtered_df, column=col, label=col, linestyle='dashdot'))
        col=f"bbands({bb_length}, {bb_std}, {bb_mamode}, middle)"
        plots.append(Plotter(subplot="main", df=filtered_df, column=col, label=col, linestyle='dashdot', alpha=0.50))
        col=f"bbands({bb_length}, {bb_std}, {bb_mamode}, lower)"
        plots.append(Plotter(subplot="main", df=filtered_df, column=col, label=col, linestyle='dashdot'))

    
    # bband: bandwidth
    if 1:
        col=f"bbands({bb_length}, {bb_std}, {bb_mamode}, bandwidth)"
        plots.append(Plotter(subplot=f"bband", subplot_title="bband.bandwidth", df=filtered_df, column=col, label=col))

        for y0 in []:
            df_y0 = pd.DataFrame(y0, index=filtered_df.index, columns=[y0])
            plots.append(Plotter(subplot="bband", df=df_y0, column=y0, label=y0, color="gold", linestyle='solid', alpha=0.50))

        plots_vlines.append(Plotter_daily_vlines(subplot=f"bband", df=filtered_df, column=col))

        
    


    
    # vwap (Volume Weighted Average Price)
    if 1:
        col=f"{s}.vwap"
        filtered_df[col] = ta.vwap(high=filtered_df['high'], low=filtered_df['low'], close=filtered_df['close'], volume=filtered_df['volume'])
        plots.append(Plotter(subplot="main", df=filtered_df, column=col, label=col, linestyle='dotted'))



    
    # vwma (Volume Weighted Moving Average)
    if 0:
        length=20
        col=f"{s}.vwma({length})"
        filtered_df[col] = ta.vwma(close=filtered_df['close'], volume=filtered_df['volume'], length=length)
        plots.append(Plotter(subplot="main", df=filtered_df, column=col, label=col, linestyle='dashed'))

        # col=f"vwap"        
        # plots.append(Plotter(subplot="main", df=filtered_df, column=col, label=col, linestyle='dashed'))




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
            plots.append(Plotter(subplot="main", df=filtered_df, column=col, label=col))


        col=f"{s}.alligator_down"
        filtered_df[col] = (filtered_df[f"{s}.smma({5})"] < filtered_df[f"{s}.smma({8})"]) & (filtered_df[f"{s}.smma({8})"] < filtered_df[f"{s}.smma({13})"])
        alligator_down_df = filtered_df[filtered_df[col]==True]
        # axs[0].plot(alligator_down_df.index.tolist(), alligator_down_df["close"], label=col, marker='o', markersize=8, color='salmon', alpha=0.30, linestyle='None')
        plots.append(Plotter(subplot="main", df=alligator_down_df, column="close", label=col, marker='o', markersize=8, color='salmon', alpha=0.30, linestyle='None'))

        col=f"{s}.alligator_up"
        filtered_df[col] = (filtered_df[f"{s}.smma({5})"] > filtered_df[f"{s}.smma({8})"]) & (filtered_df[f"{s}.smma({8})"] > filtered_df[f"{s}.smma({13})"])
        alligator_up_df = filtered_df[filtered_df[col]==True]
        # axs[0].plot(alligator_up_df.index.tolist(), alligator_up_df["close"], label=col, marker='o', markersize=8, color='lime', alpha=0.30, linestyle='None')
        plots.append(Plotter(subplot="main", df=alligator_up_df, column="close", label=col, marker='o', markersize=8, color='lime', alpha=0.30, linestyle='None'))


        
        
    
    
    # alligator_spread / normalized_spread
    if 1:
        
        # Measure Absolute Distances
        filtered_df['dist_jaw_teeth'] = (filtered_df[f"{s}.smma({jaw})"] - filtered_df[f"{s}.smma({teeth})"]).abs()
        filtered_df['dist_teeth_lips'] = (filtered_df[f"{s}.smma({teeth})"] - filtered_df[f"{s}.smma({lips})"]).abs()
        filtered_df['dist_jaw_lips'] = (filtered_df[f"{s}.smma({jaw})"] - filtered_df[f"{s}.smma({lips})"]).abs()

        # Total distance as a proxy for convergence
        filtered_df['alligator_spread_absolute'] = filtered_df['dist_jaw_teeth'] + filtered_df['dist_teeth_lips'] + filtered_df['dist_jaw_lips']
        filtered_df['alligator_spread_normalized'] = filtered_df['alligator_spread_absolute'] / filtered_df['close']


        # col=f"alligator_spread_absolute"
        col=f"alligator_spread_normalized"

        plots.append(Plotter(subplot="alligator", subplot_title=col, df=filtered_df, column=col, label=col))
        plots_vlines.append(Plotter_daily_vlines(subplot="alligator", df=filtered_df, column=col))

    
    
    
    # ADX
    if 1:
        length=14
        adx_df = ta.adx(high=filtered_df["high"], low=filtered_df["low"], close=filtered_df["close"], length=length, append=True)
        
        for param in ["ADX", "DMP", "DMN"]:
            filtered_df[f"{s}.{param}({length})"] = adx_df[f"{param}_{length}"]
        
        col=f"{s}.ADX({length})"
        plots.append(Plotter(subplot="adx", subplot_title="Average Directional Movement (ADX)", df=filtered_df, column=col, label=col, color="b", linestyle='dashed'))
        col=f"{s}.DMP({length})"
        plots.append(Plotter(subplot="adx", df=filtered_df, column=col, label=col, color="g"))
        col=f"{s}.DMN({length})"
        plots.append(Plotter(subplot="adx", df=filtered_df, column=col, label=col, color="r"))
        
        for y0 in [20]:
            df_y0 = pd.DataFrame(y0, index=filtered_df.index, columns=[y0])
            plots.append(Plotter(subplot="adx", df=df_y0, column=y0, label=y0, color="gold", linestyle='solid', alpha=0.50))

        plots_vlines.append(
            Plotter_daily_vlines(
                subplot="adx", 
                df=filtered_df, 
                column=f"{s}.ADX({length})", 
                # y_min=filtered_df[col].min(), 
                # y_max=filtered_df[col].max()
            )
        )


    
    
    
    
    
    # OBV
    if 1:
        col=f"{s}.obv"
        filtered_df[col] = ta.obv(close=filtered_df['close'], volume=filtered_df['volume'])        
        plots.append(Plotter(subplot="obv", subplot_title="On Balance Volume (OBV)", df=filtered_df, column=col, facecolor="lightgray", label=col, linestyle="solid", color="r", alpha=0.80))
        plots_vlines.append(Plotter_daily_vlines(subplot="obv", df=filtered_df, column=col))

        for length in [20, 50]:
            col2=f"{s}.obv.sma({length})"
            filtered_df[col2] = ta.sma(filtered_df[col], length=length)        
            plots.append(Plotter(subplot="obv", df=filtered_df, column=col2, label=col2))

        
    
        if 1:
            # slope
            diff_period=2
            for length in [20, 50]:
                col2=f"{s}.obv.sma({length})"
                col3=f"{col2}.diff({diff_period})"
                filtered_df[col3] = filtered_df[col2].diff(diff_period)
                plots.append(Plotter(subplot="obv.slope", df=filtered_df, column=col3, label=col3, facecolor="lightgray"))
            
            
            for y0 in [0]:
                df_y0 = pd.DataFrame(y0, index=filtered_df.index, columns=[y0])
                plots.append(Plotter(subplot="obv.slope", df=df_y0, column=y0, label=y0, color="gold", linestyle='solid', alpha=0.50))

            
            plots_vlines.append(Plotter_daily_vlines(subplot="obv.slope", df=filtered_df, column=col3))


    
    
    # RSI
    if 1:
        # axes[3].set_title("Relative Strength Index (RSI)")
        length=14
        col=f"{s}.rsi({length})"
        filtered_df[col] = ta.rsi(close=filtered_df['close'], length=length)
        # axs[3].plot(filtered_df.index.tolist(), filtered_df[col], label=col)
        plots.append(Plotter(subplot="rsi", subplot_title="Relative Strength Index (RSI)", df=filtered_df, column=col, label=col))

        for y0 in [50]:
            df_y0 = pd.DataFrame(y0, index=filtered_df.index, columns=[y0])
            plots.append(Plotter(subplot="rsi", df=df_y0, column=y0, label=y0, color="gold", linestyle='solid', alpha=0.50))

        plots_vlines.append(Plotter_daily_vlines(subplot="rsi", df=filtered_df, column=col))
    
    


    


    print(filtered_df)
    print(filtered_df.info())



# ===============================================================
# extract sub plot names (and make list unique)
secondary_subplots_names = []
for p in plots:
    if p.subplot != "main": # exclude "main"
        secondary_subplots_names.append(p.subplot)
secondary_subplots_names=list(set(secondary_subplots_names))
secondary_subplots_names.sort()

print(f"subplots({len(secondary_subplots_names)+1}): ['main'] {secondary_subplots_names}")

n_subplots = len(secondary_subplots_names)+1 # include "main"

# Height ratios: first plot takes half, rest share the other half
if n_subplots > 1:
    height_ratios = [n_subplots - 1] + [1] * (n_subplots - 1)
else:
    height_ratios = [1]

gs = gridspec.GridSpec(n_subplots, 1, height_ratios=height_ratios)

fig: Figure = plt.figure()

# create main axis
axes: dict[str, Axes] = {"main": fig.add_subplot(gs[0])}
axes["main"].set_title("main") # default title

# create other axes
for i, name in enumerate(secondary_subplots_names):
    ax = fig.add_subplot(gs[i+1], sharex=axes["main"])
    axes[name] = ax
    ax.set_title(f"[{name}]") # default title



# plot data
print(f"len(plots): {len(plots)}")
if 1:
    for p in plots:
        
        print(f"subplot: {p.subplot}, column: {p.column}")

        # get axis
        ax = axes[p.subplot]

        # plot data
        # ax.plot(filtered_df.index.tolist(), pd.Series(y0, index=range(len(filtered_df))), label=y0, color="gold", linestyle='solid', alpha=0.50)
        # ax.plot(p.df.index.tolist(), pd.Series(y0, index=range(len(filtered_df))), label=y0, color="gold", linestyle='solid', alpha=0.50)
        ax.plot(
            p.df.index.tolist(), 
            p.df[p.column], 
            label=p.label,
            marker=p.marker,
            markersize=p.markersize,
            color=p.color, 
            linestyle=p.linestyle, 
            alpha=p.alpha,
        )
        if p.subplot_title:
            ax.set_title(f"[{p.subplot}] {p.subplot_title}")
        if p.facecolor:
            ax.set_facecolor(p.facecolor)





# plot daily vline
print(f"len(plots_vlines): {len(plots_vlines)}")
if 1:
    for p in plots_vlines:
        
        print(f"subplot: {p.subplot}, column: {p.column}")

        # get axis
        ax = axes[p.subplot]
        # plot_vlines(ax=ax, df=p.df, column=p.column, linewidth=2, y_min=p.df[p.column].min(), y_max=p.df[p.column].max())
        plot_vlines(ax=ax, df=p.df, column=p.column, linewidth=2)
    







# axes: plot legend, grid
for name, ax in axes.items():
    ax.grid(True)
    legend = ax.legend(loc='best')
    legend.get_frame().set_alpha(0)  # Set transparency

    





# interactive crosshair synchronization across all subplots (slow performance)
if 0:
    # Create one vertical line per subplot
    vlines = [ax.axvline(x=df_5m.iloc[0].name, color='red', linestyle='--', visible=True) for ax in axes.values()]

    # Mouse move event handler (without label)
    def on_mouse_move(event):
        # print(event)
        if event.xdata is not None:
            xdate = mdates.num2date(event.xdata)
            for vline in vlines:
                vline.set_xdata(xdate)
                vline.set_visible(True)

            fig.canvas.draw_idle()
        else:
            for vline in vlines:
                vline.set_visible(False)
            fig.canvas.draw_idle()

    # Connect the event
    fig.canvas.mpl_connect('motion_notify_event', on_mouse_move)












# Format x-axis to include full date and time
# axes["main"].xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M', tz=pytz.timezone('Asia/Jerusalem')))
axes["main"].xaxis.set_major_formatter(mdates.DateFormatter('%Y-%m-%d %H:%M'))
fig.autofmt_xdate()
title = f'[{from_date.strftime("%Y-%m-%d")}] to [{to_date.strftime("%Y-%m-%d")}]'
title += f', {symbols}({len(symbols)})'

plt.suptitle(title)
plt.show()


