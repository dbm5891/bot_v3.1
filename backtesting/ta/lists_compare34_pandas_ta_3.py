from lists_compare_func import *
# from lists_compare_func_df import *

import mplfinance as mpf
import pandas_ta as ta

# ----------------------------------------------

cwd = os.getcwd()
sys.path.append(f"{cwd}\\bot")
path = f"{cwd}\\backtesting\\csv_input"


# ----------------------------------------------
# read 5min timeframe data

filename="aapl_5m_2022-05-09_to_2023-07-12.csv"
df_5m = pd.read_csv(f"{path}/{filename}", parse_dates=["date"])
df_5m = df_5m.set_index("date")
# df_5m.sort_values(by="date", inplace=True, ascending=True)
df_5m.sort_index(ascending=True, inplace=True)
df_5m['sma_20'] = ta.sma(df_5m['close'], length=20)
# prinf_df(df_5m)
# 

# ----------------------------------------------
# read 1day timeframe data
filename="aapl_1d_2019_to_2024.csv"
df_1d = pd.read_csv(f"{path}/{filename}")
df_1d["date"] = pd.to_datetime(df_1d["date"], format="%m/%d/%Y")

# Replace time to 23:00 (close)
df_1d['date'] = df_1d['date'].dt.normalize() + pd.Timedelta(hours=23)

df_1d = df_1d.set_index("date")
df_1d.sort_index(ascending=True, inplace=True)
# df_1d.sort_values(by="date", inplace=True, ascending=True)
df_1d['ohlc4'] = ta.ohlc4(df_1d['open'], df_1d['high'], df_1d['low'], df_1d['close'])
df_1d['sma_20'] = ta.sma(df_1d['close'], length=20)
df_1d['sma_50'] = ta.sma(df_1d['close'], length=50)
df_1d['sma_200'] = ta.sma(df_1d['close'], length=200)

# Calculate Pivot Points
df_1d['P'] = (df_1d['high'].shift(1) + df_1d['low'].shift(1) + df_1d['close'].shift(1)) / 3
df_1d['S1'] = (2 * df_1d['P']) - df_1d['high'].shift(1)
df_1d['R1'] = (2 * df_1d['P']) - df_1d['low'].shift(1)
df_1d['S2'] = df_1d['P'] - (df_1d['high'].shift(1) - df_1d['low'].shift(1))
df_1d['R2'] = df_1d['P'] + (df_1d['high'].shift(1) - df_1d['low'].shift(1))

# df_1d['close_rolling'] = df_1d['close'].rolling(window=20, win_type="gaussian").mean(std=6)
# df_1d['sma_20_rolling'] = df_1d['sma_20'].rolling(window=20, win_type="gaussian").mean(std=6)
# df_1d['sma_20_rolling'] = df_1d['close'].rolling(window=20, center=True).mean()

df_1d['in_day_change'] = df_1d['close'] - df_1d['open']
df_1d['in_day_change_pct'] = ((df_1d['close'] - df_1d['open']) / df_1d['open']) * 100
df_1d['direction'] = np.where(df_1d['in_day_change_pct'] > 0, 'u', 'd')

# df_1d['day_change'] = df_1d['close'].diff()
# df_1d['day_change_pct'] = df_1d['close'].pct_change() * 100

# Selecting a subset of data
time_begin = datetime(year=2019, month=11, day=29)
time_end = datetime(year=2024, month=11, day=27)
# df_1d = df_1d.loc[time_begin:time_end]

# prinf_df(df_1d)
# df_1d.to_csv("df_1d.csv")


# symbol
symbol_df_1d=df_1d['symbol'].iloc[0]
symbol_df_5m=df_5m['symbol'].iloc[0]
if symbol_df_1d != symbol_df_5m:
    raise ValueError("dataframes must represent same symbol.")
symbol=symbol_df_1d

# Set pandas option to display all rows
# pd.set_option('display.max_rows', None)

# exit()

if 0:
    bbands = ta.bbands(df_1d['close'], length=20)

    # Add Bollinger Bands to DataFrame
    df_1d["BB_Lower"] = bbands["BBL_20_2.0"]
    df_1d["BB_Middle"] = bbands["BBM_20_2.0"]
    df_1d["BB_Upper"] = bbands["BBU_20_2.0"]
    df_1d["BB_bandwidth"] = bbands["BBB_20_2.0"]
    df_1d["BB_percent"] = bbands["BBP_20_2.0"]

    # prinf_df(df_1d)




# choose sub time by time

# calc smas



# plot Candlestick
if 0:
    addplots = [
        mpf.make_addplot(df_1d['sma_20'], label="sma_20 (1d)"),
        # mpf.make_addplot(df_1d['sma_50'], label="sma_50 (1d)"),
    ]
    mpf.plot(df_1d, type='candle', style='yahoo', title="Candlestick Chart (Date Range)", ylabel="Price", addplot=addplots)

# plot 5m and 1d

