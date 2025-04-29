import numpy as np
import pandas as pd
import pandas_ta as ta
from dfs_prepare import df_5m, df_1d
from functional.dataframes import print_df, print_all_rows_df
from pandas_ta_custom_indicators import custom_find_peaks, set_columns_diff_aligned, set_columns_aligned, gaussian_moving_average

# ----------------------------------------------
# 5min
# ----------------------------------------------

# l=20
# df_5m[f'ema({l})'] = ta.ema(df_5m['close'], length=l)

# df_5m[f'zlma_{length}'] = ta.zlma(df_5m['close'], length=length)
# df_5m[f'zlma({l})'] = ta.zlma(df_5m['open'], length=l)
# df_5m[f'zlma_{length}_smooth'] = ta.sma(df_5m[f'zlma_{length}'], length=5)


df_5m['ohlc4'] = ta.ohlc4(df_5m['open'], df_5m['high'], df_5m['low'], df_5m['close'])
df_5m['open_close_change'] = df_5m['close'] - df_5m['open']

lengths=[5, 8, 13, 20, 50, 200]
lengths=[8, 13, 20, 200]
lengths=[50, 200]
lengths=[10, 20, 200]
col_names=[]
# indicator=ta.sma
# indicator=ta.ema
indicator=ta.zlma
if 1:
    for l in lengths:
        # col_names.append(f'sma({l})')
        # col_names.append(f'zlma({l})')
        col_names.append(f'{indicator.__name__}({l})')

        # df_5m[f'sma({l})'] = ta.sma(df_5m['close'], length=l)
        # df_5m[f'ema({l})'] = ta.ema(df_5m['close'], length=l)
        # df_5m[f'zlma({l})'] = ta.zlma(df_5m['close'], length=l)

        df_5m[f'{indicator.__name__}({l})'] = indicator(df_5m['close'], length=l)
        # df_5m[f'{indicator.__name__}({l})'] = indicator(df_5m['ohlc4'], length=l)


l=10
# df_5m[f'sma(10).sma({l})'] = ta.sma(df_5m[f'sma(10)'], length=l)
# df_5m[f'ema(10).ema({l})'] = ta.ema(df_5m[f'ema(10)'], length=l)
df_5m[f'zlma(10).zlma({l})'] = ta.zlma(df_5m[f'zlma(10)'], length=l)


sigma = 4
# df_5m[f'gma({sigma})'] = gaussian_moving_average(df_5m['close'], sigma=sigma)

# smooth
primary_length=20
secondary_length=5

df_5m[f'zlma({primary_length})'] = ta.zlma(df_5m['close'], length=primary_length)
# df_5m[f'zlma({primary_length})'] = ta.zlma(df_5m['ohlc4'], length=primary_length)
signal_column=f'zlma({primary_length}).zlma({secondary_length})'
df_5m[signal_column] = ta.zlma(df_5m[f'zlma({primary_length})'], length=secondary_length)

# signal_column=f'zlma({primary_length}).sma({secondary_length})'
# df_5m[signal_column] = ta.sma(df_5m[f'zlma({primary_length})'], length=secondary_length)
signal_column=f'close'
signal_column=f'sma(20)'
signal_column=f'sma(10).sma(10)'
signal_column=f'ema(10).ema(10)'
signal_column=f'zlma(10).zlma(10)'

# df_5m['sma_20_rolling'] = df_5m['close'].rolling(window=20, center=True).mean()
# df_5m['gaussian'] = df_5m['close'].rolling(window=20, win_type="gaussian").mean(std=6)
# df_5m['gaussian'] = df_5m[signal_column].rolling(window=5, win_type="gaussian").mean(std=6)

# df_5m["peaks"] = custom_find_peaks(df_5m["close"])
# signal_column=f'gma({sigma})'
# signal_column=f'gaussian'
prominence_left_base=1
df_5m["peaks"] = custom_find_peaks(df_5m[signal_column], prominence_left_base=prominence_left_base, return_values=True)
df_5m["valleys"] = custom_find_peaks(df_5m[signal_column], prominence_left_base=prominence_left_base, find_valleys=True, return_values=True)

