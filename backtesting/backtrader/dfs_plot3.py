from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd

from dfs_prepare import time_begin, time_end

from dfs_set_ta_indicators_5m_3 import df_5m,\
    indicator_0, global_lengths_diffs,\
    signal_column,\
    bb_length, bb_stds, bb_mamode, fractals_lookback

from dfs_set_ta_indicators_1D import df_1d

from functional.dataframes import plot_1D_candles, plot_5m_candles,\
    plot_1D_eth_vlines, plot_1D_pivot_lines,\
    plot_text, plot_trades, print_df, print_all_rows_df, plot_trades_info, plot_orders_pairs

from functional.files import get_pnl_from_orders_info, trades_info_csv_to_list_tuple, get_pnl_from_trades_info,\
orders_info_csv_to_list_tuple




# symbol
symbol_df_1d=df_1d['symbol'].iloc[0]
symbol_df_5m=df_5m['symbol'].iloc[0]
if symbol_df_1d != symbol_df_5m:
    raise ValueError("dataframes must represent same symbol.")
symbol=symbol_df_1d


# define Matplotlib figure and axis
fig, ax = plt.subplots()

plot_1D_eth_vlines(ax, df_1d, linewidth=2)
plot_1D_pivot_lines(ax, df_1d)





# ----------------------------------------------
# 1D
# ----------------------------------------------

ax.plot(df_1d.index.tolist(), df_1d["sma(20)"], label="[D] sma(20)")
# ax.plot(df_1d.index.tolist(), df_1d["ema(20)"], label="[D] ema(20)")

# Annotate the direction on the plot
if 0:
    plot_text(ax, df_1d)



# ----------------------------------------------
# 5min
# ----------------------------------------------

# x-axis (datetime)
x=(df_5m.index + pd.Timedelta(minutes=5)).tolist() # close


if 0:
    

    # Bollinger Bands
    if 0:
        for bb_std in bb_stds:
            ax.plot(x, df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, upper)"], label=f"[5m] bbands({bb_length}, {bb_std}, {bb_mamode}, upper)", color="g")
            ax.plot(x, df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, middle)"], label=f"[5m] bbands({bb_length}, {bb_std}, {bb_mamode}, middle)", color="b")
            ax.plot(x, df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, lower)"], label=f"[5m] bbands({bb_length}, {bb_std}, {bb_mamode}, lower)", color="r")


    
    # ----------------------------------------------
    # global
    # ----------------------------------------------
    if 0:
        columns_to_check = []

        alpha=1
        for (length, diff_period) in global_lengths_diffs:
            
            # plot indicator
            key_indicator_0=f'{indicator_0.__name__}({length})' # sma
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

        



  


    
    
    # ----------------------------------------------
    # local signal
    # ----------------------------------------------

    if signal_column!="close":
        ax.plot(x, df_5m["close"], label="[5m] close") # else: plot 'close' as 'signal_column'


    # plot daily max/min
    if 1:
        ax.plot(x, df_5m[f"close.max"], label=f"[5m] close.max")
        ax.plot(x, df_5m[f"close.min"], label=f"[5m] close.min")

    # plot the signal
    if 1:
        # ax.plot(x, df_5m[f'{key_zlma}'], label=f"[5m] {key_zlma}")
        # ax.plot(x, df_5m[f'{key_zlma_zlma}'], label=f"[5m] {key_zlma_zlma}", color="grey")
        ax.plot(x, df_5m[f'{signal_column}'], label=f"[5m] {signal_column}", color="grey")

    
    

   
    # ----------------------------------------------
    # true range
    # ----------------------------------------------

    if 0:
        alpha=1

        # positive slope (green)
        key="true_range"
        threshold=1
        # filtered_df = df_5m[df_5m[key]>threshold]

        # filter by time and a column's value
        filtered_df = df_5m[
            (df_5m.index.time >= pd.to_datetime('16:30').time()) & 
            (df_5m.index.time <= pd.to_datetime('23:00').time()) & 
            (df_5m[key] > threshold)]


        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], label=f"[5m] {key}>{threshold}", marker='o', markersize=8, color='red', alpha=alpha, linestyle='None')


        # filtered_df = df_5m.loc[(df_5m[columns_to_check] < 0).all(axis=1)]
        # ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{signal_column}'], label=f"[5m] {columns_to_check}<0", marker='v', color='yellow', alpha=alpha, linestyle='None')
        # ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df['close'], label=f"[5m] {columns_to_check}<0", marker='v', color='yellow', alpha=alpha, linestyle='None')
        








    # ----------------------------------------------
    # marubozu
    # ----------------------------------------------
    if 0:

        column_name="marubozu_type"

        filtered_df = df_5m[df_5m[f'{column_name}']==1]
        ax.plot(filtered_df.index.tolist(), filtered_df[f'close'], label=f"[5m] {column_name} (up)", marker='o', color='g', linestyle='None')

        filtered_df = df_5m[df_5m[f'{column_name}']==-1]
        ax.plot(filtered_df.index.tolist(), filtered_df[f'close'], label=f"[5m] {column_name} (down)", marker='o', color='r', linestyle='None')

        marubozu_count = df_5m['marubozu'].sum()
        total_rows = len(df_5m)
        print(f"marubozu_count: {marubozu_count}, {round(100*marubozu_count/total_rows, 2)} %")




