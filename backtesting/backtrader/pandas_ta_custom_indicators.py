from datetime import timedelta
import operator
from matplotlib import pyplot as plt
import pandas as pd
import numpy as np
from scipy.signal import find_peaks, peak_prominences
from scipy.ndimage import gaussian_filter1d
from sklearn.metrics import r2_score
from scipy.stats import linregress



def custom_find_peaks(
        series: pd.Series,
        window_size=20, # TODO
        prominence_left_base=0, 
        find_valleys: bool=False, 
        return_values: bool = False, 
        ffill: bool = False
    ) -> pd.Series:

    values=series.copy() # otherwise, it will change series itself
    if find_valleys:
        values*=-1

    peak_indices, _ = find_peaks(values)
    prominences, left_bases, right_bases = peak_prominences(values, peak_indices)

    left_prominence = np.array(values)[peak_indices] - np.array(values)[left_bases]  # Proper indexing
    left_only_peaks: pd.Series = peak_indices[left_prominence >= prominence_left_base]

    peak_series = pd.Series(index=series.index, data=np.nan, dtype="float64")
    
    if return_values:

        peak_value = values.iloc[left_only_peaks]
        if find_valleys:
            peak_value*=-1
        peak_series.iloc[left_only_peaks] = peak_value
    
    # return indexes
    else:
        # peak_series.iloc[left_only_peaks] = 1  # Mark peaks with 1
        peak_series.iloc[left_only_peaks] = left_only_peaks # peaks indexes
    
    # Forward-fill the peak values
    if ffill:
        peak_series.ffill(inplace=True)

    return peak_series



def set_columns_diff_aligned(df: pd.DataFrame, columns: list[str], diff_period: int=1):
    """
    Adds a column to the DataFrame with -1 if all columns slopes are negative,
    and 1 if all are positive.

    Args:
        df (pd.DataFrame): The input DataFrame with SMA columns.
        columns (list): A list of three column names for the SMAs.

    Returns:
        pd.DataFrame: DataFrame with a new 'columns_diff_aligned' column.
    """

    # Calculate diff for each columns
    for col in columns:
        df[f'{col}.diff({diff_period})'] = df[col].diff(diff_period)

    # Check if all slopes are positive or negative
    key=f"{columns}.diff({diff_period}).aligned"
    df[key] = np.where(
    # df['columns_diff_aligned'] = np.where(
        # (df[f'{columns[0]}.diff({diff_period})'] > 0) &
        # (df[f'{columns[1]}.diff({diff_period})'] > 0) &
        # (df[f'{columns[2]}.diff({diff_period})'] > 0),
        np.all([df[f'{col}.diff({diff_period})'] > 0 for col in columns], axis=0),
        1,
        np.where(
            # (df[f'{columns[0]}.diff({diff_period})'] < 0) &
            # (df[f'{columns[1]}.diff({diff_period})'] < 0) &
            # (df[f'{columns[2]}.diff({diff_period})'] < 0),
            np.all([df[f'{col}.diff({diff_period})'] < 0 for col in columns], axis=0),
            -1,
            np.nan  # Neutral case
        )
    )

    # Drop diff columns if you don't want to keep them
    # df.drop(columns=[f'{col}.diff({diff_period})' for col in columns], inplace=True)

    return df




def set_columns_aligned(df: pd.DataFrame, columns: list[str]):
    """
    Adds a column to the DataFrame with -1 if all columns values are negative,
    and 1 if all are positive.

    Args:
        df (pd.DataFrame): The input DataFrame with SMA columns.
        columns (list): A list of sorted column names for the SMAs

    Returns:
        pd.DataFrame: DataFrame with a new 'columns_diff_aligned' column.
    """

    # Check if all slopes are positive or negative
    # df['columns_aligned'] = np.where(
    key=f"{columns}.aligned"
    df[key] = np.where(
        # (df[f'{columns[0]}'] > df[f'{columns[1]}']) &
        # (df[f'{columns[1]}'] > df[f'{columns[2]}']),
        np.all([df[columns[i]] > df[columns[i + 1]] for i in range(len(columns) - 1)], axis=0),
        1,
        np.where(
            # (df[f'{columns[0]}'] < df[f'{columns[1]}']) &
            # (df[f'{columns[1]}'] < df[f'{columns[2]}']),
            np.all([df[columns[i]] < df[columns[i + 1]] for i in range(len(columns) - 1)], axis=0),
            -1,
            np.nan  # Neutral case
        )
    )

    return df





