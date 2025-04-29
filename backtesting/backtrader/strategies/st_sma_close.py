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
# from indicators.in_gaussian_ma import GMA
from indicators.in_find_peaks import FindPeaks


class StrategySMAClose(StrategyBase):
    

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order

        # sma
        length=200
        diff_period=10
        self.sma = bt.indicators.SMA(self.data_5m.close, period=length)
        self.sma_diff = Diff(self.data_5m, input_indicator=self.sma, periods=diff_period)
        # self.sma_diff_sign = ToSign(self.data_5m, input_indicator=self.sma_diff)
        # self.sma_diff_sign_sequences = FindSequences(self.data_5m, input_indicator=self.sma_diff_sign)


        prominence_left_base=1.0

        self.find_peaks = FindPeaks(
            self.data_5m,
            signal_indicator=self.data_5m,
            # window_size=None, # bad memory performance
            window_size=200,
            prominence_left_base=prominence_left_base,
        )

        self.find_valleys = FindPeaks(
            self.data_5m, 
            signal_indicator=self.data_5m, 
            # window_size=None,
            window_size=200,
            prominence_left_base=prominence_left_base, 
            find_valleys=True, 
            plot_color="cyan",
        )
       



    def next(self):
        super().next()

        self.close_positions_market_close()
        if not self.allow_trade():
            return
        
        # from this point, trading is valid
        
        # ----------------------------------------------
    

        txt=""

        # trades by date
        current_time: time=self.data_5m.datetime.datetime()
        trades=self.get_trades_by_close_date(current_time)

        # enter position
        if not self.position:

            # enter a long position
            if self.sma_diff[0]>0 and self.find_valleys.peak_detected[0]:

                self.order = self.buy(data=self.data_5m)
                txt+=f"[ENTER] [order.ref={self.order.ref} placed: BUY]"
                txt+=f" (sma_diff>0 and valley detected)"

            # enter a short position
            elif self.sma_diff[0]<0 and self.find_peaks.peak_detected[0]:

                self.order = self.sell(data=self.data_5m)
                txt+=f"[ENTER] [order.ref={self.order.ref} placed: SELL]"
                txt+=f" (sma_diff<0 and peak detected)"

            

        # exit position
        else:
            
            # don't close (will close at day end)
            # return
            
            # can't place new order, if others are pending
            if self.order:
                return
            
            # in a long position
            if self.position.size>0:

                if self.find_peaks.peak_detected[0]:
                    self.order = self.close(data=self.data_5m)
                    txt+=f"[EXIT] [order.ref={self.order.ref} placed: CLOSE]"
                    txt+=f" (peak detected)"

            # in a short position
            else:

                if self.find_valleys.peak_detected[0]:
                    self.order = self.close(data=self.data_5m)
                    txt+=f"[EXIT] [order.ref={self.order.ref} placed: CLOSE]"
                    txt+=f" (valley detected)"

    
    
        self.log(f"{txt}")









        






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



    

