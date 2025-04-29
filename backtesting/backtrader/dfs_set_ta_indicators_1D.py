import numpy as np
import pandas as pd
import pandas_ta as ta
from dfs_prepare import df_1d
from functional.dataframes import print_df, print_all_rows_df
from pandas_ta_custom_indicators import custom_find_peaks, set_columns_diff_aligned, set_columns_aligned, gaussian_moving_average



# ----------------------------------------------
# 1D
# ----------------------------------------------

df_1d['open_close_change'] = df_1d['close'] - df_1d['open']
df_1d['open_close_change_pct'] = ((df_1d['close'] - df_1d['open']) / df_1d['open']) * 100
df_1d['direction'] = np.where(df_1d['open_close_change_pct'] > 0, 'u', 'd')

df_1d['sma(20)'] = ta.sma(df_1d['close'], length=20)
df_1d['ema(20)'] = ta.ema(df_1d['close'], length=20)

# Calculate Pivot Points
if 1:
    df_1d['P'] = (df_1d['high'].shift(1) + df_1d['low'].shift(1) + df_1d['close'].shift(1)) / 3
    df_1d['S1'] = (2 * df_1d['P']) - df_1d['high'].shift(1)
    df_1d['R1'] = (2 * df_1d['P']) - df_1d['low'].shift(1)
    df_1d['S2'] = df_1d['P'] - (df_1d['high'].shift(1) - df_1d['low'].shift(1))
    df_1d['R2'] = df_1d['P'] + (df_1d['high'].shift(1) - df_1d['low'].shift(1))



print_df(df_1d)
