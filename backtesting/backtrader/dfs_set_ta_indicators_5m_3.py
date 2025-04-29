from datetime import datetime, time, timedelta
import numpy as np
import pandas as pd
import pandas_ta as ta
from dfs_prepare import df_5m
from functional.dataframes import print_df, print_all_rows_df
from pandas_ta_custom_indicators import custom_find_peaks, find_sequences, fractals, fractals_backward, marubozu_indicator, set_columns_diff_aligned, set_columns_aligned, gaussian_moving_average, series_to_sign

# ----------------------------------------------
# 5min
# ----------------------------------------------

df_5m['open_close_change'] = df_5m['close'] - df_5m['open']

df_5m['true_range'] = ta.true_range(df_5m['high'], df_5m['low'], df_5m['close'])
df_5m['atr(14)'] = ta.atr(df_5m['high'], df_5m['low'], df_5m['close'], length=14)





# global

indicator_0=ta.sma
# diff_period = 5% * sma_period
global_lengths_diffs=[
    # (20, 1),
    # (50, 4),
    (200, 10),
]

for (length, diff_period) in global_lengths_diffs:
    
    # moving average (sma/ema)
    key_indicator_0=f'{indicator_0.__name__}({length})' # sma/ema
    df_5m[key_indicator_0] = indicator_0(df_5m['close'], length=length)
    
    
    
    # slope global
    key_indicator_0_diff=f"{key_indicator_0}.diff({diff_period})"
    df_5m[key_indicator_0_diff] = df_5m[key_indicator_0].diff(diff_period)

    df_5m[f'{key_indicator_0_diff}.sign'] = series_to_sign(df_5m[key_indicator_0_diff])
    df_5m[f'{key_indicator_0_diff}.sign.sequences'] = find_sequences(df_5m[f'{key_indicator_0_diff}.sign'])
    

    # price - sma
    df_5m[f'close_sub_{key_indicator_0}'] = df_5m['close'] - df_5m[key_indicator_0]









# local 

signal_column="close" # default signal: 'close'
signal_diff_period=1




# Bollinger Bands
bb_length=20
# bb_length=global_lengths_diffs[-1][0]
# bb_stds=[1.0, 2.0, 3.0]
bb_stds=[2.0]
bb_mamode="sma"
if 0:
    for bb_std in bb_stds:
        bbands = ta.bbands(df_5m['close'], length=bb_length, std=bb_std, mamode=bb_mamode)
        
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, upper)"] = bbands[f"BBU_{bb_length}_{bb_std}"]
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, middle)"] = bbands[f"BBM_{bb_length}_{bb_std}"]
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, lower)"] = bbands[f"BBL_{bb_length}_{bb_std}"]    
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, bandwidth)"] = bbands[f"BBB_{bb_length}_{bb_std}"]
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, percent)"] = bbands[f"BBP_{bb_length}_{bb_std}"]




if 0:
    marubozu_indicator(df_5m, threshold=0.25)

# fractals
if 1:
    fractals_lookback=2
    df_5m=fractals_backward(df_5m, lookback=fractals_lookback)
    df_5m=fractals(df_5m, lookback=fractals_lookback)

    

# Apply rolling regression for each day separately
if 1:
    dataframes = []

    # Initialize a new column for slopes
    column_name: str = "close"
    df_5m[f"{column_name}.max"] = np.nan 
    df_5m[f"{column_name}.min"] = np.nan 

    
    # extract dates only
    unique_dates = pd.Series(df_5m.index.date).unique()
    print(unique_dates)

    for date in unique_dates:

        # get all rows between today at 11:00 to next day at 03:00
        time_begin = datetime.combine(date, time(hour=11, minute=0))
        time_end = time_begin + timedelta(hours=16)
        
        # WARN: this will remove data (before 11:00) from dataframe - DONE!
        # time_begin = datetime.combine(date, time(hour=11+5, minute=0+30))
        # time_end = time_begin + timedelta(hours=16-5.5)

        df_day = df_5m.loc[time_begin:time_end]
        
        # max points
        s0 = df_day[column_name].expanding().max()
        df_5m.loc[s0.index, f"{column_name}.max"] = s0
        # prinf_all_rows_df(df_5m)
        
        # min
        s0 = df_day[column_name].expanding().min()
        df_5m.loc[s0.index, f"{column_name}.min"] = s0

        pass




print_df(df_5m)
# prinf_all_rows_df(df_5m)