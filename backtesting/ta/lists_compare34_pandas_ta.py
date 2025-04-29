from lists_compare_func import *
# from lists_compare_func_temp import list_tuple_to_csv

import pandas as pd

import mplfinance as mpf
import pandas_ta as ta

# ----------------------------------------------
# main


df=read_csv()

print(df)
print(df.info())

# df['date'] = pd.to_datetime(df['date'])
# df.set_index('ruler_time_end', inplace=True)

df['OHLC4'] = ta.ohlc4(df['open'], df['high'], df['low'], df['close'])
df['SMA_20'] = ta.sma(df['OHLC4'], length=20)
df['SMA_50'] = ta.sma(df['OHLC4'], length=50)
df['SMA_192'] = ta.sma(df['OHLC4'], length=192)

print(df)
print(df.info())

exit(2)

# Calculate OHLC4 in place
# df.ta.ohlc4(append=True)

print(df)
print(df.info())



# Selecting a subset of data
if 0:
    time_begin = datetime(year=2022, month=5, day=11, hour=11, minute=5)
    # time_end = datetime(year=2022, month=5, day=11, hour=19, minute=5)
    time_end = time_begin + timedelta(days=1) - timedelta(minutes=5)

    df_subset = df.loc[time_begin:time_end]
    print(df_subset)
    print(df_subset.info())


# given a datetime, get all candles from day begin to this datetime
tested_symbol="AAPL"
tested_time = datetime(year=2022, month=5, day=11, hour=19, minute=5)

df_subset = df.loc[tested_time.replace(hour=11, minute=5):tested_time]
print(df_subset)
print(df_subset.info())


# Plot the candlestick chart using mplfinance
# mpf.plot(df,        type='candle', style='charles', title="Candlestick Chart", ylabel="Price")
sma_plot = mpf.make_addplot(df_subset['SMA_20'], label="SMA_20")
mpf.plot(df_subset, type='candle', style='yahoo', title="Candlestick Chart (Date Range)", ylabel="Price", addplot=sma_plot)

# Customize with specific colors
# mpf.plot(df_subset, type='candle', style='classic', title="Candlestick Chart - Custom", ylabel="Price",
#          figsize=(10, 6), volume=True, figratio=(16, 9), figscale=1.2)

# plt.legend(['Candlesticks', 'SMA_20'], loc='upper left', fontsize=12)


# Display the plot with the legend
# plt.show()

exit()






lists_same_time=[]
similar_lists=[]


tested_symbol="AAPL"
tested_time = datetime(year=2022, month=5, day=11, hour=19, minute=5)

time_begin = tested_time.replace(hour=11, minute=5)
time_end = time_begin+timedelta(hours=16)


tested_row=get_row(df, tested_symbol, tested_time)
# set attributes for plotting
tested_row["plot_attributes_marker"]="-o"
tested_row["plot_attributes_label"]="(list_under_test)"
tested_row["plot_attributes_zorder"]=1

# print(row)
print(len(tested_row))


# create figure
with plt.ioff():
    title=f'{tested_row["symbol"]} {tested_row["ruler_time_end"]}'
    fig = plt.figure(title)
    ax = fig.subplots()

# ----------------------------------------------
# get candles
if 1:

    

    # get candles 
    rows_range: list[dict]=get_rows_range(df, tested_row["symbol"], tested_row["ruler_time_end"].replace(hour=11, minute=5), tested_row["ruler_time_end"].replace(hour=23, minute=5))
    rows_range: list[dict]=get_rows_range(df, tested_symbol, time_begin, time_end)
    # print(rows_range)
    
    plot_rows_key(ax=ax, rows=rows_range, print_label=True)
    plot_rows_key(ax=ax, rows=rows_range, print_label=True, key="sma_period_20")
    plot_rows_key(ax=ax, rows=rows_range, print_label=True, key="sma_period_50")
    plot_rows_key(ax=ax, rows=rows_range, print_label=True, key="sma_period_192")

    plot_axvline(ax=ax, dt=tested_time)

    # get min/max values between tested_row and market close


    # plot graph
    # plt.axvline(x=66, linewidth=3, color="grey", linestyle='-.')
    # plt.axvline(x=66+78, linewidth=3, color="grey", linestyle='-.')
    plt.legend(loc='best')
    plt.title(title)
    plt.grid()
    plt.show()









