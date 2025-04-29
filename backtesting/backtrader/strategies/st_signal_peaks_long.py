import csv
import inspect
import backtrader as bt
from datetime import datetime, time, timedelta

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\functional"
sys.path.append(curr_path)
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from functional.util import is_sorted
from st_base import StrategyBase
from indicators.in_ema import EMA
from indicators.in_diff_plot import DiffPlot
from indicators.in_diff import Diff
from indicators.in_to_sign import ToSign
from indicators.in_find_sequences import FindSequences
from indicators.in_gaussian_ma import GMA
from indicators.in_find_peaks import FindPeaks
from indicators.in_linear_regression import RollingLinearRegression

# enter long position at signal valley, exit at peak

class Strategy_Signal_Peaks_Long(StrategyBase):

    params = dict(
        take_profit_usd=0.20,
        # stop_loss_usd=2, 
    )
    

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order



        # ---===---

        # 5m
        self.lr = RollingLinearRegression(self.data_5m) # close.lr.slope
        self.lr_sma = bt.indicators.SMA(self.lr, period=5) # close.lr.slope.sma(5)
        self.lr_sma_diff = Diff(self.data_5m, input_indicator=self.lr_sma, periods=1) # close.lr.slope.sma(5).diff(1)

        prominence_left_base=0.03

        # close.lr.slope.sma(5).peaks(0.0)
        self.find_peaks = FindPeaks(
            self.data_5m,
            signal_indicator=self.lr_sma,
            # window_size=None,
            window_size=200,
            prominence_left_base=prominence_left_base,
        )

        # close.lr.slope.sma(5).valleys(0.0) 
        self.find_valleys = FindPeaks(
            self.data_5m, 
            signal_indicator=self.lr_sma, 
            # window_size=None,
            window_size=200,
            prominence_left_base=prominence_left_base, 
            find_valleys=True, 
            plot_color="cyan",
        )
        

        








    def next(self):
        super().next()
        # self.log(f"lr.slope={self.lr.slope[0]}, lr.r2score={self.lr.r2score[0]}")

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
        if len(trades)>0:
            return

        # allow place first order at 16:25, and last at 22:45
        market_open_minus_5m: time = (datetime.combine(current_time.date(), self.market_open) - timedelta(minutes=5)).time()
        market_close_minus_15m: time = (datetime.combine(current_time.date(), self.market_close) - timedelta(minutes=15)).time()
        
        # place a cancel and close at market close
        market_close_minus_10m: time = (datetime.combine(current_time.date(), self.market_close) - timedelta(minutes=10)).time()
        if (current_time.time() >= market_close_minus_10m):
            
            self.cancel_all_orders_and_close_position()   

          
        # one position at 16:30!!!!!!!!
        elif (current_time.time() >= market_open_minus_5m) and (current_time.time() <= market_close_minus_15m):
            
            # if self.data_5m.close[0] > self.pivot.pivot[0]:
            
            # if self.lr_sma_diff.diff[0] > 0:

            if (not self.position) and (self.find_valleys.peak_detected[0]):
                self.log(f"---------------------------------------------------------> valley detected")

                # enter position (long)
                self.order = self.buy(data=self.data_5m, size=1)        

                txt+=f"[{prefix}] Placed BUY Market (order.ref={self.order.ref}): Size={self.order.size}"
            

        
        
        
            self.log(f"{txt}")
        
    









    def next_2(self):
        super().next()

        self.close_positions_market_close()
        if not self.allow_trade():
            return
        
        # from this point, trading is valid
        
        # ----------------------------------------------

        # get slopes values
        diffs=[self.gma_diff[0], self.sma_diff[0]]

        txt=""

        if self.find_peaks.peak_detected[0]:
            self.log(f"---------------------------------------------------------> peak")


            # ===================================
            # enter position
            # ===================================
            if not self.position:

                # if all(d<0 for d in diffs):
                if 1:

                    # enter a short position
                    self.order = self.sell(data=self.data_5m)
                    txt=f"[ENTER] [order.ref={self.order.ref} placed: SELL]"
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
                    txt=f"[EXIT] [order.ref={self.order.ref} placed: CLOSE]"
                    txt+=f" (peak detected)"
                    self.log(f"{txt}")

                    
                    # enter a short position
                    # if all(d<0 for d in diffs):
                    if 1:

                        self.order = self.sell(data=self.data_5m)
                        txt=f"[ENTER] [order.ref={self.order.ref} placed: SELL]"
                        txt+=f" (peak detected)"
                        self.log(f"{txt}")






        if self.find_valleys.peak_detected[0]:
            self.log(f"---------------------------------------------------------> valley")


            # ===================================
            # enter position
            # ===================================
            if not self.position:

                # if all(d>0 for d in diffs):
                if 1:

                    # enter a long position
                    self.order = self.buy(data=self.data_5m)
                    txt=f"[ENTER] [order.ref={self.order.ref} placed: BUY]"
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
                    txt=f"[EXIT] [order.ref={self.order.ref} placed: CLOSE]"
                    txt+=f" (valley detected)"
                    self.log(f"{txt}")

                    # if all(d>0 for d in diffs):
                    if 1:
                        # enter a long position
                        self.order = self.buy(data=self.data_5m)
                        txt=f"[ENTER] [order.ref={self.order.ref} placed: BUY]"
                        txt+=f" (valley detected)"
                        self.log(f"{txt}")






    # same as next() above
    def next_1(self):
        super().next()

        self.close_positions_market_close()
        if not self.allow_trade():
            return
        
        # from this point, trading is valid
        
        # ----------------------------------------------

        txt=""

        # enter position
        if not self.position:

            # enter a long position
            if self.find_valleys.peak_detected[0]:

                self.order = self.buy(data=self.data_5m)
                txt+=f"[ENTER] [order.ref={self.order.ref} placed: BUY]"
                txt+=f" (valley detected)"

            # enter a short position
            elif self.find_peaks.peak_detected[0]:

                self.order = self.sell(data=self.data_5m)
                txt+=f"[ENTER] [order.ref={self.order.ref} placed: SELL]"
                txt+=f" (peak detected)"

            self.log(f"{txt}")


        # exit position
        else:
            
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






        






    def notify_order_1(self, order):
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
                pair_order = self.sell(
                    data=self.data_5m,
                    size=order.executed.size, 
                    # size=1,
                    exectype=bt.Order.Limit, 
                    price=take_profit_price
                )
                self.log(f"[{prefix}] Placed SELL LIMIT (order.ref={pair_order.ref}): Size={order.executed.size}, Price={take_profit_price}")

                # enter order
                order.pair_order_ref=pair_order.ref
                order.pair_type = "enter"
                # self.orders.append(order)
                
                # exit order
                pair_order.pair_order_ref=order.ref
                pair_order.pair_type = "exit"
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



    
