from datetime import datetime
import inspect
import time as tm
import backtrader as bt
from pprint import pprint

from matplotlib import pyplot as plt
import numpy as np
import pandas as pd

# from dfs_set_ta_indicators import df_5m, df_1d

from dfs_set_ta_indicators_5m import df_5m,\
    indicator_0, lengths_diffs,\
    key_signal_peaks, key_signal_valleys,\
    signal_column, key_signal_column_diff

from dfs_set_ta_indicators_1D import df_1d

from functional.dataframes import print_df_index_range
from functional.files import list_tuple_to_csv

from strategies.bt_s1_1_by_time import Strategy1_1_by_time
from strategies.bt_s1_2_candle_tp import Strategy1_2_candle_tp
from strategies.bt_s1_3_buy_sell_limit import BuySellLimit

from strategies.st_test import StrategyTest
from strategies.st_time import Strategy18to19
from strategies.st_buy_sell_market import StrategyBuySellMarket
from strategies.st_find_peaks import StrategyFindPeaks
from strategies.st_smas_diff import StrategySMAsDiff
from strategies.st_smas_cross import StrategySMAsCross
from strategies.st_sma_gma_diff import StrategySMA_GMA_Diff
from strategies.st_gma_peaks import Strategy_GMA_Peaks
from strategies.st_sma_close import StrategySMAClose
from strategies.st_110 import Strategy110
from strategies.st_each_bar_long import StrategyEachBar_Long
from strategies.st_each_bar_long_tp_sl import StrategyEachBar_Long_tp_sl
from strategies.st_each_bar_long_tp_sl_pivot_sma import StrategyEachBar_Long_tp_sl_pivot_sma
from strategies.st_each_bar_short_tp_sl_pivot_sma import StrategyEachBar_Short_tp_sl_pivot_sma
from strategies.st_each_bar_long_pivot import StrategyEachBar_Long_Pivot
from strategies.st_each_bar_short import StrategyEachBar_Short
from strategies.st_each_bar_short_pivot import StrategyEachBar_Short_Pivot
from strategies.st_each_bar_sma import StrategyEachBar_SMA
from strategies.st_each_bar_sma_mo import StrategyEachBar_SMA_Market_Open
from strategies.st_each_bar_long_ma import StrategyEachBar_Long_MA
from strategies.st_each_bar_long_lr import StrategyEachBar_Long_LR
from strategies.st_signal_peaks_long import Strategy_Signal_Peaks_Long



