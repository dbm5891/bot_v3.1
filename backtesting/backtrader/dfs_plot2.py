from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd

from dfs_prepare import time_begin, time_end

from dfs_set_ta_indicators_5m_2 import df_5m,\
    indicator_0, global_lengths_diffs, local_lengths_diffs,\
    key_signal_peaks, key_signal_valleys,\
    signal_column, key_signal_column_diff,\
    bb_length, bb_stds, bb_mamode,\
    g_std, fractals_lookback, marubozu_indicator_threshold

from dfs_set_ta_indicators_1D import df_1d

from functional.dataframes import plot_1D_candles, plot_5m_candles,\
    plot_1D_eth_vlines, plot_1D_pivot_lines,\
    plot_text, plot_trades, print_df, print_all_rows_df, plot_trades_info

from functional.files import trades_info_csv_to_list_tuple, get_pnl_from_trades_info




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


path = f"backtesting/outputs"

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
# ax.plot(df_1d.index.tolist(), df_1d["ema(20)"], label="[D] ema(20)")

# Annotate the direction on the plot
if 1:
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
            ax.plot(x, df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, upper)"], label=f"[5m] bbands({bb_length}, {bb_std}, {bb_mamode}, upper)", color="lime")
            ax.plot(x, df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, middle)"], label=f"[5m] bbands({bb_length}, {bb_std}, {bb_mamode}, middle)", color="cyan")
            ax.plot(x, df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, lower)"], label=f"[5m] bbands({bb_length}, {bb_std}, {bb_mamode}, lower)", color="m")


    
    # ----------------------------------------------
    # global
    # ----------------------------------------------

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
    # gaussian
    # ----------------------------------------------
    

    alpha=1
    if 1:
        for (length, diff_period) in local_lengths_diffs:
            
            # plot indicator
            # key_indicator_0=f'{indicator_0.__name__}({length})' # sma/ema
            key_indicator_0=f'gaussian({length}, {g_std})'
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
                ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{key_indicator_0}'], label=f"[5m] {key_indicator_0_diff}>{diff_threshold}", marker='+', color='lime', alpha=alpha, linestyle='None', zorder=10)

                # negative slope (_)
                filtered_df = df_5m[df_5m[key_indicator_0_diff]<-diff_threshold]
                ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df[f'{key_indicator_0}'], label=f"[5m] {key_indicator_0_diff}<{-diff_threshold}", marker='_', color='yellow', alpha=alpha, linestyle='None', zorder=10)
                
            
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
        ax.plot(x, df_5m["close"], label="[5m] close", color="tab:orange") # else: plot 'close' as 'signal_column'


    # plot daily max/min
    if 1:
        col="close"
        # col="sma(20)"
        # ax.plot(x, df_5m[f"{col}.expanding_max"], label=f"[5m] {col}.expanding_max") # we shall do it manually instead using expanding() because we want to save index too: expanding_max_with_index()
        ax.plot(x, df_5m[f"{col}.max"], label=f"[5m] {col}.max", color="tab:green")
        ax.plot(x, df_5m[f"{col}.min"], label=f"[5m] {col}.min", color="tab:red")
        

        # mark last max
        ax.plot(
            df_5m[f"{col}.max_idx"]+pd.Timedelta(minutes=5),
            # pd.Series(144, index=range(len(df_5m))),
            df_5m[f"{col}.max"],
            label=f"[5m] {col}.max_idx",
            marker='o', color='lime', markeredgecolor='black', markersize=10, alpha=0.50, linestyle='None',
        )
        
        # mark last min
        ax.plot(
            df_5m[f"{col}.min_idx"]+pd.Timedelta(minutes=5),
            # pd.Series(134, index=range(len(df_5m))),
            df_5m[f"{col}.min"],
            label=f"[5m] {col}.min_idx",
            marker='o', color='salmon', markeredgecolor='black', markersize=10, alpha=0.50, linestyle='None',
        )

    # ------======--------
    # candle recognition (marubozu)
    if 1:
        # slope        
    
        alpha=0.90
        column_name = f"marubozu_direction"
        color='cyan'

        filtered_df = df_5m[df_5m[column_name]=="up"]
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), pd.Series(160, index=range(len(filtered_df))), label=f"[5m] {column_name}({marubozu_indicator_threshold})==up", marker='^', markersize=8, color='green', alpha=alpha, linestyle='None')
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df["close"], label=f"[5m] {column_name}({marubozu_indicator_threshold})==up", marker='^', markersize=8, color=color, markeredgecolor='black', alpha=alpha, linestyle='None')

        color='m'
        filtered_df = df_5m[df_5m[column_name]=="down"]
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), pd.Series(159, index=range(len(filtered_df))), label=f"[5m] {column_name}({marubozu_indicator_threshold})==down", marker='v', markersize=8, color='red', alpha=alpha, linestyle='None')
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df["close"], label=f"[5m] {column_name}({marubozu_indicator_threshold})==down", marker='v', markersize=8, color=color, markeredgecolor='black', alpha=alpha, linestyle='None')



    # plot daily candls
    if 1:
        col="close"
        column_candle_open = f"{col}.candle.open"
        column_candle_high = f"{col}.candle.high"
        column_candle_low = f"{col}.candle.low"
        column_candle_close = f"{col}.candle.close"
        # ax.plot(x, df_5m[column_candle_close], color="orange", label=f"[5m] {column_candle_close}")
        ax.plot(x, df_5m[column_candle_open], color="b", label=f"[5m] {column_candle_open}")
        ax.plot(x, df_5m[column_candle_high], color="g", label=f"[5m] {column_candle_high}")
        ax.plot(x, df_5m[column_candle_low], color="r", label=f"[5m] {column_candle_low}")

    
    # plot the signal
    if 0:
        # ax.plot(x, df_5m[f'{key_zlma}'], label=f"[5m] {key_zlma}")
        # ax.plot(x, df_5m[f'{key_zlma_zlma}'], label=f"[5m] {key_zlma_zlma}", color="grey")
        ax.plot(x, df_5m[f'{signal_column}'], label=f"[5m] {signal_column}")

    
    
        
        # ------======--------
        
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
          

    
    # ------======--------
    # linear regression slope (rolling_regression)
    if 1:
        # slope        
    
        alpha=0.5
        signal = "close"
        column_name = f"{signal}.lr.slope"

        y0=152
        slope_threshold = 0.0002
        slope_threshold = 0

        # positive slope (green)
        filtered_df = df_5m[df_5m[column_name]>slope_threshold]
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), pd.Series(y0, index=range(len(filtered_df))), label=f"[5m] {column_name}>{slope_threshold}", marker='o', markersize=8, color='green', alpha=alpha, linestyle='None')

        # negative slope (red)
        filtered_df = df_5m[df_5m[column_name]<-slope_threshold]
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), pd.Series(y0, index=range(len(filtered_df))), label=f"[5m] {column_name}<{-slope_threshold}", marker='o', markersize=8, color='red', alpha=alpha, linestyle='None')


    alpha=0.750

    if 0:
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

    if 0:
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
        
        
        
    # gap
    if 1:
    
        alpha=0.50
        # index=pd.to_datetime(datetime(2022, 10, 13, 15, 30))
        
        filtered_df = df_5m[df_5m['close_close_change_pct'].abs()>0.02]
        ax.plot((filtered_df.index + pd.Timedelta(minutes=5)).tolist(), filtered_df['close'], label=f"[5m] close_close_change_pct.abs() > 2%", marker='o', markersize=10, color='blue', alpha=alpha, linestyle='None')
        print(f"gaps count = {len(filtered_df)}")
        print(filtered_df['close_close_change_pct'])





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
trades_info: list[tuple]=[]
pnl=0
pnl_average=0
if 0:
    # read csv to list[tuple]
    
    
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
    
    trades_info=trades_info_csv_to_list_tuple(filename, time_begin, time_end)
    pnl=get_pnl_from_trades_info(trades_info, time_begin, time_end)
    pnl_average=pnl/len(trades_info)

    # plot trades
    plot_trades_info(ax, trades_info)

if 0:
    # filename="orders_pairs_to_trades_17-02-2025_11-56-20.csv"
    # filename="orders_pairs_to_trades_17-02-2025_12-58-21.csv"
    # filename="orders_pairs_to_trades_20-02-2025_13-44-31.csv"
    # filename="orders_pairs_to_trades_07-03-2025_15-48-21.csv"
    # filename="orders_pairs_to_trades_10-03-2025_11-49-42.csv"
    # filename="orders_pairs_to_trades_20-03-2025_14-51-25.csv"
    
    filename="orders_list_to_trades_25-03-2025_23-33-27.csv"

    trades = pd.read_csv(
        f"{path}/{filename}",
        parse_dates=["open_datetime", "close_datetime"]
    )
    print(trades)
    plot_trades(ax, trades)
    
legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

delta: timedelta=time_end-time_begin
# title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days, {len(trades_info)} trades, $ {pnl})"
title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days, {len(trades_info)} trades, $ {pnl}, average: {round(pnl_average)})"
print(title)
plt.title(title)
plt.grid()
plt.show()


