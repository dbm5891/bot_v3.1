import pandas_ta as ta
import pandas as pd
from scipy.ndimage import gaussian_filter1d
# TODO:

# Define the Gaussian 1D filter indicator
# @ta.indicator(name="gaussian_filter", category="custom")
def gaussian_filter_1d(series, sigma=1):
    """
    Applies a Gaussian 1D filter to a Pandas Series.
    
    Parameters:
        series (pd.Series): Input data
        sigma (float): Standard deviation for Gaussian kernel
    
    Returns:
        pd.Series: Smoothed series
    """
    return pd.Series(gaussian_filter1d(series, sigma=sigma), index=series.index)





def custom_gaussian_filter_1d(series, length=2):
    """
    Custom Simple Moving Average (SMA) Indicator
    
    Parameters:
        series (pd.Series): Input data
        length (int): Number of periods for the SMA
    
    Returns:
        pd.Series: Computed SMA
    """
    x=series.rolling(window=length)
    return series.rolling(window=length).mean()






# Monkey-patch pandas_ta
ta.gaussian_filter = gaussian_filter_1d


# Example usage
data = {
    "close": [10, 11, 12, 11, 10, 9, 8, 9, 10, 11, 12]
}
df = pd.DataFrame(data)


df["filtered11"]=custom_gaussian_filter_1d(df["close"], 3)
print(df)

df["filtered"] = ta.gaussian_filter(df["close"], sigma=2)
print(df)

# Apply the Gaussian filter with sigma = 2
df["gaussian_filtered"] = gaussian_filter_1d(df["close"], sigma=2)
print(df)
