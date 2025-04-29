import pandas as pd
import pandas_ta as ta
from dfs_prepare import df_5m
from functional.dataframes import print_df, print_all_rows_df
from pandas_ta_custom_indicators import custom_find_peaks, find_sequences, set_columns_diff_aligned, set_columns_aligned, gaussian_moving_average, series_to_sign

# ----------------------------------------------
# 5min
# ----------------------------------------------

df_5m['open_close_change'] = df_5m['close'] - df_5m['open']


# global

# indicator_0=ta.ema
indicator_0=ta.sma
# diff_period = 5% * sma_period
lengths_diffs=[
    (21, 1), 
    # (30, 1), 
    # (55, 3), 
    # (100, 5),
    (200, 10),
]

# columns = []
g_std=6
win_type="gaussian"
for (length, diff_period) in lengths_diffs:
    
    # moving average (sma/ema)
    if 1:
        key_indicator_0=f'{indicator_0.__name__}({length})' # sma/ema
        df_5m[key_indicator_0] = indicator_0(df_5m['close'], length=length)
    
    # smoother
    if 0:
        key_indicator_0=f'gaussian({length}, {g_std})'
        df_5m[key_indicator_0] = df_5m['close'].rolling(window=length, center=False, win_type=win_type).mean(std=g_std)
        # df_5m[key_indicator_0] = df_5m['close'].rolling(window=length, center=False, win_type=None).mean() # same as sma

    
    # columns.append(key_sma)

    # slope global
    key_indicator_0_diff=f"{key_indicator_0}.diff({diff_period})"
    df_5m[key_indicator_0_diff] = df_5m[key_indicator_0].diff(diff_period)

    df_5m[f'{key_indicator_0_diff}.sign'] = series_to_sign(df_5m[key_indicator_0_diff])
    df_5m[f'{key_indicator_0_diff}.sign.sequences'] = find_sequences(df_5m[f'{key_indicator_0_diff}.sign'])
    

    # price - sma
    df_5m[f'close_sub_{key_indicator_0}'] = df_5m['close'] - df_5m[key_indicator_0]


# emas mean
# df_5m["emas_mean"] = df_5m[columns].mean(axis=1)

# local 

signal_column="close" # default signal: 'close'
signal_diff_period=1
if 0:
    indicator_1=ta.zlma
    indicator_1_length=5
    key_zlma=f'{indicator_1.__name__}({indicator_1_length})'
    key_zlma_zlma=f'{key_zlma}.{indicator_1.__name__}({indicator_1_length})'

    # level 1
    df_5m[key_zlma] = indicator_1(df_5m['close'], length=indicator_1_length)

    # level 2 (smoother)
    df_5m[key_zlma_zlma] = indicator_1(df_5m[key_zlma], length=indicator_1_length)

    signal_column=key_zlma_zlma

# slope 
key_signal_column_diff=f'{signal_column}.diff({signal_diff_period})'
df_5m[key_signal_column_diff] = df_5m[signal_column].diff(signal_diff_period)


# peaks/valleys
prominence_left_base=0.5
key_signal_peaks=f"{signal_column}.peaks({prominence_left_base})"
key_signal_valleys=f"{signal_column}.valleys({prominence_left_base})"
df_5m[key_signal_peaks] = custom_find_peaks(df_5m[signal_column], prominence_left_base=prominence_left_base, return_values=True)
df_5m[key_signal_valleys] = custom_find_peaks(df_5m[signal_column], prominence_left_base=prominence_left_base, find_valleys=True, return_values=True)



# Bollinger Bands
# bb_length=21
bb_length=lengths_diffs[-1][0]
# bb_stds=[1.0, 2.0, 3.0]
bb_stds=[1.0]
bb_mamode="sma"
if 1:
    for bb_std in bb_stds:
        bbands = ta.bbands(df_5m['close'], length=bb_length, std=bb_std, mamode=bb_mamode)
        
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, upper)"] = bbands[f"BBU_{bb_length}_{bb_std}"]
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, middle)"] = bbands[f"BBM_{bb_length}_{bb_std}"]
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, lower)"] = bbands[f"BBL_{bb_length}_{bb_std}"]    
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, bandwidth)"] = bbands[f"BBB_{bb_length}_{bb_std}"]
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, percent)"] = bbands[f"BBP_{bb_length}_{bb_std}"]


print_df(df_5m)
# prinf_all_rows_df(df_5m)