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
from indicators.in_diff_plot import DiffPlot
from indicators.in_diff import Diff
from indicators.in_to_sign import ToSign
from indicators.in_find_sequences import FindSequences
from indicators.in_gaussian_ma import GMA


class StrategySMAsDiff(StrategyBase):
    

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order

        # self.atr = bt.indicators.ATR(self.data_5m, period=5) # TODO?

        self.lengths_diffs=[
            (21, 1), 
            # (55, 3), 
            # (100, 5),
            (200, 10),
        ]

        # Create a dictionary to store MA indicators by their period
        self.smas = {} # Moving Averages 
        self.smas_diff = {} # Moving Averages Diff
        
        for (length, diff_period) in self.lengths_diffs:

            # compare moving averages
            if 0:
                gma = GMA(self.data_5m.close, period=length, std=6) # smoothest
                wma = bt.indicators.WeightedMovingAverage(self.data_5m.close, period=length) # smoother than SMA, but less than GMA
                ema = EMA(self.data_5m.close, period=length) # custom ema
                bt_ema = bt.indicators.EMA(self.data_5m.close, period=length)
            
            sma = bt.indicators.SMA(self.data_5m.close, period=length)
            self.smas[length] = sma

            sma_diff = Diff(self.data_5m, input_indicator=sma, periods=diff_period)
            # ma_diff_plot = DiffPlot(self.data_5m, input_indicator=ma_diff, threshold=0.0)
            self.smas_diff[length] = sma_diff
            
            # self.mas_diff[length].plotinfo.plotname = f"ma({length}).diff({diff_period})"

            # to sign
            # ma_diff_sign = ToSign(input_data=self.data_5m.close)
        
            sma_diff_tosign = ToSign(self.data_5m, input_indicator=sma_diff)
            sma_diff_tosign_find_sequences = FindSequences(self.data_5m, input_indicator=sma_diff_tosign)

        
        




    def next(self):
        super().next()

        self.close_positions_market_close()
        if not self.allow_trade():
            return
        
        # from this point, trading is valid
        
        # ----------------------------------------------
    

        diffs=[]
        for length, ma_diff in self.smas_diff.items():
            ma=self.smas[length]
            # diffs.append(f"ma({length})={ma[0]}: diff({ma_diff.params.periods}): {ma_diff[0]}")
            diffs.append(ma_diff[0])

        txt=""

        # enter position
        if not self.position:

            # diff threshold
            # if abs(self.mas_diff[200][0]) < 0.05:
            #     self.log(f"diff below threshold: {self.mas_diff[200][0]}")
            #     return



            if all(d>0 for d in diffs):
                txt=" > 0"

                self.order = self.buy(data=self.data_5m)
                txt+=f" [ENTER] [order.ref={self.order.ref} placed: BUY]"

            elif all(d<0 for d in diffs):
                txt=" < 0"

                self.order = self.sell(data=self.data_5m)
                txt+=f" [ENTER] [order.ref={self.order.ref} placed: SELL]"

            self.log(f"{diffs} {txt}")


        # exit position
        else:
            
            # can't place new order, if others are pending
            if self.order:
                return
            
            # in a long position
            if self.position.size>0:

                if not all(d>0 for d in diffs):
                    self.order = self.close(data=self.data_5m)
                    txt+=f" [EXIT] [order.ref={self.order.ref} placed: CLOSE]"
                    self.log(f"not aligned up: {txt}")

            # in a short position
            else:

                if not all(d<0 for d in diffs):
                    self.order = self.close(data=self.data_5m)
                    txt+=f" [EXIT] [order.ref={self.order.ref} placed: CLOSE]"
                    self.log(f"not aligned down: {txt}")








        






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



    

