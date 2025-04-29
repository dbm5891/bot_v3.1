from datetime import datetime, time, timedelta
import operator
import numpy as np
import pandas as pd
import pandas_ta as ta
from dfs_prepare import df_5m
from functional.dataframes import print_df, print_all_rows_df
from pandas_ta_custom_indicators import custom_find_peaks, expanding_max_with_index, expanding_min_with_index, find_sequences, fractals, fractals_backward, marubozu_indicator, set_rolling_event_percentage, set_rolling_candle_ohlc, rolling_regression, rolling_regression_from_last_max, rolling_regression_from_last_min, set_columns_diff_aligned, set_columns_aligned, gaussian_moving_average, series_to_sign

# ----------------------------------------------
# 5min
# ----------------------------------------------

df_5m['open_close_change'] = df_5m['close'] - df_5m['open']
df_5m['open_close_change_pct'] = (df_5m['close'] - df_5m['open']) / df_5m['open']
df_5m['close_close_change_pct'] = df_5m['close'].pct_change()


# TODO: use?
if 0:
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
    df_5m[f"close_sub_sma({length}).percentage_positive"] = 0.0 # init
    df_5m[f"close_sub_sma({length}).percentage_negative"] = 0.0 # init









# local

local_lengths_diffs=[
    # (5, 1), 
    (20, 3), 
    # (21, 4), 
    # (30, 5), 
    # (50, 5), 
    # (10, 1), 
    # (200, 10), # gma(200, 6) not similar to sma(200)
]

# columns = []
if 1:
    g_std=6
    win_type="gaussian"
    for (length, diff_period) in local_lengths_diffs:
        
        # smoother
        key_indicator_0=f'gaussian({length}, {g_std})'
        df_5m[key_indicator_0] = df_5m['close'].rolling(window=length, center=False, win_type=win_type).mean(std=g_std)

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

if 0:
    signal_column=key_indicator_0 # gaussian moving average
    signal_diff_period=1

if 1:
    indicator_1=ta.zlma
    indicator_1_length=10
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
df_5m[f'{key_signal_column_diff}.sign'] = series_to_sign(df_5m[key_signal_column_diff])
df_5m[f'{key_signal_column_diff}.sign.sequences'] = find_sequences(df_5m[f'{key_signal_column_diff}.sign'])
    


# peaks/valleys
prominence_left_base=1
key_signal_peaks=f"{signal_column}.peaks({prominence_left_base})"
key_signal_valleys=f"{signal_column}.valleys({prominence_left_base})"
df_5m[key_signal_peaks] = custom_find_peaks(df_5m[signal_column], prominence_left_base=prominence_left_base, return_values=True)
df_5m[key_signal_valleys] = custom_find_peaks(df_5m[signal_column], prominence_left_base=prominence_left_base, find_valleys=True, return_values=True)



# Bollinger Bands
bb_length=20
# bb_length=global_lengths_diffs[-1][0]
# bb_stds=[1.0, 2.0, 3.0]
bb_stds=[2.0]
bb_mamode="sma"
if 1:
    for bb_std in bb_stds:
        bbands = ta.bbands(df_5m['close'], length=bb_length, std=bb_std, mamode=bb_mamode)
        
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, upper)"] = bbands[f"BBU_{bb_length}_{bb_std}"]
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, middle)"] = bbands[f"BBM_{bb_length}_{bb_std}"]
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, lower)"] = bbands[f"BBL_{bb_length}_{bb_std}"]    
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, bandwidth)"] = bbands[f"BBB_{bb_length}_{bb_std}"]
        df_5m[f"bbands({bb_length}, {bb_std}, {bb_mamode}, percent)"] = bbands[f"BBP_{bb_length}_{bb_std}"]



# print_df(df_5m)
# prinf_all_rows_df(df_5m)

# fractals
fractals_lookback=2
df_5m=fractals_backward(df_5m, lookback=fractals_lookback)
df_5m=fractals(df_5m, lookback=fractals_lookback)
# print_df(df_5m)


