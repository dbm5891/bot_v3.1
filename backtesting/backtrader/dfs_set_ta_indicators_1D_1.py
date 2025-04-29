from datetime import timedelta
from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
import pandas_ta as ta
from dfs_prepare import df_1d, df_5m
from functional.dataframes import plot_1D_candles, plot_1D_eth_vlines, plot_1D_pivot_lines, plot_5m_candles, plot_text, print_df, print_all_rows_df
from pandas_ta_custom_indicators import custom_find_peaks, set_columns_diff_aligned, set_columns_aligned, gaussian_moving_average



# ----------------------------------------------
# 1D
# ----------------------------------------------

df_1d['open_close_change'] = df_1d['close'] - df_1d['open']
df_1d['open_close_change_pct'] = ((df_1d['close'] - df_1d['open']) / df_1d['open']) * 100


if 1:
    df_1d['direction'] = np.where(df_1d['open_close_change_pct'] > 0, 'u', 'd')

    df_1d['sma(20)'] = ta.sma(df_1d['close'], length=20)
    df_1d['ema(20)'] = ta.ema(df_1d['close'], length=20)

# Calculate Pivot Points
if 0:
    df_1d['P'] = (df_1d['high'].shift(1) + df_1d['low'].shift(1) + df_1d['close'].shift(1)) / 3
    df_1d['S1'] = (2 * df_1d['P']) - df_1d['high'].shift(1)
    df_1d['R1'] = (2 * df_1d['P']) - df_1d['low'].shift(1)
    df_1d['S2'] = df_1d['P'] - (df_1d['high'].shift(1) - df_1d['low'].shift(1))
    df_1d['R2'] = df_1d['P'] + (df_1d['high'].shift(1) - df_1d['low'].shift(1))





# plot
fig, ax = plt.subplots()


# ----------------------------------------------
if 1:
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





if 0:
    ax.plot(df_1d.index.tolist(), df_1d["sma(20)"], label="[D] sma(20)")

plot_1D_eth_vlines(ax, df_1d, linewidth=1)
# plot_1D_pivot_lines(ax, df_1d)
plot_1D_candles(ax, df_1d)
# plot_text(ax, df_1d)

# ax.plot(df_1d.index.tolist(), df_1d["open_close_change_pct"], label="[D] open_close_change_pct")


# 5min
# x-axis (datetime)
x=(df_5m.index + pd.Timedelta(minutes=5)).tolist() # close
ax.plot(x, df_5m["close"], label="[5m] close", color="grey")


if 0:
    df_5m['open_close_change'] = df_5m['close'] - df_5m['open']
    
    df_5m['sma(20)'] = ta.sma(df_5m['close'], length=20)
    df_5m['sma(200)'] = ta.sma(df_5m['close'], length=200)

    ax.plot(df_5m.index.tolist(), df_5m["sma(20)"], label="[5m] sma(20)", color="orange")
    ax.plot(df_5m.index.tolist(), df_5m["sma(200)"], label="[5m] sma(200)")

from dfs_prepare import time_begin, time_end

if 0:
    time_begin_5m = time_begin
    time_end_5m = time_begin + timedelta(days=7)
    # time_end_5m = time_end
    df_5m_subset = df_5m.loc[time_begin_5m:time_end_5m]
    plot_5m_candles(ax, df_5m_subset)

print_df(df_1d)

legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

plt.grid()
plt.show()

