from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd

from dfs_set_ta_indicators import df_5m, df_1d
from dfs_prepare import time_begin, time_end
from dfs_set_ta_indicators import lengths, primary_length, secondary_length, signal_column, prominence_left_base, col_names, diff_period, indicator, sigma
from dfs_set_ta_indicators import bb_length, bb_std, bb_mamode
from functional.dataframes import plot_1D_candles, plot_1D_eth_vlines, plot_1D_pivot_lines, plot_5m_candles, plot_text, print_df



# symbol
symbol_df_1d=df_1d['symbol'].iloc[0]
symbol_df_5m=df_5m['symbol'].iloc[0]
if symbol_df_1d != symbol_df_5m:
    raise ValueError("dataframes must represent same symbol.")
symbol=symbol_df_1d


# define Matplotlib figure and axis
fig, ax = plt.subplots()

plot_1D_eth_vlines(ax, df_1d)
plot_1D_pivot_lines(ax, df_1d)



# ----------------------------------------------
# plot daily "open", "close" prices
rows_1d = []

# WARN: treating keys as positions is deprecated.
# for i in range(len(df_1d)):
#     rows_1d.append({'date': df_1d.iloc[i].name.replace(hour=16, minute=30), 'price': df_1d['open'][i]})
#     rows_1d.append({'date': df_1d.iloc[i].name.replace(hour=23, minute=0), 'price': df_1d['close'][i]})

for i, row in df_1d.iterrows():
    rows_1d.append({'date': row.name.replace(hour=16, minute=30), 'price': df_1d['open'][i]})
    rows_1d.append({'date': row.name.replace(hour=23, minute=0), 'price': df_1d['close'][i]})

df_1d_open_close = pd.DataFrame(rows_1d)
df_1d_open_close = df_1d_open_close.set_index("date")
df_1d_open_close.sort_index(ascending=True, inplace=True)

print_df(df_1d_open_close)

ax.plot(df_1d_open_close.index.tolist(), df_1d_open_close["price"], label="[D] open, close")




# ----------------------------------------------
# 1D
# ----------------------------------------------
# ax.plot(df_1d.index.tolist(), df_1d["close"], label="close (1d)")
# ax.plot(df_1d.index.tolist(), df_1d["ohlc4"], label="ohlc4 (1d)")
# ax.plot(df_1d.index.tolist(), df_1d["sma_10"], label="sma_10 (1d)")
ax.plot(df_1d.index.tolist(), df_1d["sma(20)"], label="[D] sma(20)")
# ax.plot(df_1d.index.tolist(), df_1d["sma_50"], label="sma_50 (1d)")
# ax.plot(df_1d.index.tolist(), df_1d["sma_200"], label="[D] sma(200)")

# ax.plot(df_1d.index.tolist(), df_1d["zlma_20"], label="[D] zlma(20)")
# ax.plot(df_1d.index.tolist(), df_1d["ema_20"], label="[D] ema(20)")

# ax.plot(df_1d.index.tolist(), df_1d["close_rolling"], label="close_rolling (1d)")
# ax.plot(df_1d.index.tolist(), df_1d["sma_20_rolling"], label="sma_20_rolling (1d)")

# ax.plot(df_1d.index.tolist(), df_1d["BB_Middle"], label="BB_Middle (1d)")
# ax.plot(df_1d.index.tolist(), df_1d["BB_Upper"], label="BB_Upper (1d)")
# ax.plot(df_1d.index.tolist(), df_1d["BB_Lower"], label="BB_Lower (1d)")

# Annotate the direction on the plot
if 0:
    plot_text(ax, df_1d)



# ----------------------------------------------
# 5min
# ----------------------------------------------
if 1:
    ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m["close"], label="[5m] close")
    l=10
    # ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m[f'sma(10).sma({l})'], label=f"[5m] sma(10).sma({l})")
    # ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m[f'ema(10).ema({l})'], label=f"[5m] ema(10).ema({l})")
    ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m[f'zlma(10).zlma({l})'], label=f"[5m] zlma(10).zlma({l})")

if 0:
    ax.plot(df_5m.index.tolist(), df_5m["sma_20"], label="[5m] sma(20)")
    