# ----------------------------------------------
if 1:
    alpha=0.50
    linewidth=1.5
    for dt in df_1d.index.tolist():
        
        # if dt<datetime(year=2022, month=5, day=9) or dt>datetime(year=2023, month=7, day=12):
        #     continue

        # in day lines
        ymin=df_1d.loc[dt]["low"]
        ymax=df_1d.loc[dt]["high"]

        # Israel time
        dt_pm:datetime=dt.replace(hour=11, minute=0, second=0) # premarket open
        dt_mo:datetime=dt.replace(hour=16, minute=30, second=0) # market open
        dt_mc:datetime=dt.replace(hour=23, minute=0, second=0) # market close
        dt_ah:datetime=dt.replace(hour=23, minute=0, second=0)+timedelta(hours=4) # after hours close

        # daily vertical lines (boundries)
        plt.plot([dt_pm]*2, [ymin, ymax], ls='-', linewidth=linewidth, color="yellow", alpha=alpha)
        plt.plot([dt_mo]*2, [ymin, ymax], ls='-', linewidth=linewidth, color="b", alpha=alpha)
        plt.plot([dt_mc]*2, [ymin, ymax], ls='-', linewidth=linewidth, color="b", alpha=alpha)
        plt.plot([dt_ah]*2, [ymin, ymax], ls='-', linewidth=linewidth, color="deepskyblue", alpha=alpha)

        # daily pivot
        plt.plot([dt_pm, dt_ah], [df_1d.loc[dt]["P"], df_1d.loc[dt]["P"]], ls='-', linewidth=linewidth, color="black", alpha=alpha)
        plt.plot([dt_pm, dt_ah], [df_1d.loc[dt]["S1"], df_1d.loc[dt]["S1"]], ls='-', linewidth=linewidth, color="g", alpha=alpha)
        plt.plot([dt_pm, dt_ah], [df_1d.loc[dt]["S2"], df_1d.loc[dt]["S2"]], ls='-', linewidth=linewidth, color="g", alpha=alpha)
        plt.plot([dt_pm, dt_ah], [df_1d.loc[dt]["R1"], df_1d.loc[dt]["R1"]], ls='-', linewidth=linewidth, color="r", alpha=alpha)
        plt.plot([dt_pm, dt_ah], [df_1d.loc[dt]["R2"], df_1d.loc[dt]["R2"]], ls='-', linewidth=linewidth, color="r", alpha=alpha)

    # legend: pivot
    plt.plot([], [], color="black", label="[D] Pivot")
    plt.plot([], [], color="g", label="[D] S1, S2")
    plt.plot([], [], color="r", label="[D] R1, R2")

    # legend: market hours
    if 0:
        plt.plot([], [], color="yellow", label="premarket open (11:00)")
        plt.plot([], [], color="b", label="market open (16:30), close (23:00)")
        plt.plot([], [], color="deepskyblue", label="after hours close (3:00)")



# ----------------------------------------------
# plot daily "open", "close" prices
rows_1d = []
for i in range(len(df_1d)):
    rows_1d.append({'date': df_1d.iloc[i].name.replace(hour=16, minute=30), 'price': df_1d['open'][i]})
    rows_1d.append({'date': df_1d.iloc[i].name.replace(hour=23, minute=0), 'price': df_1d['close'][i]})
df_1d_open_close = pd.DataFrame(rows_1d)
df_1d_open_close = df_1d_open_close.set_index("date")
df_1d_open_close.sort_index(ascending=True, inplace=True)

# prinf_df(df_1d_open_close)

plt.plot(df_1d_open_close.index.tolist(), df_1d_open_close["price"], label="[D] open, close")



# ----------------------------------------------
# plt.plot(df_1d.index.tolist(), df_1d["close"], label="close (1d)")
# plt.plot(df_1d.index.tolist(), df_1d["ohlc4"], label="ohlc4 (1d)")
# plt.plot(df_1d.index.tolist(), df_1d["sma_10"], label="sma_10 (1d)")
plt.plot(df_1d.index.tolist(), df_1d["sma_20"], label="[D] sma(20)")
# plt.plot(df_1d.index.tolist(), df_1d["sma_50"], label="sma_50 (1d)")
# plt.plot(df_1d.index.tolist(), df_1d["sma_200"], label="sma_200 (1d)")

# plt.plot(df_1d.index.tolist(), df_1d["close_rolling"], label="close_rolling (1d)")
# plt.plot(df_1d.index.tolist(), df_1d["sma_20_rolling"], label="sma_20_rolling (1d)")

# plt.plot(df_1d.index.tolist(), df_1d["BB_Middle"], label="BB_Middle (1d)")
# plt.plot(df_1d.index.tolist(), df_1d["BB_Upper"], label="BB_Upper (1d)")
# plt.plot(df_1d.index.tolist(), df_1d["BB_Lower"], label="BB_Lower (1d)")

# Annotate the direction on the plot
if 0:
    alpha=0.50
    for i, row in df_1d.iterrows():
        if 1:
            # txt=f"{row['direction']} {round(row['in_day_change_pct'], 2)}%"
            txt=f"{round(row['in_day_change_pct'], 2)}%"
            plt.text(row.name, row['close'], txt, fontsize=10, ha='right', va='bottom', alpha=alpha)

        if row.name.strftime('%a')=="Mon":
            txt="Mon"
            plt.text(row.name.replace(hour=11, minute=0), row['open'], txt, fontsize=10, ha='right', va='bottom', alpha=alpha)


# 5min
plt.plot(df_5m.index.tolist(), df_5m["close"], label="[5m] close")
plt.plot(df_5m.index.tolist(), df_5m["sma_20"], label="[5m] sma(20)")

 

plt.legend(loc='best')
plt.title(f"{symbol}, [{time_begin.strftime('%Y-%m-%d')}] to [{time_end.strftime('%Y-%m-%d')}]")
plt.grid()
plt.show()