def cerebro_wrap(take_profit_usd=0.50, stop_loss_usd=10):

    start_time = tm.time()

    cerebro = bt.Cerebro()


    data_5m = bt.feeds.PandasData(
        dataname=df_5m, 
        timeframe=bt.TimeFrame.Minutes,  # Set to minutes
        compression=5,                   # Set the compression to 5 for 5-minute bars
    )
    data_5m._name = "AAPL"
    cerebro.adddata(data_5m)

    if 1:
        data_1d = bt.feeds.PandasData(dataname=df_1d)
        data_1d._name = "AAPL"
        cerebro.adddata(data_1d)

    # cerebro.addstrategy(StrategyTest)
    # cerebro.addstrategy(Strategy18to19)
    # cerebro.addstrategy(StrategyFindPeaks)
    # cerebro.addstrategy(StrategyBuySellMarket)
    # cerebro.addstrategy(StrategySMAsCross)
    # cerebro.addstrategy(StrategySMAsDiff)
    # cerebro.addstrategy(StrategySMA_GMA_Diff) # Final Portfolio Value ($): 100000 -> 132554 (trades: 797, PnL: 32554, average: 41) AAPL, [2022-05-09] to [2023-07-13] (429 days, 797 trades, $ 32554.0)
    # cerebro.addstrategy(Strategy_GMA_Peaks) # Final Portfolio Value ($): 100000 -> 134094 (trades: 1016, PnL: 34094, average: 34)
    # cerebro.addstrategy(StrategySMAClose) 
    # cerebro.addstrategy(Strategy110)

    # cerebro.addstrategy(StrategyEachBar_Long)
    # cerebro.addstrategy(StrategyEachBar_Long_tp_sl)
    # cerebro.addstrategy(StrategyEachBar_Long_tp_sl_pivot_sma, take_profit_usd=take_profit_usd, stop_loss_usd=stop_loss_usd)
    cerebro.addstrategy(StrategyEachBar_Short_tp_sl_pivot_sma, take_profit_usd=take_profit_usd, stop_loss_usd=stop_loss_usd)
    # cerebro.addstrategy(StrategyEachBar_Long_MA)
    # cerebro.addstrategy(StrategyEachBar_Long_Pivot)
    # cerebro.addstrategy(StrategyEachBar_Long_LR)
    # cerebro.addstrategy(Strategy_Signal_Peaks_Long)

    # cerebro.addstrategy(StrategyEachBar_Short)
    # cerebro.addstrategy(StrategyEachBar_Short_Pivot)
    # cerebro.addstrategy(StrategyEachBar_SMA)
    # cerebro.addstrategy(StrategyEachBar_SMA_Market_Open)


    # Add the TradeAnalyzer
    cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name="trade_analyzer")

    cash=100000.0
    cerebro.broker.setcash(cash)
    # cerebro.addsizer(bt.sizers.FixedSize, stake=500)

    print('Starting Portfolio Value: %.2f' % cerebro.broker.getvalue())
    # Run the strategy
    results = cerebro.run()

    strategies=[]
    for s in results:
        # strategies.append(s.__class__.__name__)
        strategies.append(f"{s.__class__.__name__}_[tp={s.params.take_profit_usd}_sl={s.params.stop_loss_usd}]")

    if not cerebro.runstrats[0][0].trades:
        print("no trades.")

    else:
        print("All trades:")

        for t in cerebro.runstrats[0][0].trades_info:
            print(t)
            # trade_data=(t.ref, t.pnl, t.open_datetime(), t.close_datetime(), t.history[0].event.size, t.history[0].event.price, t.history[1].event.price, t.history[1].event.price-t.history[0].event.price)
            # trade_data=(t.ref, t.pnl, f"{t.open_datetime()}", f"{t.close_datetime()}", t.history[0].event.size, t.history[0].event.price, t.history[1].event.price, t.history[1].event.price-t.history[0].event.price)
            # print(trade_data)

        # trades_info to csv
        if 0:
            header=[
                "method",
                "ref",
                "type",
                "status",
                "open",
                "close",
                "size",
                "open price",
                "close price",
                "diff price",
                "percentage",
                "pnl",
            ]
            path = f"backtesting/outputs"
            output_filename = f"{path}/{strategies[0]}_bt_trades.csv"
            list_tuple_to_csv(header=header, list_tuples=cerebro.runstrats[0][0].trades_info, output_filename=output_filename, append_timestamp=True)

            # trades by date
            # trades=cerebro.runstrats[0][0].get_trades_by_close_date(datetime(year=2023, month=5, day=4))

        


    # positions_info to csv
    if 0:
        header=[
            "method",
            "datetime",
            "size",
            "open_price",
            "adjbase_price",
            "percentage",
            "init_cost",
            "curr_cost",
            "curr_pnl",
        ]
        path = f"backtesting/outputs"
        output_filename = f"{path}/{strategies[0]}_positions.csv"
        list_tuple_to_csv(header=header, list_tuples=cerebro.runstrats[0][0].positions_info, output_filename=output_filename, append_timestamp=True)

    # orders to csv
    if 1:

        # print("buy/sell pairs:")
        # for buy_ref, sell_order in cerebro.runstrats[0][0].buy_sell_orders.items():
        #     print(f"buy({buy_ref}): sell({sell_order.ref})")

        orders_info: list[tuple] = [] # trade's info only, more readable
        orders: list[bt.Order] = cerebro.runstrats[0][0].orders
        for o in orders:
            o_info=(
                inspect.currentframe().f_code.co_name,
                o.ref,
                o.notify_dt,
                o.pair_type if hasattr(o, "pair_type") else None, # ['enter', 'exit']
                o.pair_order_ref if hasattr(o, "pair_order_ref") else None, # order's pair ref (id)
                f"{bt.num2date(o.executed.dt)}" if o.executed.dt else o.executed.dt,  # Convert to standard datetime
                o.ordtypename(),   # ['Buy', 'Sell']
                o.getstatusname(), # ['Created', 'Submitted', 'Accepted', 'Partial', 'Completed', 'Canceled', 'Expired', 'Margin', 'Rejected']
                o.size,
                o.executed.size, # executed.size related to o.size
                o.price, # the take profit price (limit price)
                o.executed.price,
                round(o.executed.value, 2),
                o.getordername(),  # ['Market', 'Close', 'Limit', 'Stop', 'StopLimit', 'StopTrail', 'StopTrailLimit', 'Historical']
            )
            print(o_info)
            orders_info.append(o_info)

        # to csv
        header=[
            "method",
            "ref",
            "notify_dt",
            "pair_type",
            "pair_order_ref",
            "executed_datetime",
            "order_type",
            "status",
            "size",
            "executed_size",
            "price",
            "executed_price",
            "executed_value",
            "exec_type",
        ]
        path = f"backtesting/outputs"
        output_filename = f"{path}/{strategies[0]}_orders.csv"
        list_tuple_to_csv(header=header, list_tuples=orders_info, output_filename=output_filename, append_timestamp=True)





        print()
        print_df_index_range(df_5m)
        print()
        

        # Access the TradeAnalyzer results
        trade_analyzer = results[0].analyzers.trade_analyzer.get_analysis()
        # print(trade_analyzer)


        # pprint(trade_analyzer)
        # keys=["total","pnl","won","lost","long","short"]
        keys=["total","pnl","won","lost"]
        # trades_stat = {k: trade_analyzer[k] for k in keys}
        
        trades_stat: dict = {}
        for k in keys:
            if k in trade_analyzer:
                trades_stat[k] = trade_analyzer[k]

        pprint(trades_stat)

        # for key in ["total","pnl","won","lost","long","short"]:
        #     print()
        # trades_stat=(trade_analyzer.pnl, trade_analyzer.total, trade_analyzer.won, trade_analyzer.lost)
        # print(trades_stat)

        



    print(f"strategies: {strategies}")
    txt=f'Final Portfolio Value ($): {cash} -> {round(cerebro.broker.getvalue(), 2)}'
    if cerebro.runstrats[0][0].trades:
        pnl=trade_analyzer["pnl"]["net"]["total"]
        pnl_average=trade_analyzer["pnl"]["net"]["average"]
        num_trades=trade_analyzer["total"]["total"]
        txt+=f' (trades: {num_trades}, PnL: {round(pnl, 2)}, average: {round(pnl_average, 2)})'
    print(txt)


    if 0:
        # print indicator values
        for i in range(len(results[0].lr.slope)):
            id=len(results[0].lr.slope)-i
            print(f"{results[0].lr.datas[0].datetime.datetime(-id)},{results[0].lr.slope[-id]}")
            # print(f"{results[0].lr.datas[0].datetime.datetime(-i)},{results[0].lr.slope[-i]}")

    # calculate runtime
    curr_time = tm.time()
    runtime = round(curr_time - start_time, 2)
    print(f"Runtime: {runtime} seconds")


    if 0:
        cerebro.plot(
            style='bar',
            # style='candle',
            barup="g",
            bardown="r",
            # volume=False,
            fmt_x_ticks='%Y-%m-%d %H:%M',
            fmt_x_data='%Y-%m-%d %H:%M',
        )

    return pnl_average