# Apply rolling regression for each day separately
if 1:
    dataframes = []

    # Initialize a new column for slopes
    column_name: str = "close"
    # column_name: str = "sma(20)" # TODO: raise KeyError(key) from err KeyError: 'close.lr.slope'

    # last max value
    df_5m[f"{column_name}.max"] = np.nan
    df_5m[f"{column_name}.max_idx"] = pd.NaT # index of last max

    # last min value
    df_5m[f"{column_name}.min"] = np.nan 
    df_5m[f"{column_name}.min_idx"] = pd.NaT # index of last max

    # linear regression from fixed time (e.g. 11:00 or 16:30)
    df_5m[f"{column_name}.lr.slope"] = np.nan 
    df_5m[f"{column_name}.lr.slope.percentage_positive"] = 0.0
    df_5m[f"{column_name}.lr.slope.percentage_negative"] = 0.0
    df_5m[f"{column_name}.lr.r2score"] = np.nan
    
    # linear regression from last max bar
    df_5m[f"{column_name}.lr_from_last_max.len"] = np.nan 
    df_5m[f"{column_name}.lr_from_last_max.slope"] = np.nan 
    df_5m[f"{column_name}.lr_from_last_max.r2score"] = np.nan
    
    # linear regression from last min bar
    df_5m[f"{column_name}.lr_from_last_min.len"] = np.nan 
    df_5m[f"{column_name}.lr_from_last_min.slope"] = np.nan 
    df_5m[f"{column_name}.lr_from_last_min.r2score"] = np.nan

    
    
    
    
    # extract dates only
    unique_dates = pd.Series(df_5m.index.date).unique()
    print(unique_dates)

    
    
    if 1:
        for date in unique_dates:

            # ---===---
            # get all rows between today at 11:00 to next day at 03:00
            # time_begin = datetime.combine(date, time(hour=11, minute=0))
            # time_end = time_begin + timedelta(hours=16)
            
            # WARN: this will remove data (before 11:00) from dataframe - DONE!
            time_begin = datetime.combine(date, time(hour=16, minute=25))
            time_end = time_begin + timedelta(hours=6, minutes=30)

            df_day = df_5m.loc[time_begin:time_end]


            # ---===---
            
            print(f"rolling_regression({time_begin} -> {time_end})...")
            df0 = rolling_regression(df_day, column_name)

            
    if 1:
        for date in unique_dates:

            # ---===---
            time_begin = datetime.combine(date, time(hour=16, minute=30)) # should be one bar larger (5min) then previous rolling_regression
            time_end = time_begin + timedelta(hours=6, minutes=25)
            df_day = df_5m.loc[time_begin:time_end]

            print(f"set_rolling_event_percentage({time_begin})... > 0")
            set_rolling_event_percentage(
                df_day, 
                key=f"{column_name}.lr.slope", 
                value=0,
                operator=operator.gt, # positive slope: df_day["close.lr.slope"]>0
                result=f"{column_name}.lr.slope.percentage_positive"
            )

            print(f"set_rolling_event_percentage({time_begin})... < 0")
            set_rolling_event_percentage(
                df_day, 
                key=f"{column_name}.lr.slope", 
                value=0,
                operator=operator.lt, # negative slope: df_day["close.lr.slope"]<0
                result=f"{column_name}.lr.slope.percentage_negative"
            )
        
            # prinf_all_rows_df(df0)
            
            # Merge new column(s) back into the original DataFrame 
            # df_5m.loc[df0.index, df0.columns] = df0

            # df_5m[f"{column_name}.lr.slope"] = df0[f"{column_name}.lr.slope"]
            # df_5m[f"{column_name}.lr.r2score"] = df0[f"{column_name}.lr.r2score"]
            # prinf_all_rows_df(df_5m)

            # dataframes[[f"{column_name}.lr.slope", f"{column_name}.lr.r2score"]] = rolling_regression(df_day, column_name)
            # dataframes[[f"{column_name}.lr.slope", f"{column_name}.lr.r2score"]] = rolling_regression(df_day, column_name)
            
            # dataframes.append(rolling_regression(df_day, column_name))
            # dataframes.append(rolling_regression(df_day, "gaussian(20, 6)"))


            
            # ---===---


    if 0:
        for date in unique_dates:

            # ---===---
            # get all rows between today at 11:00 to next day at 03:00
            # time_begin = datetime.combine(date, time(hour=11, minute=0))
            # time_end = time_begin + timedelta(hours=16)
            
            # WARN: this will remove data (before 11:00) from dataframe - DONE!
            time_begin = datetime.combine(date, time(hour=16, minute=25)) 
            time_end = time_begin + timedelta(hours=6, minutes=30)

            df_day = df_5m.loc[time_begin:time_end]


            # we shall do it manually instead using expanding() because we want to save index too: expanding_max_with_index()
            if 0:
                s0 = df_day[column_name].expanding().max()
                df_5m.loc[s0.index, f"{column_name}.expanding_max"] = s0
                
                s0 = df_day[column_name].expanding().min()
                df_5m.loc[s0.index, f"{column_name}.min"] = s0

            
            df0 = expanding_max_with_index(df_day, column_name)
            df_5m.loc[df0.index, df0.columns] = df0

            df0 = expanding_min_with_index(df_day, column_name)
            df_5m.loc[df0.index, df0.columns] = df0
            
            
            # prinf_all_rows_df(df_5m)

            # calc rolling_regression from last max, min points

            

            
            
            


            
            

            print(f"rolling_regression_from_last_max({time_begin} -> {time_end})...")
            df0 = rolling_regression_from_last_max(df_day, column_name)
            # df_5m.loc[df0.index, df0.columns] = df0
            # prinf_all_rows_df(df0)

            print(f"rolling_regression_from_last_min({time_begin} -> {time_end})...")
            df0 = rolling_regression_from_last_min(df_day, column_name)
            # df_5m.loc[df0.index, df0.columns] = df0
            
            pass


    

    
    
    # ---===---
    # 1D candle
    if 1:
        # column_name: str = "close"
        # initialize column(s)
        df_5m[f"{column_name}.candle.open"] = np.nan
        df_5m[f"{column_name}.candle.high"] = np.nan
        df_5m[f"{column_name}.candle.low"] = np.nan
        df_5m[f"{column_name}.candle.close"] = np.nan

        for date in unique_dates:

            # ---===---
            # get all rows between today at 11:00 to next day at 03:00
            time_begin = datetime.combine(date, time(hour=16, minute=25))
            time_end = time_begin + timedelta(hours=6, minutes=30) # 23:00
            
            # WARN: this will remove data (before 11:00) from dataframe - DONE!
            # time_begin = datetime.combine(date, time(hour=11+5, minute=0+30))
            # time_end = time_begin + timedelta(hours=16-5.5)

            df_day = df_5m.loc[time_begin:time_end]

            # daily candle (1d)
            # set open time (default 16:30), get all (ohlc series), and for each bar set daily open (default), high (max highs), low (min lows), close (current)
            # alternative: use signal (default: close), and maintain ohlc for it.


            print(f"set_rolling_candle_ohlc({time_begin})...")
            df0 = set_rolling_candle_ohlc(df_day, column_name)
            
            
            
            

            pass


        if 1:
            marubozu_indicator_threshold=0.50
            marubozu_indicator(
                df_5m,
                f"{column_name}.candle.open",
                f"{column_name}.candle.high",
                f"{column_name}.candle.low",
                f"{column_name}.candle.close",
                threshold=marubozu_indicator_threshold,
            )

        for date in unique_dates:
            time_begin = datetime.combine(date, time(hour=16, minute=25))
            time_end = time_begin + timedelta(hours=6, minutes=30) # 23:00
            df_day = df_5m.loc[time_begin:time_end]

            print(f"set_rolling_event_percentage({time_begin})...")
            set_rolling_event_percentage(
                df_day, 
                key=f"marubozu_condition({marubozu_indicator_threshold})", 
                value=1,
                operator=operator.eq,
                result=f"marubozu_condition({marubozu_indicator_threshold}).percentage"
            )

        # ===---===
        # smooth: f"marubozu_condition({marubozu_indicator_threshold}).percentage"
        if 0:
            df_5m[f'marubozu_condition({marubozu_indicator_threshold}).percentage.sma(10)'] = ta.sma(df_5m[f"marubozu_condition({marubozu_indicator_threshold}).percentage"], length=10)
            df_5m[f'marubozu_condition({marubozu_indicator_threshold}).percentage.gma(10, 3)'] = df_5m[f"marubozu_condition({marubozu_indicator_threshold}).percentage"].rolling(window=10, center=False, win_type=win_type).mean(std=3)
        
    
    # --------=======---------
    # close_sub_sma(20)
    if 1:
        # sma_period=50
        sma_period=200
        for date in unique_dates:
            time_begin = datetime.combine(date, time(hour=16, minute=25))
            time_end = time_begin + timedelta(hours=6, minutes=30)
            df_day = df_5m.loc[time_begin:time_end]

            print(f"set_rolling_event_percentage({time_begin})...")
            set_rolling_event_percentage(
                df_day, 
                key=f"close_sub_sma({sma_period})", 
                value=0,
                operator=operator.gt,
                result=f"close_sub_sma({sma_period}).percentage_positive"
            )

            print(f"set_rolling_event_percentage({time_begin})...")
            set_rolling_event_percentage(
                df_day, 
                key=f"close_sub_sma({sma_period})", 
                value=0,
                operator=operator.lt,
                result=f"close_sub_sma({sma_period}).percentage_negative"
            )

    # --------=======---------
    # monitor lr1d slope


    column_name = f"{column_name}.lr.slope"



    # sma for signal column
    length=5
    
    # sma
    if 1:
        key_indicator_0=f'{column_name}.{ta.sma.__name__}({length})' # sma/ema
        df_5m[key_indicator_0] = ta.sma(df_5m[column_name], length=length)

    # gaussian (smoother)
    if 0:
        g_std=3
        win_type="gaussian"
        key_indicator_0=f'{column_name}.gaussian({length}, {g_std})'
        df_5m[key_indicator_0] = df_5m[column_name].rolling(window=length, center=False, win_type=win_type).mean(std=g_std)




    signal_column=column_name # close
    signal_column=key_indicator_0 # sma/gma
    signal_diff_period=1
    key_signal_column_diff=f'{signal_column}.diff({signal_diff_period})'
    df_5m[key_signal_column_diff] = df_5m[signal_column].diff(signal_diff_period)
    df_5m[f'{key_signal_column_diff}.sign'] = series_to_sign(df_5m[key_signal_column_diff])
    df_5m[f'{key_signal_column_diff}.sign.sequences'] = find_sequences(df_5m[f'{key_signal_column_diff}.sign'])

    # peaks/valleys
    prominence_left_base=0.01
    key_signal_peaks=f"{signal_column}.peaks({prominence_left_base})"
    key_signal_valleys=f"{signal_column}.valleys({prominence_left_base})"
    df_5m[key_signal_peaks] = custom_find_peaks(df_5m[signal_column], prominence_left_base=prominence_left_base, return_values=True)
    df_5m[key_signal_valleys] = custom_find_peaks(df_5m[signal_column], prominence_left_base=prominence_left_base, find_valleys=True, return_values=True)

    
    # print values
    if 0:
        for i,v in df_5m[key_signal_column_diff].items():
            print(i, v)



    if 0:
        # slope for: close.lr.slope.sma(5).diff(1) -> close.lr.slope.sma(5).diff(1).diff(1)
        signal_diff_period=1
        key_signal_column_diff_diff=f'{key_signal_column_diff}.diff({signal_diff_period})'
        df_5m[key_signal_column_diff_diff] = df_5m[key_signal_column_diff].diff(signal_diff_period)
        # df_5m[f'{key_signal_column_diff_diff}.sign'] = series_to_sign(df_5m[key_signal_column_diff_diff])
        # df_5m[f'{key_signal_column_diff_diff}.sign.sequences'] = find_sequences(df_5m[f'{key_signal_column_diff_diff}.sign'])








# print(df_5m)
print_df(df_5m)

if 0:
    timestamp = datetime.now().strftime("%d-%m-%Y_%H-%M-%S")
    df_5m.to_csv(f"a_{timestamp}.csv")


# Detect Marubozu candlesticks
# df_5m["marubozu"] = ta.cdl_marubozu(df_5m["open"], df_5m["high"], df_5m["low"], df_5m["close"])