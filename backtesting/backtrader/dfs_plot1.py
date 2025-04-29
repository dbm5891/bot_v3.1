from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd

from dfs_prepare import time_begin, time_end

from dfs_set_ta_indicators_5m import df_5m,\
    indicator_0, lengths_diffs,\
    key_signal_peaks, key_signal_valleys,\
    signal_column, key_signal_column_diff,\
    bb_length, bb_stds, bb_mamode,\
    g_std

from dfs_set_ta_indicators_1D import df_1d

from functional.dataframes import plot_1D_candles, plot_5m_candles,\
    plot_1D_eth_vlines, plot_1D_pivot_lines,\
    plot_text, print_df, print_all_rows_df, plot_trades_info

from functional.files import trades_info_csv_to_list_tuple, get_pnl_from_trades_info



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
if 0:
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

ax.plot(df_1d.index.tolist(), df_1d["sma(20)"], label="[D] sma(20)")
ax.plot(df_1d.index.tolist(), df_1d["ema(20)"], label="[D] ema(20)")

# Annotate the direction on the plot
if 0:
    plot_text(ax, df_1d)



# ----------------------------------------------
# 5min
# ----------------------------------------------

# x-axis (datetime)
x=(df_5m.index + pd.Timedelta(minutes=5)).tolist() # close


if 1:
    

    # Bollinger Bands
    if 1:
        for bb_std in bb_stds:
            ax.plot(x, df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, upper)"], label=f"[5m] bbands({bb_length}, {bb_std}, {bb_mamode}, upper)", color="g")
            ax.plot(x, df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, middle)"], label=f"[5m] bbands({bb_length}, {bb_std}, {bb_mamode}, middle)", color="b")
            ax.plot(x, df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, lower)"], label=f"[5m] bbands({bb_length}, {bb_std}, {bb_mamode}, lower)", color="r")


    
    # ----------------------------------------------
    # global
    # ----------------------------------------------
    
    columns_to_check = []

    alpha=1
    for (length, diff_period) in lengths_diffs:
        
        # plot indicator
        key_indicator_0=f'{indicator_0.__name__}({length})' # sma/ema
        # key_indicator_0=f'gaussian({length}, {g_std})'
        ax.plot(x, df_5m[key_indicator_0], label=f"[5m] {key_indicator_0}")

        # slope key
        key_indicator_0_diff=f"{key_indicator_0}.diff({diff_period})"

        
        # plot sign.sequences
        if 1:
            # sequences list: unique
            sequences = df_5m[f'{key_indicator_0_diff}.sign.sequences'].unique().tolist()
            # plot each sequence with different color
            for s in sequences:
                filtered_df = df_5m[df_5m[f'{key_indicator_0_diff}.sign.sequences']==s]
                # ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{key_indicator_0}'], label=f"[5m] {key_indicator_0}=={s}", marker='o', markersize=8, alpha=alpha, linestyle='None')
                ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{key_indicator_0}'], marker='o', markersize=8, alpha=alpha, linestyle='None')
                
                # print(f'{key_indicator_0_diff}.sign.sequences == {s}')

            print(f'{key_indicator_0_diff}.sign.sequences: len = {len(sequences)}')


        # slope
        if 1:
            columns_to_check.append(key_indicator_0_diff)
            
            diff_threshold = 0

            # positive slope (+)
            filtered_df = df_5m[df_5m[key_indicator_0_diff]>diff_threshold]
            ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{key_indicator_0}'], label=f"[5m] {key_indicator_0_diff}>{diff_threshold}", marker='+', color='lime', alpha=alpha, linestyle='None')

            # negative slope (_)
            filtered_df = df_5m[df_5m[key_indicator_0_diff]<-diff_threshold]
            ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{key_indicator_0}'], label=f"[5m] {key_indicator_0_diff}<{-diff_threshold}", marker='_', color='yellow', alpha=alpha, linestyle='None')
            
        
        # price - sma
        if 0:

            # above sma (+)
            filtered_df = df_5m[df_5m[f'close_sub_{key_indicator_0}']>0]
            ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{key_indicator_0}'], label=f"[5m] close_sub_{key_indicator_0}>0", marker='+', color='lime', alpha=alpha, linestyle='None')
            
            # below sma (_)
            filtered_df = df_5m[df_5m[f'close_sub_{key_indicator_0}']<0]
            ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{key_indicator_0}'], label=f"[5m] close_sub_{key_indicator_0}<0", marker='_', color='yellow', alpha=alpha, linestyle='None')

    

    # ax.plot(x, df_5m["emas_mean"], label="[5m] emas_mean")

    
    
    
    
    # ----------------------------------------------
    # local signal
    # ----------------------------------------------

    if signal_column!="close":
        ax.plot(x, df_5m["close"], label="[5m] close") # else: plot 'close' as 'signal_column'


    # signal slope
    if 1:
        # ax.plot(x, df_5m[f'{key_zlma}'], label=f"[5m] {key_zlma}")
        # ax.plot(x, df_5m[f'{key_zlma_zlma}'], label=f"[5m] {key_zlma_zlma}", color="grey")
        ax.plot(x, df_5m[f'{signal_column}'], label=f"[5m] {signal_column}", color="grey")


        # slope        
        # columns_to_check.insert(0, key_signal_column_diff)
    
        alpha=0.25
        
        # positive slope (green)
        filtered_df = df_5m[df_5m[key_signal_column_diff]>0]
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], label=f"[5m] {key_signal_column_diff}>0", marker='o', markersize=8, color='green', alpha=alpha, linestyle='None')

        # negative slope (red)
        filtered_df = df_5m[df_5m[key_signal_column_diff]<0]
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], label=f"[5m] {key_signal_column_diff}<0", marker='o', markersize=8, color='red', alpha=alpha, linestyle='None')


    alpha=0.750

    if 1:
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
        


    # ----------------------------------------------
    # alignment
    # ----------------------------------------------

    if 1:
        print(f"[alignment] columns_to_check = {columns_to_check}")
        alpha=1

        # Filter rows where all values in the selected columns are negative
        # (all smas slopes < 0)
        filtered_df = df_5m.loc[(df_5m[columns_to_check] < 0).all(axis=1)]
        # ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], label=f"[5m] {columns_to_check}<0", marker='v', color='yellow', alpha=alpha, linestyle='None')
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df['close'], label=f"[5m] {columns_to_check}<0", marker='v', color='yellow', alpha=alpha, linestyle='None')
        
        # (all smas slopes > 0)    
        filtered_df = df_5m.loc[(df_5m[columns_to_check] > 0).all(axis=1)]
        # ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], label=f"[5m] {columns_to_check}>0", marker='^', color='lime', alpha=alpha, linestyle='None')
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df['close'], label=f"[5m] {columns_to_check}>0", marker='^', color='lime', alpha=alpha, linestyle='None')






