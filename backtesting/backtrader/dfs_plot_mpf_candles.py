import mplfinance as mpf

from dfs_set_ta_indicators import df_1d

# plot Candlestick
addplots = [
    mpf.make_addplot(df_1d['sma_20'], label="sma_20 (1d)"),
]
mpf.plot(df_1d, type='candle', style='yahoo', title="Candlestick Chart (Date Range)", ylabel="Price", addplot=addplots)

