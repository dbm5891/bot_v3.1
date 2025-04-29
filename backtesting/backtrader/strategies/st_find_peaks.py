import backtrader as bt
from datetime import time

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from st_base import StrategyBase
from indicators.in_find_peaks import FindPeaks
from indicators.in_pivot_point import PivotPoint


class StrategyFindPeaks(StrategyBase):
    

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order

        # self.zlma = bt.indicators.ZeroLagIndicator(self.data_5m, period=20)
        period_primary=20
        period_secondary=5

        self.zlema = bt.indicators.ZeroLagExponentialMovingAverage(self.data_5m, period=period_primary) # for plot purpose only
        self.zlema.plotinfo.plotname = f"zlema({period_primary})"
        
        self.zlema_zlema = bt.indicators.ZeroLagExponentialMovingAverage(self.zlema, period=period_secondary) # for plot purpose only
        self.zlema_zlema.plotinfo.plotname = f"zlema({period_primary}).zlema({period_secondary})"
        
        # self.sma = bt.indicators.SMA(self.data_5m.close, period=20)
        # self.sma.plotinfo.plotname = "sma(20)"
        
        # self.sma_zlema = bt.indicators.SMA(self.zlema, period=20)
        # self.sma_zlema.plotinfo.plotname = "sma(20).zlema(20)"

        # self.find_peaks = FindPeaks(self.data_5m, period=period_primary)
        
        prominence_left_base=1

        self.find_peaks = FindPeaks(
            self.data_5m,
            signal_indicator=self.zlema_zlema,
            # signal_indicator=self.sma,
            window_size=None,
            prominence_left_base=prominence_left_base,
        )

        self.find_valleys = FindPeaks(
            self.data_5m, 
            signal_indicator=self.zlema_zlema, 
            window_size=None, 
            prominence_left_base=prominence_left_base, 
            find_valleys=True, 
            plot_color="cyan",
        )


        # 1D
        self.pivot = PivotPoint(self.data_1d)





    def next(self):
        super().next()
        self.close_positions_market_close()
        
        if not self.allow_trade():
            return
        
        # from this point, trading is valid
        
        # ----------------------------------------------

        txt=""

        if self.find_peaks.peak_detected[0]:
            self.log(f"---------------------------------------------------------> peak")


            # ===================================
            # enter position
            # ===================================
            if not self.position:

                # enter a short position
                self.order = self.sell(data=self.data_5m)
                txt+=f"[ENTER] [order.ref={self.order.ref} placed: SELL]"
                txt+=f" (peak detected)"
                self.log(f"{txt}")


            # ===================================
            # exit position
            # ===================================
            else:

                # can't place new order, if others are pending
                if self.order:
                    return
                
                

                # in a long position
                if self.position.size>0:

                    self.order = self.close(data=self.data_5m)
                    txt+=f"[EXIT] [order.ref={self.order.ref} placed: CLOSE]"
                    txt+=f" (peak detected)"
                    self.log(f"{txt}")






        if self.find_valleys.peak_detected[0]:
            self.log(f"---------------------------------------------------------> valley")


            # ===================================
            # enter position
            # ===================================
            if not self.position:

                # enter a long position
                self.order = self.buy(data=self.data_5m)
                txt+=f"[ENTER] [order.ref={self.order.ref} placed: BUY]"
                txt+=f" (valley detected)"

                self.log(f"{txt}")


            # ===================================
            # exit position
            # ===================================
            else:
                
                # can't place new order, if others are pending
                if self.order:
                    return
                
               

                # exit a short position
                elif self.position.size<0:

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
                self.log(f"buy executed")
                
            elif order.issell():
                self.log(f"sell executed")

        elif order.status in [bt.Order.Canceled, bt.Order.Margin, bt.Order.Rejected]:
            # Order was not completed: reset the order tracker
            self.log("Order Canceled/Margin/Rejected")
            self.order = None



    