def gaussian_moving_average(series: pd.Series, sigma=2):
    return pd.Series(gaussian_filter1d(series, sigma=sigma), index=series.index)


def series_to_sign(series: pd.Series):
    return pd.Series([x if pd.isna(x) else (1 if x > 0 else -1) for x in series], index=series.index)


def find_sequences(series: pd.Series):
    """
    identify sequentials in series.

    Parameters
    ----------
    series : [binary] series

    Returns
    -------
    series : start index foreach sequential series
    """
    
    group = 0 # group id

    # start index of the first sequence
    start = 0
    
    sequences = [] 

    # first item
    sequences.append(start)
    # print(f"[index] value, group, [start:end]")
    # print(f"[{0}] {series.iloc[0]}, {group}, [{start}:{start}]")

    for i in range(1, len(series)):
        
        if series.iloc[i] != series.iloc[i - 1]:
            # Update the start of the next sequence
            start = i
            group += 1
    
        sequences.append(start)
        # print(f"[{i}] {series.iloc[i]}, {group}, [{start}:{i}]")

    return pd.Series(sequences, index=series.index)






def marubozu_indicator(
        df: pd.DataFrame,
        column_open: str = "open",
        column_high: str = "high",
        column_low: str = "low",
        column_close: str = "close",
        threshold: float=0.10,
    ) -> pd.Series:

    """Custom Pandas TA function to check if a bar is a Marubozu."""
    body = abs(df[column_close] - df[column_open])
    upper_wick = df[column_high] - df[[column_open, column_close]].max(axis=1)
    lower_wick = df[[column_open, column_close]].min(axis=1) - df[column_low]
    
    # debug
    if 0:
        df['marubozu_body'] = body
        df['marubozu_upper_wick'] = upper_wick
        df['marubozu_lower_wick'] = lower_wick
        df['marubozu_upper_wick_to_body'] = upper_wick/body
        df['marubozu_lower_wick_to_body'] = lower_wick/body
        df['marubozu_upper_wick_to_body_lt_threshold'] = (upper_wick/body <= threshold)
        df['marubozu_lower_wick_to_body_lt_threshold'] = (lower_wick/body <= threshold)

    marubozu_condition = (upper_wick <= body * threshold) & (lower_wick <= body * threshold)
    
    df[f'marubozu_condition({threshold})'] = marubozu_condition.astype(int)  # 1 if Marubozu, 0 otherwise
    df[f'marubozu_condition({threshold}).percentage'] = 0.0 # init here, set on: set_rolling_event_percentage()
    # df[f'marubozu_condition({threshold}).percentage_gt_threshold'] = 0.0 # init here, set on: set_rolling_event_percentage()
    df['marubozu_direction'] = df.apply(lambda row: "up" if row[f'marubozu_condition({threshold})'] == 1 and row[column_close] > row[column_open] 
                                   else ("down" if row[f'marubozu_condition({threshold})'] == 1 and row[column_close] < row[column_open] else None), axis=1)
    
    
    return df




def fractals_backward_v0(df: pd.DataFrame, lookback=2):
    """
    Identifies fractal highs and lows using only past data.
    
    Args:
        df (pd.DataFrame): DataFrame with 'high' and 'low' columns.
        lookback (int): Number of previous bars to compare.
    
    Returns:
        pd.DataFrame: DataFrame with added 'fractal_high' and 'fractal_low' columns.
    """
    df = df.copy()

    # Fractal High: Current high is higher than the last 'lookback' highs
    df['fractal_high'] = df['high'] > df['high'].shift(1)
    for i in range(2, lookback + 1):
        df['fractal_high'] &= df['high'] > df['high'].shift(i)

    # Fractal Low: Current low is lower than the last 'lookback' lows
    df['fractal_low'] = df['low'] < df['low'].shift(1)
    for i in range(2, lookback + 1):
        df['fractal_low'] &= df['low'] < df['low'].shift(i)

    return df




def fractals_backward(df: pd.DataFrame, lookback=2):
    """
    Identifies fractal highs and lows using only past data.
    
    Args:
        df (pd.DataFrame): DataFrame with 'high' and 'low' columns.
        lookback (int): Number of previous bars to compare.
    
    Returns:
        pd.DataFrame: DataFrame with added 'fractal_high' and 'fractal_low' columns.
    """
    df = df.copy()

    # Initialize fractal conditions (assume it is a fractal)
    df['fractal_backward_high'] = True
    df['fractal_backward_low'] = True

    # Compare with past 'lookback' periods
    for i in range(1, lookback + 1):
        df['fractal_backward_high'] &= df['high'] > df['high'].shift(i)
        df['fractal_backward_low'] &= df['low'] < df['low'].shift(i)

    return df




