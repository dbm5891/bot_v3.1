from matplotlib import pyplot as plt
import pandas as pd
import numpy as np

from pandas_ta_custom_indicators import custom_find_peaks, set_columns_diff_aligned, set_columns_aligned



if 1:
    # Example Usage:
    data = {
        'values': [11, 9, 12.5, 14, 22, 21],
        'signal': [1, 1, 1, np.nan, np.nan, -1],
        'sma1': [10, 11, 12, 13, 12, 11],
        'sma2': [20, 21, 22, 43, 22, 21],
        'sma3': [30, 31, 32, 33, 32, 31]
    }
    df = pd.DataFrame(data)

    # Apply the function
    smas=['sma1', 'sma2', 'sma3']
    result_df = set_columns_diff_aligned(df, smas, 3)
    result_df = set_columns_aligned(df, smas)
    print(result_df)


    for sma in smas:
        plt.plot(df.index.tolist(), df[sma], label=sma)

    plt.legend()
    plt.grid()
    plt.show()




# Example usage
if 0:
    data = {
        "close": [10, 12, 14, 13, 15, 17, 16, 18, 17, 15, 20]
    }
    df = pd.DataFrame(data)


    df["peaks"] = custom_find_peaks(df["close"])
    df["diff_last_peak"] = df["close"] - df["peaks"]

    # for i, row in df.iterrows():

    #     dx
    #     dy
    #     x = row.name.replace(hour=16, minute=30)
    #     y = row["open"]




    df["valleys"] = custom_find_peaks(df["close"], find_valleys=True)

    print(df)


    plt.plot(df.index.tolist(), df["close"], label="close")

    plt.grid()
    plt.show()