if 1:
    # Selecting a subset of data
    # time_begin = datetime(year=2022, month=5, day=9)
    # time_end = datetime(year=2023, month=7, day=12)
    # df_1d_subset = df_1d.loc[time_begin:time_end]
    plot_1D_candles(ax, df_1d)

    # time_begin_5m = datetime(year=2022, month=5, day=9)
    # time_end_5m = datetime(year=2022, month=5, day=16)
    time_begin_5m = time_begin
    time_end_5m = time_begin + timedelta(days=10)
    # time_end_5m = time_end
    df_5m_subset = df_5m.loc[time_begin_5m:time_end_5m]
    plot_5m_candles(ax, df_5m_subset)


# plot trades
trades_info: list[tuple]=[]
pnl=0
pnl_average=0
count=0
# read csv to list[tuple]
path = f"backtesting/outputs"

if 0:
    # [gma(21, 6), sma(200)] alignment
    # strategies: ['StrategySMA_GMA_Diff']
    # Final Portfolio Value ($): 100000 -> 132554 (PnL: 32554)
    # filename = f"{path}/results_28-01-2025_15-40-35.csv" # all period (5/22 -> 7/23)
    # filename = f"{path}/StrategySMA_GMA_Diff_29-01-2025_12-46-13.csv" # all period (5/22 -> 7/23)
    # filename = f"{path}/Strategy_GMA_Peaks_29-01-2025_14-58-49.csv" # (5/22)
    # filename = f"{path}/Strategy_GMA_Peaks_29-01-2025_15-33-00.csv" # (5/22)
    # filename = f"{path}/Strategy_GMA_Peaks_29-01-2025_16-21-25.csv" # (5/22)
    # filename = f"{path}/Strategy_GMA_Peaks_29-01-2025_16-28-20.csv" # (5/22)
    # filename = f"{path}/Strategy_GMA_Peaks_29-01-2025_16-47-57.csv" # (5/22)
    # filename = f"{path}/StrategySMA_GMA_Diff_trades_30-01-2025_00-40-40.csv" # (5/22)
    # filename = f"{path}/Strategy_GMA_Peaks_trades_30-01-2025_09-04-46.csv" # (5/22)
    # 
    # filename = f"{path}/StrategySMAClose_trades_30-01-2025_19-47-49.csv" # (5/22)
    filename = f"{path}/StrategySMA_GMA_Diff_trades_02-02-2025_11-07-49.csv" # (5/22)
    filename = f"{path}/Strategy18to19_trades_02-02-2025_18-03-16.csv" # (5/22)
    filename = f"{path}/StrategySMAClose_trades_02-02-2025_18-20-50.csv" # (5/22)
    filename = f"{path}/StrategySMAClose_trades_03-02-2025_12-20-13.csv" # (5/22)
    # filename = f"{path}/Strategy110_trades_03-02-2025_15-23-44.csv" # (5/22)
    filename = f"{path}/Strategy110_trades_03-02-2025_15-36-59.csv" # (5/22)
    filename = f"{path}/Strategy110_trades_03-02-2025_15-49-17.csv" # (5/22)
    filename = f"{path}/StrategyEachBar_trades_05-02-2025_15-52-36.csv" # (5/22)
    
    
    # plot trades
    trades_info=trades_info_csv_to_list_tuple(filename, time_begin, time_end)
    pnl=get_pnl_from_trades_info(trades_info, time_begin, time_end)
    pnl_average=pnl/len(trades_info) if len(trades_info) else 0
    plot_trades_info(ax, trades_info)


