from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd
import pandas_ta as ta

from dfs_prepare import time_begin, time_end

from dfs_set_ta_indicators_5m_2 import df_5m,\
    indicator_0, global_lengths_diffs, local_lengths_diffs,\
    key_signal_peaks, key_signal_valleys,\
    signal_column, key_signal_column_diff,\
    bb_length, bb_stds, bb_mamode,\
    g_std

from dfs_set_ta_indicators_1D import df_1d
from pandas_ta_custom_indicators import custom_find_peaks, find_sequences, fractals, fractals_backward, rolling_regression, set_columns_diff_aligned, set_columns_aligned, gaussian_moving_average, series_to_sign

from functional.dataframes import plot_1D_candles, plot_1D_hlines, plot_5m_candles,\
    plot_1D_eth_vlines, plot_1D_pivot_lines, plot_1D_vlines,\
    plot_text, print_df, print_all_rows_df, plot_trades_info, plot_drawdown

from functional.files import trades_info_csv_to_list_tuple, get_pnl_from_trades_info





# symbol
symbol_df_1d=df_1d['symbol'].iloc[0]
symbol_df_5m=df_5m['symbol'].iloc[0]
if symbol_df_1d != symbol_df_5m:
    raise ValueError("dataframes must represent same symbol.")
symbol=symbol_df_1d


# define Matplotlib figure and axis
fig, ax = plt.subplots()
alpha=1

# x-axis (datetime)
x=(df_5m.index + pd.Timedelta(minutes=5)).tolist() # close

columns=[]
column = "close"
# column = "sma(20)" # TODO: raise KeyError(key) from err KeyError: 'close.lr.slope'
column_name = f"{column}.lr.slope"
# column_name="close.lr.slope.sma(5).diff(1)"
# column_name="bbands(20, 2.0, sma, bandwidth)"
# column_name = f"{column}.max"
column_name = f"{column}.lr_from_last_max.slope"
column_name = f"{column}.lr_from_last_min.slope"

# ax.plot(x, [0]*len(x), color="r") # zero line
ax.plot(x, [0]*len(x), label=f"y=0") # zero line
# ax.plot(x, df_5m[column_name], label=f"[5m] {column_name}", color="orange")


if 1:
    columns = [
        f"{column}.lr.slope",
        # f"{column}.lr_from_last_max.slope",
        # f"{column}.lr_from_last_min.slope",
    ]
    for col in columns:
        ax.plot(x, df_5m[col], label=f"[5m] {col}")

if 0:
    print(df_5m[column_name])
    for k,v in df_5m[column_name].items():
        print(k,v)

if 0:
    column_name = f"{column}.lr.r2score"
    ax.plot(x, df_5m[column_name], label=f"[5m] {column_name}")




print_df(df_5m)

if 0:
    # key_signal_column_diff="close.lr.slope.diff(1)"
    key_signal_column_diff="close.lr.slope.sma(5).diff(1)"
    # key_signal_column_diff="close.lr.slope.gaussian(10, 3).diff(1)"
    
    # plot sign.sequences
    if 1:
        # sequences list: unique
        sequences = df_5m[f'{key_signal_column_diff}.sign.sequences'].unique().tolist()
        # plot each sequence with different color
        for s in sequences:
            filtered_df = df_5m[df_5m[f'{key_signal_column_diff}.sign.sequences']==s]
            # ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], label=f"[5m] {signal_column}=={s}", marker='o', markersize=8, alpha=alpha, linestyle='None')
            ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], marker='o', markersize=8, alpha=alpha, linestyle='None')
            
            # print(f'{key_signal_column_diff}.sign.sequences == {s}')

        print(f'{key_signal_column_diff}.sign.sequences: len = {len(sequences)}')


    # slope
    if 1:
        # columns_to_check.append(key_signal_column_diff)
        
        diff_threshold = 0

        # positive slope (+)
        filtered_df = df_5m[df_5m[key_signal_column_diff]>diff_threshold]
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], label=f"[5m] {key_signal_column_diff}>{diff_threshold}", marker='+', color='lime', alpha=alpha, linestyle='None')

        # negative slope (_)
        filtered_df = df_5m[df_5m[key_signal_column_diff]<-diff_threshold]
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], label=f"[5m] {key_signal_column_diff}<{-diff_threshold}", marker='_', color='yellow', alpha=alpha, linestyle='None')

    # peaks/vallies
    if 1:
        alpha=0.50

        # peaks
        ax.plot(
            x, 
            df_5m[key_signal_peaks], 
            label=f"[5m] {key_signal_peaks}", 
            marker='o', markersize=12, color='yellow', markeredgecolor='black', linestyle='None', alpha=alpha
        )

        # valleys
        ax.plot(
            x, 
            df_5m[key_signal_valleys], 
            label=f"[5m] {key_signal_valleys}", 
            marker='o', markersize=12, color='cyan', markeredgecolor='black', linestyle='None', alpha=alpha
        )
          



plot_1D_vlines(ax, df_1d, alpha=0.25, color="b", y_min=-0.3, y_max=0.3)
plot_1D_hlines(ax, df_1d, alpha=0.50, color="b", y_value=0, linewidth=2)


legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

delta: timedelta=time_end-time_begin
title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days)"
print(title)
plt.title(title)
ax.grid()
plt.show()


