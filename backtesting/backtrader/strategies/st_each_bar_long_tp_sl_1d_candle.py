import csv
import inspect
import backtrader as bt
from datetime import datetime, time, timedelta

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from st_base import StrategyBase
from indicators.in_ema import EMA
from indicators.in_diff_plot import DiffPlot
from indicators.in_diff import Diff
from indicators.in_to_sign import ToSign
from indicators.in_find_sequences import FindSequences
# from indicators.in_gaussian_ma import GMA
from indicators.in_find_peaks import FindPeaks
from indicators.in_pivot_point import PivotPoint
from indicators.in_rolling_daily_candle import RollingDailyCandle


class StrategyEachBar_Long_tp_sl_1d_candle(StrategyBase):


    def __init__(self):
        super().__init__()
        



        # sma
        length=200
        diff_period=10
        self.sma200 = bt.indicators.SMA(self.data_5m.close, period=200)
        self.sma200_diff = Diff(self.data_5m, input_indicator=self.sma200, periods=10)
        # self.sma_diff_sign = ToSign(self.data_5m, input_indicator=self.sma_diff)
        # self.sma_diff_sign_sequences = FindSequences(self.data_5m, input_indicator=self.sma_diff_sign)

        self.sma20 = bt.indicators.SMA(self.data_5m.close, period=20)
        self.sma20_diff = Diff(self.data_5m, input_indicator=self.sma200, periods=1)


        # 1D
        if 0:
            if self.data_1d:
                self.pivot = PivotPoint(self.data_1d)
            else:
                raise ValueError("data_1d is required for PivotPoint indicator")
        

        self.candle_1d = RollingDailyCandle(self.data_5m)



    def next(self):
        super().next()
        # return

        # self.close_positions_market_close()
        # if not self.allow_trade():
        #     return
        
        # from this point, trading is valid
        
        # ----------------------------------------------

        prefix=inspect.currentframe().f_code.co_name

        txt=""

        # trades by date
        current_time: datetime=self.data_5m.datetime.datetime()
        trades=self.get_trades_by_close_date(current_time)

        # allow place first order at 16:25, and last at 22:45
        market_open_minus_5m: time = (datetime.combine(current_time.date(), self.market_open) - timedelta(minutes=5)).time()
        market_close_minus_15m: time = (datetime.combine(current_time.date(), self.market_close) - timedelta(minutes=15)).time()
        
        # place a cancel and close at market close
        market_close_minus_10m: time = (datetime.combine(current_time.date(), self.market_close) - timedelta(minutes=10)).time()
        if (current_time.time() >= market_close_minus_10m):
            
            self.cancel_all_orders_and_close_position()   

          
        # one position at 16:30!!!!!!!!
        # elif (current_time.time() == market_open_minus_5m) and (current_time.time() <= market_close_minus_15m):
        elif current_time.time() == time(hour=17, minute=25):
            
            
            # if (self.data_5m.close[0] > self.pivot.pivot[0]) and\
            #     (self.sma200_diff[0] > 0):
                # (self.sma20[0] > self.sma200[0]):

            if 1:
            
            
                # enter position (long)
                curr_price = self.data_5m.close[0]  # Current price
                main_order = self.buy(
                    data=self.data_5m, 
                    size=1, 
                    transmit=False
                    # valid= #TODO: till market close
                    # TODO: use exectype=bt.Order.Limit, for precise enter price

                )
                txt+=f"[{prefix}] Placed BUY Market (order.ref={main_order.ref}): Size={main_order.size}, Price={curr_price}"


                # Place a take profit sell order (above current price) - limit order
                take_profit_price = curr_price + self.params.take_profit_usd
                limit_order = self.sell(
                    data=self.data_5m,
                    size=main_order.size, 
                    exectype=bt.Order.Limit, 
                    price=take_profit_price,
                    transmit=False,
                    parent=main_order
                )
                self.log(f"[{prefix}] Placed SELL LIMIT (order.ref={limit_order.ref}): Size={main_order.executed.size}, Price={take_profit_price}")
                


                # Place a stop loss sell order (below current price) - stop order
                stop_loss_price = curr_price - self.params.stop_loss_usd
                stop_order = self.sell(
                    data=self.data_5m,
                    size=main_order.size, 
                    exectype=bt.Order.Stop, 
                    price=stop_loss_price,
                    transmit=True,
                    parent=main_order
                )
                self.log(f"[{prefix}] Placed SELL STOP (order.ref={stop_order.ref}): Size={main_order.executed.size}, Price={stop_loss_price}")

                # enter order
                main_order.pair_order_ref=[limit_order.ref, stop_order.ref]
                main_order.pair_type = "main"
                
                # exit orders:
                limit_order.pair_order_ref=main_order.ref
                limit_order.pair_type = "limit"
                
                stop_order.pair_order_ref=main_order.ref
                stop_order.pair_type = "stop"
            



                

            
            
            
                self.log(f"{txt}")
            
    

        
        
      

        











        






    def notify_order(self, order):
        super().notify_order(order)
        
        txt=f""
        prefix=inspect.currentframe().f_code.co_name

        if order.status in [bt.Order.Submitted, bt.Order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        elif order.status in [bt.Order.Completed]:
            
            if order.isbuy():

                # self.log(f"BUY executed")
                self.log(f"[{prefix}] BUY {order.getordername()} EXECUTED (order.ref={order.ref}): Size={order.executed.size}, Entry Price={order.executed.price}")

                
            elif order.issell():
                # self.log(f"SELL executed")
                self.log(f"[{prefix}] SELL {order.getordername()} EXECUTED: Size={order.executed.size}, Exit Price={order.executed.price}, PnL={order.executed.pnl:.2f}")

            
            main_order = None # reset order tracking

        elif order.status in [bt.Order.Canceled, bt.Order.Margin, bt.Order.Rejected]:
            # Order was not completed: reset the order tracker
            self.log(f"[{prefix}] Order {order.getordername()} Canceled/Margin/Rejected (order.ref={order.ref})")
            main_order = None



    

