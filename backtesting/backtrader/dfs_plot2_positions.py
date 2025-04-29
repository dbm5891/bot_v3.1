from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd

from dfs_prepare import df_5m, time_begin, time_end

# from dfs_set_ta_indicators_5m_2 import df_5m,\
#     indicator_0, global_lengths_diffs, local_lengths_diffs,\
#     key_signal_peaks, key_signal_valleys,\
#     signal_column, key_signal_column_diff,\
#     bb_length, bb_stds, bb_mamode,\
#     g_std

from dfs_set_ta_indicators_1D import df_1d

from functional.dataframes import plot_1D_candles, plot_5m_candles,\
    plot_1D_eth_vlines, plot_1D_pivot_lines, plot_1D_vlines,\
    plot_text, print_df, print_all_rows_df, plot_trades_info, plot_positions_info

from functional.files import positions_info_csv_to_list_tuple




# symbol
symbol_df_1d=df_1d['symbol'].iloc[0]
symbol_df_5m=df_5m['symbol'].iloc[0]
if symbol_df_1d != symbol_df_5m:
    raise ValueError("dataframes must represent same symbol.")
symbol=symbol_df_1d


# define Matplotlib figure and axis
fig, ax = plt.subplots()


# plot trades
positions_info: list[tuple]=[]
pnl=0
if 1:
    # read csv to list[tuple]
    path = f"backtesting/outputs"
    
    # filename = f"{path}/StrategySMA_GMA_Diff_positions_30-01-2025_00-40-40.csv" # (5/22)
    # filename = f"{path}/Strategy_GMA_Peaks_positions_30-01-2025_09-04-46.csv" # (5/22)
    filename = f"{path}/StrategySMAClose_positions_30-01-2025_19-47-49.csv" # (5/22)
    filename = f"{path}/StrategyEachBar_Long_LR_[tp=100.0_sl=100.0]_positions_08-04-2025_16-42-52.csv" # (10/22)
    filename = f"{path}/StrategyEachBar_Long_LR_[tp=100.0_sl=100.0]_positions_08-04-2025_16-51-10.csv" # (all)

    
    positions_info=positions_info_csv_to_list_tuple(filename, time_begin, time_end)

    plot_positions_info(ax, positions_info)


# plot_1D_vlines(ax, df_1d, amplitude=3000, alpha=0.20, color="b")


legend = ax.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

delta: timedelta=time_end-time_begin
title=f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}] ({delta.days} days)"
print(title)
plt.title(title)
ax.grid()
plt.show()