def fractals(df: pd.DataFrame, lookback=2):
    """
    Identifies fractal highs and lows using both past and future data.
    
    Args:
        df (pd.DataFrame): DataFrame with 'high' and 'low' columns.
        lookback (int): Number of previous and future bars to compare.
    
    Returns:
        pd.DataFrame: DataFrame with added 'fractal_high' and 'fractal_low' columns.
    """
    df = df.copy()

    # Initialize fractal conditions
    df['fractal_high'] = True
    df['fractal_low'] = True

    # Compare with past and future 'lookback' periods
    for i in range(1, lookback + 1):
        df['fractal_high'] &= (df['high'] > df['high'].shift(i)) & (df['high'] > df['high'].shift(-i))
        df['fractal_low'] &= (df['low'] < df['low'].shift(i)) & (df['low'] < df['low'].shift(-i))

    return df





# Function to calculate rolling regression slope
def rolling_regression(df: pd.DataFrame, column_name: str = "close"):
    
    if not len(df):
        return df
    
    # verify we begin at 11:00 (market open)
    time_begin = df.iloc[0].name.replace(hour=11, minute=0, second=0)
    df = df.loc[time_begin:]

    # print(df)

    # iterate rows, and calc linear regression for each row (including all previous values)

    for i in range(1, len(df)): # skip first row (need at least to values for fit)
        
        sub_df = df.iloc[:i+1]  # take all points from first row to current row
        x = np.arange(len(sub_df))
        y = sub_df[column_name].values
        
        # use polyfit
        if 0:
            p_coef = np.polyfit(x, y, 1)
            p = np.poly1d(p_coef)

            slope, intercept = p_coef[0], p_coef[1] # linear regression 1 deg
            r2s: float = r2_score(y, p(x))

            print(f"[{sub_df.iloc[-1].name}] s = {slope}, r2s = {r2s}")

        
        # compute linear regression using scipy (more efficient for simple cases)
        slope, intercept, r_value, _, _ = linregress(x, y)
        r2s = r_value**2

        df.loc[sub_df.iloc[-1].name, f"{column_name}.lr.slope"] = slope 
        df.loc[sub_df.iloc[-1].name, f"{column_name}.lr.r2score"] = r2s

        
        # print(f"[{sub_df.iloc[-1].name}] s = {slope}, r2s = {r_value**2}")


    # print(df)
    # return df
    return df[[f"{column_name}.lr.slope", f"{column_name}.lr.r2score"]]


# function to calculate expanding max value with index (rolling from 1 till current value)
def expanding_max_with_index(df: pd.DataFrame, column_name: str = "close"):
    
    if not len(df):
        return df
    
    # compute expanding max timestamp manually
    max_values = []
    max_indices = []
    current_max = -np.inf
    current_max_index = None

    for idx, value in zip(df.index, df[column_name]):
        if value > current_max:
            current_max = value
            current_max_index = idx

        max_values.append(current_max)
        max_indices.append(current_max_index)

    # store it
    # df[f"{column_name}.max"] = max_values
    # df[f"{column_name}.max_idx"] = pd.to_datetime(max_indices)
    
    df.loc[:, f"{column_name}.max"] = max_values
    df.loc[:, f"{column_name}.max_idx"] = pd.to_datetime(max_indices)

    return df[[f"{column_name}.max", f"{column_name}.max_idx"]]



# function to calculate expanding max value with index (rolling from 1 till current value)
def expanding_min_with_index(df: pd.DataFrame, column_name: str = "close"):
    
    if not len(df):
        return df
    
    # compute expanding max timestamp manually
    min_values = []
    min_indices = []
    current_min = np.inf
    current_min_index = None

    for idx, value in zip(df.index, df[column_name]):
        if value < current_min:
            current_min = value
            current_min_index = idx

        min_values.append(current_min)
        min_indices.append(current_min_index)

    # store it
    # df[f"{column_name}.min"] = min_values
    # df[f"{column_name}.min_idx"] = min_indices
    
    df.loc[:, f"{column_name}.min"] = min_values
    df.loc[:, f"{column_name}.min_idx"] = min_indices

    return df[[f"{column_name}.min", f"{column_name}.min_idx"]]





