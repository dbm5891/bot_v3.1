from lists_compare_func import *
from lists_compare_func_df import *
from lists_compare_func_temp import list_tuple_to_csv

import pandas as pd

import mplfinance as mpf
import pandas_ta as ta
import numpy as np
from scipy.ndimage import gaussian_filter1d

# ----------------------------------------------
# main


df=read_csv()

# calc indicators
df['OHLC4'] = ta.ohlc4(df['open'], df['high'], df['low'], df['close'])
df['SMA_20'] = ta.sma(df['OHLC4'], length=20)
df['SMA_50'] = ta.sma(df['OHLC4'], length=50)
df['SMA_192'] = ta.sma(df['OHLC4'], length=192)

# df['OHLC4_day_begin'] = [[10, 20, 30]]*len(df)
# df['len_OHLC4_day_begin'] = None

print("df =")
print(df)
# print(df.info())


# given a datetime, get all candles from day begin to this datetime
tested_symbol="AAPL"
tested_time = datetime(year=2022, month=5, day=11, hour=20, minute=5)



# choose row's key to plot:

# key="OHLC4_from_day_begin"
# key="SMA_50_from_day_begin"



# create figure
with plt.ioff():
    title=f"slot under test: {tested_symbol} {tested_time}"
    fig = plt.figure(title)
    ax = fig.subplots()


# ----------------------------------------------
# get all rows at that exact time (hh:mm:ss)
df_tested_time=df_get_rows_by_time(df, tested_time.time())
print(f"df_tested_time = {tested_time.time()}")
print(df_tested_time)
# print(df_tested_time.info())


tested_rows: list[dict]=[]

# for each row, create a list of all candles from day begin
for index, row in df_tested_time.iterrows():

    df_from_day_begin = df_get_rows_by_range(
        df=df,
        symbol=row["symbol"],
        time_begin=row["ruler_time_end"].replace(hour=11, minute=5),
        time_end=row["ruler_time_end"],
    )

    rows_from_day_begin: list[dict] = df_to_rows(df_from_day_begin)
    if 1:
        plot_rows_key(
            ax=ax, 
            rows=rows_from_day_begin,
            # base_time=tested_time,
            print_label=True, 
            # key="close",
            key="OHLC4",
        )



    # print(f"rows_from_day_begin = [{row['ruler_time_end'].replace(hour=11, minute=5)}] to [{row['ruler_time_end']}]")
    # print(rows_from_day_begin)

    # create list from all ohlc4
    # print(df_from_day_begin["OHLC4"])

    # print(row)

    row_dict: dict = row.to_dict()
    row_dict["OHLC4_from_day_begin"] = list(zip(df_from_day_begin["ruler_time_end"].tolist(), to_percentage(df_from_day_begin["OHLC4"].tolist())))
    row_dict["SMA_20_from_day_begin"] = list(zip(df_from_day_begin["ruler_time_end"].tolist(), to_percentage(df_from_day_begin["SMA_20"].tolist())))
    row_dict["SMA_50_from_day_begin"] = list(zip(df_from_day_begin["ruler_time_end"].tolist(), to_percentage(df_from_day_begin["SMA_50"].tolist())))
    row_dict["SMA_192_from_day_begin"] = list(zip(df_from_day_begin["ruler_time_end"].tolist(), to_percentage(df_from_day_begin["SMA_192"].tolist())))
    
    # Smooth the data (OHLC4) using a Gaussian filter
    sigma=3
    # y_smoothed: np.ndarray = gaussian_filter1d(np.array(to_percentage(df_from_day_begin["OHLC4"].tolist())), sigma=sigma)
    y_smoothed: np.ndarray = gaussian_filter1d(np.array(df_from_day_begin["OHLC4"].tolist()), sigma=sigma)
    y_smoothed=to_percentage(y_smoothed)
    row_dict[f"gaussian_filter1d_sigma_{sigma}_from_day_begin"] = list(zip(df_from_day_begin["ruler_time_end"].tolist(), y_smoothed))


    tested_rows.append(row_dict)
    # print(row_dict)
    
    



# ----------------------------------------------
# print(tested_rows[-1])




# TODO: 
# 1) find similar lists


if 0:
    for key in[
        # "OHLC4_from_day_begin",
        f"gaussian_filter1d_sigma_{sigma}_from_day_begin",
        # "SMA_20_from_day_begin",
        # "SMA_50_from_day_begin",
        # "SMA_192_from_day_begin",
    ]:
        plot_rows_key_from_day_begin(
            ax=ax, 
            rows=tested_rows, 
            base_time=tested_time, 
            row_key=key,
            print_label=True
        )


plot_axvline(ax=ax, dt=tested_time)

# get min/max values between tested_row and market close


# plot graph
# plt.ylim(-7, 7) # Set y-axis limits

plt.legend(loc='best')
plt.title(title)
plt.grid()
plt.show()


