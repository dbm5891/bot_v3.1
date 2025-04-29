import time as tm
import backtrader as bt

from dfs_set_ta_indicators import df_5m, df_1d
from strategies.bt_s1_1_by_time import Strategy1_1_by_time
from strategies.bt_s1_2_candle_tp import Strategy1_2_candle_tp
from strategies.bt_s1_3_buy_sell_limit import BuySellLimit
from strategies.bt_test_v1 import TestStrategy

start_time = tm.time()

cerebro = bt.Cerebro()

data_1d = bt.feeds.PandasData(dataname=df_1d)
data_5m = bt.feeds.PandasData(dataname=df_5m)

data_1d._name = "AAPL"
data_5m._name = "AAPL"

cerebro.adddata(data_5m)
cerebro.adddata(data_1d)

# cerebro.addstrategy(TestStrategy)

cerebro.broker.setcash(100000)
cerebro.addsizer(bt.sizers.FixedSize, stake=100)

print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
results = cerebro.run()
print('Final Portfolio Value: %.2f' % cerebro.broker.getvalue())


# calculate runtime
curr_time = tm.time()
runtime = round(curr_time - start_time, 2)
print(f"Runtime: {runtime} seconds")


cerebro.plot(
    style='bar',
    # style='candle',
    barup="g",
    bardown="r",
    # volume=False,
    fmt_x_ticks='%Y-%m-%d %H:%M',
    fmt_x_data='%Y-%m-%d %H:%M',
)