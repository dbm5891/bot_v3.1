from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd

from dfs_prepare import time_begin, time_end

from dfs_set_ta_indicators_5m_2 import df_5m,\
    indicator_0, global_lengths_diffs, local_lengths_diffs,\
    key_signal_peaks, key_signal_valleys,\
    signal_column, key_signal_column_diff,\
    bb_length, bb_stds, bb_mamode,\
    g_std

from dfs_set_ta_indicators_1D import df_1d

from functional.dataframes import plot_1D_candles, plot_5m_candles,\
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


# plot trades
trades_info: list[tuple]=[]
pnl=0
if 1:
    # read csv to list[tuple]
    path = f"backtesting/outputs"
    
    if 0:
        # smas=[21, 200] alignment
        filename = f"{path}/results_26-01-2025_14-58-20.csv" # 5/23
        filename = f"{path}/results_26-01-2025_22-48-29.csv" # all period (5/22 -> 7/23)

    # [gma(21, 6), sma(200)] alignment
    # strategies: ['StrategySMA_GMA_Diff']
    # Final Portfolio Value ($): 100000 -> 132554 (PnL: 32554)
    # filename = f"{path}/results_28-01-2025_15-40-35.csv" # all period (5/22 -> 7/23)
    # filename = f"{path}/Strategy_GMA_Peaks_29-01-2025_16-47-57.csv" # (5/22)
    # filename = f"{path}/Strategy_GMA_Peaks_trades_30-01-2025_09-04-46.csv" # (5/22)
    filename = f"{path}/StrategySMAClose_trades_30-01-2025_19-47-49.csv" # (5/22)
    filename = f"{path}/StrategySMAClose_trades_02-02-2025_18-20-50.csv" # (5/22)
    filename = f"{path}/StrategySMAClose_trades_03-02-2025_12-20-13.csv" # (5/22)
    
    trades_info=trades_info_csv_to_list_tuple(filename, time_begin, time_end)
    pnl=get_pnl_from_trades_info(trades_info, time_begin, time_end)
    pnl_average=pnl/len(trades_info)

    plot_drawdown(ax, trades_info, True)


plot_1D_vlines(ax, df_1d, amplitude=33000, alpha=0.20, color="b")


legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

delta: timedelta=time_end-time_begin
title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days, {len(trades_info)} trades, $ {pnl}, average: $ {round(pnl_average)})"
print(title)
plt.title(title)
ax.grid()
plt.show()


