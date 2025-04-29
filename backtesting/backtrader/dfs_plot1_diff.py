from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import pandas as pd

from dfs_prepare import time_begin, time_end

from dfs_set_ta_indicators_5m import df_5m,\
    indicator_0, lengths_diffs,\
    key_signal_peaks, key_signal_valleys,\
    signal_column, key_signal_column_diff,\
    g_std

from dfs_set_ta_indicators_1D import df_1d

from functional.dataframes import plot_1D_candles, plot_5m_candles,\
    plot_1D_eth_vlines, plot_1D_pivot_lines,\
    plot_text, print_df, print_all_rows_df,\
    plot_1D_vlines



# symbol
symbol_df_1d=df_1d['symbol'].iloc[0]
symbol_df_5m=df_5m['symbol'].iloc[0]
if symbol_df_1d != symbol_df_5m:
    raise ValueError("dataframes must represent same symbol.")
symbol=symbol_df_1d


# define Matplotlib figure and axis
fig, ax = plt.subplots()

plot_1D_vlines(ax, df_1d, amplitude=0.30)


# ----------------------------------------------
# 5min
# ----------------------------------------------

# x-axis (datetime)
x=(df_5m.index + pd.Timedelta(minutes=5)).tolist() # close


if 1:
    
    # ----------------------------------------------
    # global
    # ----------------------------------------------
    
    columns_to_check = []

    alpha=1
    # for (length, diff_period) in lengths_diffs:
    for (length, diff_period) in [lengths_diffs[-1]]:
        
        # key_indicator_0=f'{indicator_0.__name__}({length})' # sma/ema
        key_indicator_0=f'gaussian({length}, {g_std})'

        key_indicator_0_diff=f"{key_indicator_0}.diff({diff_period})"
        ax.plot(x, df_5m[key_indicator_0_diff], label=f"[5m] {key_indicator_0_diff}")

        
        

       
    
    
ax.hlines(
    y=0,
    xmin=x[0],
    xmax=x[-1],
    color="blue",
    linewidth=2,
)

    


legend = plt.legend(loc='best')
legend.get_frame().set_alpha(0)  # Set transparency level (0.0 = fully transparent, 1.0 = fully opaque)

plt.title(f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}]")
plt.grid()
plt.show()