# df_5m["peaks"] = custom_find_peaks(df_5m['gaussian'], prominence_left_base=prominence_left_base, return_values=True)
# df_5m["valleys"] = custom_find_peaks(df_5m['gaussian'], prominence_left_base=prominence_left_base, find_valleys=True, return_values=True)



col_names=[f"{signal_column}", "sma(200)"]
col_names=[f"{signal_column}", "ema(200)"]
col_names=[f"{signal_column}", "zlma(200)"]
# col_names=[f"{signal_column}", "sma(50)", "sma(200)"]
# col_names=[f'gma({sigma})', "sma(200)"]
# col_names=["gaussian", "sma(200)"]

# inplace
diff_period=1
set_columns_diff_aligned(df_5m, col_names, diff_period) # slope
set_columns_aligned(df_5m, col_names)
# prinf_all_rows_df(df_5m)



bb_length=10
bb_std=1.0
bb_mamode="zlma"
if 0:
    bbands = ta.bbands(df_5m['close'], length=bb_length, std=bb_std, mamode=bb_mamode)
    
    # Concatenate all DataFrames
    # df_5m = pd.concat([df_5m, bbands])
    
    # Add Bollinger Bands to DataFrame
    df_5m["BB_Lower"] = bbands[f"BBL_{bb_length}_{bb_std}"]
    df_5m["BB_Middle"] = bbands[f"BBM_{bb_length}_{bb_std}"]
    df_5m["BB_Upper"] = bbands[f"BBU_{bb_length}_{bb_std}"]
    df_5m["BB_bandwidth"] = bbands[f"BBB_{bb_length}_{bb_std}"]
    df_5m["BB_percent"] = bbands[f"BBP_{bb_length}_{bb_std}"]

# ----------------------------------------------
# 1D
# ----------------------------------------------

df_1d['ohlc4'] = ta.ohlc4(df_1d['open'], df_1d['high'], df_1d['low'], df_1d['close'])
df_1d['sma(20)'] = ta.sma(df_1d['close'], length=20)
# df_1d['sma_50'] = ta.sma(df_1d['close'], length=50)
df_1d['sma_200'] = ta.sma(df_1d['close'], length=200)

df_1d['zlma_20'] = ta.zlma(df_1d['close'], length=20)
df_1d['ema_20'] = ta.ema(df_1d['close'], length=20)


# df_1d['close_rolling'] = df_1d['close'].rolling(window=20, win_type="gaussian").mean(std=6)
# df_1d['sma_20_rolling'] = df_1d['sma_20'].rolling(window=20, win_type="gaussian").mean(std=6)
# df_1d['sma_20_rolling'] = df_1d['close'].rolling(window=20, center=True).mean()

df_1d['day_change'] = df_1d['close'].diff()
# df_1d['day_change_pct'] = df_1d['close'].pct_change() * 100

df_1d['open_close_change'] = df_1d['close'] - df_1d['open']
df_1d['open_close_change_pct'] = ((df_1d['close'] - df_1d['open']) / df_1d['open']) * 100
df_1d['direction'] = np.where(df_1d['open_close_change_pct'] > 0, 'u', 'd')

# Calculate Pivot Points
if 1:
    df_1d['P'] = (df_1d['high'].shift(1) + df_1d['low'].shift(1) + df_1d['close'].shift(1)) / 3
    df_1d['S1'] = (2 * df_1d['P']) - df_1d['high'].shift(1)
    df_1d['R1'] = (2 * df_1d['P']) - df_1d['low'].shift(1)
    df_1d['S2'] = df_1d['P'] - (df_1d['high'].shift(1) - df_1d['low'].shift(1))
    df_1d['R2'] = df_1d['P'] + (df_1d['high'].shift(1) - df_1d['low'].shift(1))

if 0:
    bbands = ta.bbands(df_1d['close'], length=20)

    # Add Bollinger Bands to DataFrame
    df_1d["BB_Lower"] = bbands["BBL_20_2.0"]
    df_1d["BB_Middle"] = bbands["BBM_20_2.0"]
    df_1d["BB_Upper"] = bbands["BBU_20_2.0"]
    df_1d["BB_bandwidth"] = bbands["BBB_20_2.0"]
    df_1d["BB_percent"] = bbands["BBP_20_2.0"]

if 1:
    print_df(df_5m)
    print_df(df_1d)