# Function to calculate rolling regression slope from last max bar
def rolling_regression_from_last_max(df: pd.DataFrame, column_name: str = "close"):
    
    if not len(df):
        return df
    
    column_max = f"{column_name}.max"
    column_max_idx = f"{column_name}.max_idx"
    
    # verify we begin at 11:00 (market open)
    time_begin = df.iloc[0].name.replace(hour=11, minute=0, second=0)
    df = df.loc[time_begin:]

    # print(df)

    # iterate rows, and calc linear regression for each row (including all previous values)
    for i, row in df.iterrows():

        sub_df = df.loc[row[column_max_idx]:row.name]  # take all points from last max row to current row
        if len(sub_df) < 2:
            continue

        x = np.arange(len(sub_df))
        y = sub_df[column_name].values

        # compute linear regression using scipy (more efficient for simple cases)
        slope, intercept, r_value, _, _ = linregress(x, y)
        r2s = r_value**2

        df.loc[sub_df.iloc[-1].name, f"{column_name}.lr_from_last_max.len"] = len(sub_df)
        df.loc[sub_df.iloc[-1].name, f"{column_name}.lr_from_last_max.slope"] = slope 
        df.loc[sub_df.iloc[-1].name, f"{column_name}.lr_from_last_max.r2score"] = r2s

        
        # print(f"[{sub_df.iloc[-1].name}] s = {slope}, r2s = {r_value**2}")


    # print(df)
    # return df
    return df[[f"{column_name}.lr_from_last_max.slope", f"{column_name}.lr_from_last_max.r2score"]]





# Function to calculate rolling regression slope from last max bar
def rolling_regression_from_last_min(df: pd.DataFrame, column_name: str = "close"):
    
    if not len(df):
        return df
    
    column_min = f"{column_name}.min"
    column_min_idx = f"{column_name}.min_idx"
    
    # verify we begin at 11:00 (market open)
    time_begin = df.iloc[0].name.replace(hour=11, minute=0, second=0)
    df = df.loc[time_begin:]

    # print(df)

    # iterate rows, and calc linear regression for each row (including all previous values)
    for i, row in df.iterrows():

        sub_df = df.loc[row[column_min_idx]:row.name]  # take all points from last max row to current row
        if len(sub_df) < 2:
            continue

        x = np.arange(len(sub_df))
        y = sub_df[column_name].values

        # compute linear regression using scipy (more efficient for simple cases)
        slope, intercept, r_value, _, _ = linregress(x, y)
        r2s = r_value**2

        df.loc[sub_df.iloc[-1].name, f"{column_name}.lr_from_last_min.len"] = len(sub_df)
        df.loc[sub_df.iloc[-1].name, f"{column_name}.lr_from_last_min.slope"] = slope 
        df.loc[sub_df.iloc[-1].name, f"{column_name}.lr_from_last_min.r2score"] = r2s

        
        # print(f"[{sub_df.iloc[-1].name}] s = {slope}, r2s = {r_value**2}")


    # print(df)
    # return df
    return df[[f"{column_name}.lr_from_last_min.slope", f"{column_name}.lr_from_last_min.r2score"]]






# candlestick: 1D timeframe (from the begining of df)
def set_rolling_candle_ohlc(df: pd.DataFrame, column_name: str = "close"):
    
    if not len(df):
        return df
    
    column_candle_open = f"{column_name}.candle.open"
    column_candle_high = f"{column_name}.candle.high"
    column_candle_low = f"{column_name}.candle.low"
    column_candle_close = f"{column_name}.candle.close"
    
    
    # print(df)
    for i in range(0, len(df)): # skip first row (need at least to values for fit)
        
        sub_df = df.iloc[:i+1]  # take all points from first row to current row
        
        df.loc[sub_df.iloc[-1].name, column_candle_open] = sub_df[column_name].iloc[0] 
        df.loc[sub_df.iloc[-1].name, column_candle_high] = sub_df[column_name].max()
        df.loc[sub_df.iloc[-1].name, column_candle_low] = sub_df[column_name].min()
        df.loc[sub_df.iloc[-1].name, column_candle_close] = sub_df[column_name].iloc[-1]







# event percentage (from the begining of df)
def set_rolling_event_percentage(df: pd.DataFrame, key, value, operator=operator.eq, result=None):
    
    if not len(df):
        return df
    
    
    # print(df)
    for i in range(0, len(df)): # skip first row (need at least to values for fit)
        
        sub_df = df.iloc[:i+1]  # take all points from first row to current row
        # filtered_df = sub_df[sub_df[key]==value]
        filtered_df = sub_df[operator(sub_df[key], value)]
        
        df.loc[sub_df.iloc[-1].name, result] = len(filtered_df)/len(sub_df)
        pass