if 0:
    filename = f"{path}/StrategyEachBar_orders_07-02-2025_11-59-57.csv" # (5/22) tp=2
    # filename = f"{path}/StrategyEachBar_orders_07-02-2025_13-16-27.csv" # (5/22) tp=0.01
    filename = f"{path}/StrategyEachBar_orders_09-02-2025_12-08-38.csv" # (5/22) tp=2
    filename = f"{path}/StrategyEachBar_Short_orders_09-02-2025_12-43-05.csv" # (5/22) tp=2
    filename = f"{path}/StrategyEachBar_Short_orders_09-02-2025_13-14-46.csv" # (5/22) tp=2

    filename = f"{path}/StrategyEachBar_Long_orders_09-02-2025_21-53-41.csv" # (5-6/22) tp=2
    # filename = f"{path}/StrategyEachBar_Short_orders_09-02-2025_21-55-39.csv" # (5-6/22) tp=2


    # plot orders
    trades_info=orders_info_csv_to_list_tuple(filename, time_begin, time_end)
    pnl, count=get_pnl_from_orders_info(trades_info, time_begin, time_end)
    pnl_average=pnl/count if count else 0
    plot_orders_pairs(ax, trades_info)

if 0:
    # filename="orders_pairs_to_trades_17-02-2025_11-56-20.csv"
    filename="orders_pairs_to_trades_17-02-2025_12-58-21.csv"
    filename="orders_pairs_to_trades_20-02-2025_13-44-31.csv"
    filename="orders_pairs_to_trades_20-02-2025_13-32-50.csv"
    
    filename="orders_list_to_trades_25-03-2025_23-33-27.csv"
    
    trades = pd.read_csv(
        f"{path}/{filename}",
        parse_dates=["open_datetime", "close_datetime"]
    )
    print(trades)
    plot_trades(ax, trades)


# ----------------------------------------------
# fractals
# ----------------------------------------------

if 0:
    alpha=1

    # fractal_high (green)
    filtered_df = df_5m[df_5m["fractal_high"]==True]
    ax.plot((filtered_df.index + pd.Timedelta(minutes=2.5)).tolist(), filtered_df[f"high"], label=f"[5m] fractal_high({fractals_lookback})", marker='^', markersize=12, color='green', alpha=alpha, linestyle='None')

    # fractal_low (red)
    filtered_df = df_5m[df_5m["fractal_low"]==True]
    ax.plot((filtered_df.index + pd.Timedelta(minutes=2.5)).tolist(), filtered_df[f"low"], label=f"[5m] fractal_low({fractals_lookback})", marker='v', markersize=12, color='red', alpha=alpha, linestyle='None')


    # fractal_high (green)
    filtered_df = df_5m[df_5m["fractal_backward_high"]==True]
    ax.plot((filtered_df.index + pd.Timedelta(minutes=2.5)).tolist(), filtered_df[f"high"], label=f"[5m] fractal_backward_high({fractals_lookback})", marker='^', markersize=6, color='lime', markeredgecolor='grey', alpha=alpha, linestyle='None')

    # fractal_low (red)
    filtered_df = df_5m[df_5m["fractal_backward_low"]==True]
    ax.plot((filtered_df.index + pd.Timedelta(minutes=2.5)).tolist(), filtered_df[f"low"], label=f"[5m] fractal_backward_low({fractals_lookback})", marker='v', markersize=6, color='yellow', markeredgecolor='grey', alpha=alpha, linestyle='None')
        
        

legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

delta: timedelta=time_end-time_begin
title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days, {count} trades, pnl: {round(pnl, 4)} usd, average: {round(pnl_average, 4)} usd/trade)"
print(title)
plt.title(title)
plt.grid()
plt.show()


