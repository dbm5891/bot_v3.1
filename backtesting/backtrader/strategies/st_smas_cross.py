import csv
import backtrader as bt
from datetime import time

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from st_base import StrategyBase
from indicators.in_ema import EMA
from indicators.in_diff import Diff
from indicators.in_to_sign import ToSign


class StrategySMAsCross(StrategyBase):
    
    DESCRIPTION = 'A classic trend-following strategy that generates buy and sell signals based on the crossover of two Simple Moving Averages (SMAs) with different periods.'
    
    # not profitable. 
    # period: (5/22 to 7/23)
    # strategies: ['StrategySMAsCross']
    # Final Portfolio Value ($): 100000 -> 99414 (PnL: -586)
    

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order

        params = (
            ('short_period', 21),
            ('long_period', 200),
        )

        # Define simple moving averages (SMAs)
        self.sma_short = bt.indicators.SMA(self.data_5m.close, period=21)
        self.sma_long = bt.indicators.SMA(self.data_5m.close, period=200)

        # Track crossover signals
        self.crossover = bt.indicators.CrossOver(self.sma_short, self.sma_long)
        




    def next(self):
        super().next()

        self.close_positions_market_close()
        if not self.allow_trade():
            return
        
        # from this point, trading is valid
        
        # ----------------------------------------------
    

       
        txt=""

        # enter position
        if not self.position:

            if self.crossover>0:
                self.order = self.buy(data=self.data_5m)
                txt+=f" [ENTER] [order.ref={self.order.ref} placed: BUY]"

            elif self.crossover<0:
                self.order = self.sell(data=self.data_5m)
                txt+=f" [ENTER] [order.ref={self.order.ref} placed: SELL]"

            self.log(f"{self.crossover} {txt}")


        # exit position
        else:
            
            # can't place new order, if others are pending
            if self.order:
                return
            
            # in a long position
            if self.position.size>0:

                if self.crossover<0:
                    self.order = self.close(data=self.data_5m)
                    txt+=f" [EXIT] [order.ref={self.order.ref} placed: CLOSE]"
                    self.log(f"{self.crossover} {txt}")

            # in a short position
            else:

                if self.crossover>0:
                    self.order = self.close(data=self.data_5m)
                    txt+=f" [EXIT] [order.ref={self.order.ref} placed: CLOSE]"
                    self.log(f"{self.crossover} {txt}")








        






    def notify_order(self, order):
        super().notify_order(order)

        if order.status in [bt.Order.Submitted, bt.Order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        elif order.status in [bt.Order.Completed]:
            if order.isbuy():
                self.log(f"BUY executed")
                
            elif order.issell():
                self.log(f"SELL executed")
            
            self.order = None # reset order tracking

        elif order.status in [bt.Order.Canceled, bt.Order.Margin, bt.Order.Rejected]:
            # Order was not completed: reset the order tracker
            self.log("Order Canceled/Margin/Rejected")
            self.order = None



    

