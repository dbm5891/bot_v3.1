import backtrader as bt
from datetime import time

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from st_base import StrategyBase
from indicators.in_ema import EMA
from indicators.in_ohlc import OHLC4
from indicators.in_pivot_point import PivotPoint
from indicators.in_find_peaks import FindPeaks
from indicators.in_rolling_daily_candle import RollingDailyCandle

class StrategyTest(StrategyBase):

    
    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order

        period=200
        self.sma = bt.indicators.SMA(self.data_5m.close, period=period)
        # self.ema = bt.indicators.EMA(self.data_5m.close, period=period)

        # custom indicators:
        
        # self.custom_ema = EMA(self.data_5m.close, period=period)
        # self.custom_ema.plotinfo.plotname = f"custom ema({period})"

        # self.ohlc_avg = OHLC4(self.data_5m)
        # self.find_peaks = FindPeaks(self.data_5m)

        # 1D
        # self.pivot = PivotPoint(self.data_1d)

        self.candle_1d = RollingDailyCandle(self.data_5m)



    def next(self):
        super().next()
        # self.close_positions_market_close()
        
        # if not self.allow_trade():
        #     return
        
        # from this point, trading is valid
        
        # ----------------------------------------------

        # self.log(self.custom_ema[0])
        self.log(self.sma[0])
        
        





    def notify_order(self, order):
        super().notify_order(order)

        if order.status in [bt.Order.Submitted, bt.Order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        elif order.status in [bt.Order.Completed]:
            if order.isbuy():
                self.log(f"buy executed")
                
            elif order.issell():
                self.log(f"sell executed")

        elif order.status in [bt.Order.Canceled, bt.Order.Margin, bt.Order.Rejected]:
            # Order was not completed: reset the order tracker
            self.log("Order Canceled/Margin/Rejected")
            self.order = None



    