# ax.plot(df_5m.index.tolist(), df_5m[f"zlma_{length}"], label=f"[5m] zlma({length})")
# ax.plot(df_5m.index.tolist(), df_5m["zlma_20_smooth"], label="[5m] zlma_20_smooth(5)")
if 0:    
    ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m["BB_Middle"], label=f"[5m] BB_Middle({bb_length}, {bb_std}, {bb_mamode})")
    ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m["BB_Upper"], label=f"[5m] BB_Upper({bb_length}, {bb_std}, {bb_mamode})")
    ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m["BB_Lower"], label=f"[5m] BB_Lower({bb_length}, {bb_std}, {bb_mamode})")


if 1:
    for l in lengths:
        # ax.plot(df_5m.index.tolist(), df_5m[f'sma({l})'], label=f"[5m] sma({l})")
        # ax.plot(df_5m.index.tolist(), df_5m[f'ema({l})'], label=f"[5m] ema({l})")
        # ax.plot(df_5m.index.tolist(), df_5m[f'zlma({l})'], label=f"[5m] zlma({l})")
        
        ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m[f'{indicator.__name__}({l})'], label=f"[5m] {indicator.__name__}({l})")


if 0:
    ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m["gaussian"], label=f"[5m] gaussian")

if 0:
    ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m[f'gma({sigma})'], label=f"[5m] gma({sigma})")

if 0:
    ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m[f'zlma({primary_length})'], label=f"[5m] zlma({primary_length})")
    ax.plot((df_5m.index + pd.Timedelta(minutes=5)).tolist(), df_5m[signal_column], label=f"[5m] {signal_column}")

if 1:
    # peaks
    ax.plot(
        (df_5m.index + pd.Timedelta(minutes=5)).tolist(), 
        df_5m[f'peaks'], 
        label=f"[5m] {signal_column}.peaks({prominence_left_base})", 
        marker='o', markersize=12, color='yellow', markeredgecolor='black', linestyle='None'
    )

    # valleys
    ax.plot(
        (df_5m.index + pd.Timedelta(minutes=5)).tolist(), 
        df_5m[f'valleys'], 
        label=f"[5m] {signal_column}.valleys({prominence_left_base})", 
        marker='o', markersize=12, color='cyan', markeredgecolor='black', linestyle='None'
    )

# indicators alignment
if 1:
    alpha=1

    # diff alignment (slope)
    key=f"{col_names}.diff({diff_period}).aligned"
    
    filtered_values = df_5m[df_5m[key] == 1]
    # y=filtered_values['close']
    y=filtered_values[signal_column]
    ax.plot((filtered_values.index + pd.Timedelta(minutes=5)).tolist(), y, label=f"[5m] {key}==1", marker='o', color='green', alpha=alpha, linestyle='None')
    
    filtered_values = df_5m[df_5m[key] == -1]
    y=filtered_values[signal_column]
    ax.plot((filtered_values.index + pd.Timedelta(minutes=5)).tolist(), y, label=f"[5m] {key}==-1", marker='o', color='red', alpha=alpha, linestyle='None')
    
    
    # value alignment
    key=f"{col_names}.aligned"

    filtered_values = df_5m[df_5m[key] == 1]
    y=filtered_values[signal_column]
    ax.plot((filtered_values.index + pd.Timedelta(minutes=5)).tolist(), y, label=f"[5m] {key}==1", marker='+', color='lime', alpha=alpha, linestyle='None')

    filtered_values = df_5m[df_5m[key] == -1]
    y=filtered_values[signal_column]
    ax.plot((filtered_values.index + pd.Timedelta(minutes=5)).tolist(), y, label=f"[5m] {key}==-1", marker='+', color='yellow', alpha=alpha, linestyle='None')


if 1:
    # Selecting a subset of data
    # time_begin = datetime(year=2022, month=5, day=9)
    # time_end = datetime(year=2023, month=7, day=12)
    # df_1d_subset = df_1d.loc[time_begin:time_end]
    plot_1D_candles(ax, df_1d)

    # time_begin = datetime(year=2022, month=5, day=9)
    # time_end = datetime(year=2022, month=5, day=16)
    time_begin = time_begin
    time_end = time_end
    df_5m_subset = df_5m.loc[time_begin:time_end]
    plot_5m_candles(ax, df_5m_subset)



plt.legend(loc='best')
plt.title(f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}]")
plt.grid()
plt.show()