# main matrix
tps=np.arange(0, 5, 0.5)
sls=np.arange(0, 2, 0.5)

# Create a meshgrid
X, Y = np.meshgrid(tps, sls)

# Initialize Z values with zeros (or NaNs)
Z = np.zeros_like(X)


# Flatten the arrays and create a DataFrame
df = pd.DataFrame({'x': X.ravel(), 'y': Y.ravel(), 'value': np.nan})  # Initialize 'value' column with NaN

# Function to set value at a specific (x, y) coordinate
def set_value(df, x, y, new_value):
    index = df[(df['x'] == x) & (df['y'] == y)].index
    if not index.empty:
        df.loc[index, 'value'] = new_value
    else:
        print(f"Coordinate ({x}, {y}) not found in DataFrame")



for tp in tps:
    for sl in sls:
        print(f"tp={tp}, sl={sl}")
        avg_pnl = cerebro_wrap(take_profit_usd=tp, stop_loss_usd=sl)
        set_value(df, tp, sl, avg_pnl)
        print(avg_pnl)

        idx = (X == tp) & (Y == sl)
        Z[idx] = avg_pnl  # Set values at specified (x, y) positions

print(df)
print(Z)

ax = plt.axes(projection="3d")
ax.plot_surface(X,Y,Z, cmap="gist_rainbow")
ax.set_xlabel("tp")
ax.set_ylabel("sl")
ax.set_zlabel("avg expectancy (avg pnl)")
plt.show()