if 1:
    # Selecting a subset of data
    # time_begin = datetime(year=2022, month=5, day=9)
    # time_end = datetime(year=2023, month=7, day=12)
    # df_1d_subset = df_1d.loc[time_begin:time_end]
    plot_1D_candles(ax, df_1d)

    # time_begin_5m = datetime(year=2022, month=5, day=9)
    # time_end_5m = datetime(year=2022, month=5, day=16)
    time_begin_5m = time_begin
    time_end_5m = time_begin + timedelta(days=3)
    # time_end_5m = time_end
    df_5m_subset = df_5m.loc[time_begin_5m:time_end_5m]
    plot_5m_candles(ax, df_5m_subset)


# plot trades
if 1:
    # read csv to list[tuple]
    path = f"backtesting/outputs"
    
    # smas=[21, 200] alignment
    filename = f"{path}/results_26-01-2025_14-58-20.csv" # 5/23
    filename = f"{path}/results_26-01-2025_22-48-29.csv" # all period (5/22 -> 7/23)
    
    trades_info=trades_info_csv_to_list_tuple(filename, time_begin, time_end)
    pnl=get_pnl_from_trades_info(trades_info, time_begin, time_end)

    # plot trades
    plot_trades_info(ax, trades_info)


legend = plt.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

delta: timedelta=time_end-time_begin
title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days, {len(trades_info)} trades, $ {pnl})"
print(title)
plt.title(title)
plt.grid()
plt.show()


