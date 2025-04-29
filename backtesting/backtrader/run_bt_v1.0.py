import time
import backtrader as bt

from dfs_set_ta_indicators import df_5m, df_1d
from strategies.bt_s1_0 import MultiTimeframeStrategy_basic, SingleTimeframeStrategy

# Start time
start_time = time.time()

# Create a Cerebro instance
cerebro = bt.Cerebro()

# Create a data feed from the DataFrame
data_1d = bt.feeds.PandasData(dataname=df_1d)
data_5m = bt.feeds.PandasData(dataname=df_5m)


# Add the data feeds to Cerebro
cerebro.adddata(data_1d)  # Add the daily data first
cerebro.adddata(data_5m)  # Add the 5-minute data second

# Add the strategy
# cerebro.addstrategy(SingleTimeframeStrategy)
cerebro.addstrategy(MultiTimeframeStrategy_basic)

# Print out the starting conditions
print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())

# Run over everything
cerebro.run()

# Print out the final result
print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())


# Calculate runtime
curr_time = time.time()
runtime = round(curr_time - start_time, 2)
print(f"Runtime: {runtime} seconds")

# Plot the results
# cerebro.plot() # default (close)
# cerebro.plot(style='bar', barup="g")
cerebro.plot(
    style='candle',
    barup="g",
    bardown="r",
    # volume=False,  # Hide volume for cleaner visualization
    fmt_x_ticks='%Y-%m-%d %H:%M',  # Custom format for x-axis
    fmt_x_data='%Y-%m-%d %H:%M',   # Custom format for tooltips
)