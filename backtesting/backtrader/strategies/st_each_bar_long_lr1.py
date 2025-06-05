import csv
import inspect
import operator
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
from indicators.in_linear_regression import RollingLinearRegression
from indicators.in_event_percentage import RollingEventPercentage
from indicators.in_diff_signals import DiffSignals


class StrategyEachBar_Long_LR1(StrategyBase):

    DESCRIPTION = 'This strategy is an enhanced version of the long linear regression strategy, incorporating multiple time-based linear regression analyses to pinpoint optimal long entry and exit points.'

    def __init__(self):
        super().__init__()
        

        start_time = datetime.combine(datetime.today(), time(16, 25))
        interval = timedelta(minutes=30)

        # Generate list of time objects
        times = [ (start_time + i * interval).time() for i in range(14) ]

        duration=timedelta(hours=6, minutes=30)

        

        # 5m
        
        # close.lr.slope (current direction)
        for i, t in enumerate(times): 

            self.lr = RollingLinearRegression(
                self.data_5m, 
                # time_start=time(hour=16, minute=25),
                time_start=t,
                duration=duration-i*interval,
            ) 
            self.lr.plotinfo.plotname = f"lr.slope({t}, {duration-i*interval})"



        

        


    def next(self):
        super().next()
        # self.log(f"lr.slope={self.lr.slope[0]}, lr.r2score={self.lr.r2score[0]}")

        # from this point, trading is valid
        
        # ----------------------------------------------
        return


        txt=""

        # trades by date
        current_time: datetime=self.data_5m.datetime.datetime()
        trades=self.get_trades_by_close_date(current_time)
        
        

        
        # place a cancel and close at market close
        market_close_minus_10m: time = (datetime.combine(current_time.date(), self.market_close) - timedelta(minutes=10)).time()
        if (current_time.time() >= market_close_minus_10m):
            self.cancel_all_orders_and_close_position()
            return

          
        # debug
        if 0:
            self.print_indicators()

        # percentage_upper_threshold=0.90
        # percentage_lower_threshold=0.10
        percentage_upper_threshold=1.0
        percentage_lower_threshold=0.0

        # long: enter
        if not self.position and\
            len(trades)<1 and\
            time(hour=17, minute=0) <= current_time.time() <= time(hour=22, minute=45) and\
            (self.lr.slope[0] > 0) and\
            (self.close_diff_sma200_percentage_positive.result[0] >= percentage_upper_threshold and\
                self.lr_slope_percentage_positive.result[0] >= percentage_upper_threshold):

                # self.place_buy_order_with_limit_and_stop()
                self.place_buy_order()

            
        # long: exit
        if 1:
            if self.position and\
                self.lr.slope[0] <= 0:
                # self.close_diff_sma200_percentage_positive.result[0]<=0.90 or\
                # self.lr_slope_percentage_positive.result[0]<=0.90:

                    self.place_close_order()
                    # self.place_sell_order()

    

        





        





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

                order.pair_order_ref=[order.ref-1] # previous order ref
                order.pair_type = "exit"
            

        elif order.status in [bt.Order.Canceled, bt.Order.Margin, bt.Order.Rejected]:
            # Order was not completed: reset the order tracker
            self.log(f"[{prefix}] Order {order.getordername()} Canceled/Margin/Rejected (order.ref={order.ref})")



    











    def place_close_order(self):

        prefix=inspect.currentframe().f_code.co_name

        # enter position (long)
        curr_price = self.data_5m.close[0]  # Current price
        main_order = self.close(
            data=self.data_5m, 
            # size=1, 
            # transmit=False
            # valid= #TODO: till market close
            # TODO: use exectype=bt.Order.Limit, for precise enter price

        )
        # self.log(f"[{prefix}] Placed CLOSE Market (order.ref={main_order.ref}): Size={main_order.size}, Price={curr_price}")
        self.log(f"[{prefix}] Placed CLOSE Market")

        # enter order
        # main_order.pair_order_ref=[limit_order.ref, stop_order.ref]
        # main_order.pair_type = "main"
    
    
    def place_buy_order(self):

        prefix=inspect.currentframe().f_code.co_name

        # enter position (long)
        curr_price = self.data_5m.close[0]  # Current price
        main_order = self.buy(
            data=self.data_5m, 
            size=1, 
            # transmit=False
            # valid= #TODO: till market close
            # TODO: use exectype=bt.Order.Limit, for precise enter price

        )
        self.log(f"[{prefix}] Placed BUY Market (order.ref={main_order.ref}): Size={main_order.size}, Price={curr_price}")

        # enter order
        main_order.pair_order_ref=[]
        main_order.pair_type = "main"


    def place_sell_order(self):

        prefix=inspect.currentframe().f_code.co_name

        # enter position (long)
        curr_price = self.data_5m.close[0]  # Current price
        main_order = self.sell(
            data=self.data_5m, 
            size=1, 
            # transmit=False
            # valid= #TODO: till market close
            # TODO: use exectype=bt.Order.Limit, for precise enter price

        )
        self.log(f"[{prefix}] Placed SELL Market (order.ref={main_order.ref}): Size={main_order.size}, Price={curr_price}")

        # enter order
        # main_order.pair_order_ref=[limit_order.ref, stop_order.ref]
        # main_order.pair_type = "main"



    def place_buy_order_with_limit_and_stop(self):

        prefix=inspect.currentframe().f_code.co_name

        # enter position (long)
        curr_price = self.data_5m.close[0]  # Current price
        main_order = self.buy(
            data=self.data_5m, 
            size=1, 
            transmit=False
            # valid= #TODO: till market close
            # TODO: use exectype=bt.Order.Limit, for precise enter price

        )
        self.log(f"[{prefix}] Placed BUY Market (order.ref={main_order.ref}): Size={main_order.size}, Price={curr_price}")


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
    


    
    def print_indicators(self):
        current_time: datetime=self.data_5m.datetime.datetime()
        trades=self.get_trades_by_close_date(current_time)

        print()
        print(f"[{current_time}]")
        print(f"    len(trades) = {len(trades)}")
        print(f"    self.position(size = {self.position.size}, price = {self.position.price})")
        print(f"    self.lr.slope[0] = {self.lr.slope[0]}")
        print(f"    self.lr_slope_percentage_positive.result[0] = {self.lr_slope_percentage_positive.result[0]}")
        print(f"    self.close_diff_sma200_percentage_positive.result[0] = {self.close_diff_sma200_percentage_positive.result[0]}")


