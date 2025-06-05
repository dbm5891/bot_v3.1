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
from indicators.in_gaussian_ma import GMA
from indicators.in_find_peaks import FindPeaks


class StrategyEachBar_Long_MA(StrategyBase):
    DESCRIPTION = "A strategy that enters long positions on each bar when both SMA and GMA indicate an upward trend, using take-profit targets for exits."
    params = dict(
        # take_profit_usd=0.01, # win rate 99%, exp: -1.396 (backtrader 5), 10/05/22
        take_profit_usd=2.0, # win rate 45%, exp: 19.357 (backtrader same), 10/05/22
        # take_profit_usd=99, # win rate 45%, exp: 19.357 (backtrader same), 10/05/22
        # stop_loss_usd=2, 
    )
    
    

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order
        

        # gma
        length=21
        std=6
        diff_period=4
        self.gma = GMA(self.data_5m.close, period=length, std=std)
        self.gma_diff = Diff(self.data_5m, input_indicator=self.gma, periods=diff_period)
        self.gma_diff_sign = ToSign(self.data_5m, input_indicator=self.gma_diff)
        self.gma_diff_sign_sequences = FindSequences(self.data_5m, input_indicator=self.gma_diff_sign)


        # sma
        length=200
        diff_period=10
        self.sma = bt.indicators.SMA(self.data_5m.close, period=length)
        self.sma_diff = Diff(self.data_5m, input_indicator=self.sma, periods=diff_period)
        self.sma_diff_sign = ToSign(self.data_5m, input_indicator=self.sma_diff)
        self.sma_diff_sign_sequences = FindSequences(self.data_5m, input_indicator=self.sma_diff_sign)


        



    def next(self):
        super().next()

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

        # TODO: verify not in short position (position.size>0): only long allowed here.
        # https://chatgpt.com/g/g-p-67a369d1919481918c42cbddd728434c-trading/c/67b3b66c-2804-800d-bff3-b1c54d8152f3

        # TODO: if trend up and time, continue, otherwise, cancel pending orders and close position.

      


        # allow place first order at 16:25, and last at 22:45
        market_open_minus_5m: time = (datetime.combine(current_time.date(), self.market_open) - timedelta(minutes=5)).time()
        market_close_minus_15m: time = (datetime.combine(current_time.date(), self.market_close) - timedelta(minutes=15)).time()
        
        # TODO: instead time, check direction
        # we shall implement one strategy for long, and one for short with direction.
        # place a cancel and close at market close
        market_close_minus_10m: time = (datetime.combine(current_time.date(), self.market_close) - timedelta(minutes=10)).time()
        if (current_time.time() >= market_close_minus_10m):
            
            self.cancel_all_orders_and_close_position()

        # direction is not long
        elif (self.gma_diff_sign[0] != 1) or (self.sma_diff_sign[0] != 1):
            self.cancel_all_orders_and_close_position()

          
        # gma and sma are up
        elif (self.gma_diff_sign[0] == 1) and (self.sma_diff_sign[0] == 1) and\
              (current_time.time() >= market_open_minus_5m) and (current_time.time() <= market_close_minus_15m):
            
            # enter position (long)
            self.order = self.buy(data=self.data_5m, size=1)        

            txt+=f"[{prefix}] Placed BUY Market (order.ref={self.order.ref}): Size={self.order.size}"
            

        
        
        
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
                self.log(f"[{prefix}] BUY EXECUTED (order.ref={order.ref}): Size={order.executed.size}, Entry Price={order.executed.price}")


                # Calculate the take profit price
                take_profit_price = order.executed.price + self.params.take_profit_usd
                
                # Place a take profit sell order (above current price)
                sell_order = self.sell(
                    data=self.data_5m,
                    size=order.executed.size, 
                    # size=1,
                    exectype=bt.Order.Limit, 
                    price=take_profit_price
                )
                self.log(f"[{prefix}] Placed SELL LIMIT (order.ref={sell_order.ref}): Size={order.executed.size}, Price={take_profit_price}")

                # enter order
                order.pair_order_ref=sell_order.ref
                order.pair_type = "enter"
                # self.orders.append(order)
                
                # exit order
                sell_order.pair_order_ref=order.ref
                sell_order.pair_type = "exit"
                # self.orders.append(sell_order)

                # txt=f"[EXIT] [order.ref={self.order.ref} placed: SELL]"
                # self.log(txt)
                
            elif order.issell():
                # self.log(f"SELL executed")
                self.log(f"[{prefix}] SELL EXECUTED: Size={order.executed.size}, Exit Price={order.executed.price}, PnL={order.executed.pnl:.2f}")

            
            self.order = None # reset order tracking

        elif order.status in [bt.Order.Canceled, bt.Order.Margin, bt.Order.Rejected]:
            # Order was not completed: reset the order tracker
            self.log(f"[{prefix}] Order Canceled/Margin/Rejected")
            self.order = None



    

