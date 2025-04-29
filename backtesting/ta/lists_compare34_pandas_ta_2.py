from lists_compare_func import *
from lists_compare_func_df import *

import mplfinance as mpf
import pandas_ta as ta

# ----------------------------------------------
# main


df=read_csv()

# calc indicators
df['OHLC4'] = ta.ohlc4(df['open'], df['high'], df['low'], df['close'])
df['SMA_20'] = ta.sma(df['OHLC4'], length=20)
df['SMA_50'] = ta.sma(df['OHLC4'], length=50)
df['SMA_192'] = ta.sma(df['OHLC4'], length=192)
df['SMA_1000'] = ta.sma(df['OHLC4'], length=1000*2)

# df['OHLC4_day_begin'] = [[10, 20, 30]]*len(df)
# df['len_OHLC4_day_begin'] = None

print("df =")
print(df)
# print(df.info())

df.to_csv("aaa.csv")

rows: list[dict] = df_to_rows(df)

# create figure
with plt.ioff():
    title=f'[{rows[0]["symbol"]}, {rows[0]["ruler_time_end"]}] to [{rows[-1]["symbol"]}, {rows[-1]["ruler_time_end"]}]'
    fig = plt.figure(title)
    ax = fig.subplots()

for key in[
        "OHLC4",
        # "close",
        "SMA_20",
        "SMA_50",
        "SMA_192",
        "SMA_1000",
    ]:

    plot_rows_key(
        ax=ax, 
        rows=rows,
        print_label=True, 
        key=key,
    )



plt.legend(loc='best')
plt.title(title)
plt.grid()
plt.show()


