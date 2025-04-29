import csv
import inspect
import backtrader as bt
from datetime import datetime, time

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


class StrategyEachBar_SMA(StrategyBase):

    params = dict(
        take_profit_usd=2.00, 
        # stop_loss_usd=0.50,
    )
    
    

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order



        
        # sma
        length=200
        diff_period=10
        self.sma = bt.indicators.SMA(self.data_5m.close, period=length)
        self.sma_diff = Diff(self.data_5m, input_indicator=self.sma, periods=diff_period)
        self.sma_diff_sign = ToSign(self.data_5m, input_indicator=self.sma_diff) # general dirction 
        # self.sma_diff_sign_sequences = FindSequences(self.data_5m, input_indicator=self.sma_diff_sign)


        



    def next(self):
        super().next()

        self.close_positions_market_close()
        if not self.allow_trade():
            return
        
        # from this point, trading is valid
        
        # ----------------------------------------------

        prefix=inspect.currentframe().f_code.co_name

        txt=""

        # trades by date
        current_time: datetime=self.data_5m.datetime.datetime()
        trades=self.get_trades_by_close_date(current_time)




        # close position when direction is changed

        self.log(f"sma(200) direction: {self.sma_diff_sign[0]}")

        if self.sma_diff_sign[-1] != self.sma_diff_sign[0]:
            self.log(f"direction change: {self.sma_diff_sign[-1]} to {self.sma_diff_sign[0]} <---- need to close open position")
            # close long
            # close short

            if self.position:
                self.cancel_all_orders()

                self.order = self.close(data=self.data_5m)
                
                self.order.pair_order_ref = None # no pair for this order
                self.order.pair_type = "direction change"

                self.log(f"[EXIT] [order.ref={self.order.ref} placed: CLOSE] (direction change)")
                self.orders.append(self.order)







        # direction set by sma_diff_sign: (1: long, -1: short)
        # TODO: check if current direction matches previous direction
        # if not: we should close open position.
        if self.sma_diff_sign[0] == 1:
            
            # enter position (long)
            self.order = self.buy(data=self.data_5m, size=1)        
            txt+=f"[{prefix}] Placed BUY Market (order.ref={self.order.ref}): Size={self.order.size}"
        


        elif self.sma_diff_sign[0] == -1:

            # enter position (short)
            self.order = self.sell(data=self.data_5m, size=1)
            txt+=f"[{prefix}] Placed SELL Market (order.ref={self.order.ref}): Size={self.order.size}"


        else:
            raise ValueError(f"invalid direction: {self.sma_diff_sign[0]}")
            
        
    
        self.log(f"{txt}")
        print()









        






    def notify_order(self, order):
        super().notify_order(order)
        
        txt=f""
        prefix=inspect.currentframe().f_code.co_name

        if order.status in [bt.Order.Submitted, bt.Order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        elif order.status in [bt.Order.Completed]:

            # order was placed at previous bar, so we reffer to previous direction
            if self.sma_diff_sign[-1] == 1:
            
                # enter position (long)

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
                    self.orders.append(order)
                    
                    # exit order
                    sell_order.pair_order_ref=order.ref
                    sell_order.pair_type = "exit"
                    self.orders.append(sell_order)

                    # txt=f"[EXIT] [order.ref={self.order.ref} placed: SELL]"
                    # self.log(txt)
                    
                elif order.issell():
                    # self.log(f"SELL executed")
                    self.log(f"[{prefix}] SELL EXECUTED: Size={order.executed.size}, Exit Price={order.executed.price}, PnL={order.executed.pnl:.2f}")

                
                self.order = None # reset order tracking









            elif self.sma_diff_sign[0] == -1:

                # enter position (short)
                
                if order.isbuy():
                    # self.log(f"BUY executed")
                    self.log(f"[{prefix}] BUY EXECUTED: Size={order.executed.size}, Exit Price={order.executed.price}, PnL={order.executed.pnl:.2f}")
                    
                    
                elif order.issell():

                    # self.log(f"SELL executed")
                    self.log(f"[{prefix}] SELL EXECUTED (order.ref={order.ref}): Size={order.executed.size}, Entry Price={order.executed.price}")


                    # Calculate the take profit price
                    take_profit_price = order.executed.price - self.params.take_profit_usd
                    
                    # Place a take profit buy order (below current price)
                    buy_order = self.buy(
                        data=self.data_5m,
                        size=order.executed.size, 
                        # size=1,
                        exectype=bt.Order.Limit, 
                        price=take_profit_price
                    )
                    self.log(f"[{prefix}] Placed BUY LIMIT (order.ref={buy_order.ref}): Size={order.executed.size}, Price={take_profit_price}")

                    # enter order
                    order.pair_order_ref=buy_order.ref
                    order.pair_type = "enter"
                    self.orders.append(order)
                    
                    # exit order
                    buy_order.pair_order_ref=order.ref
                    buy_order.pair_type = "exit"
                    self.orders.append(buy_order)


                    # txt=f"[EXIT] [order.ref={self.order.ref} placed: SELL]"
                    # self.log(txt)

                
                self.order = None # reset order tracking






            
            

        elif order.status in [bt.Order.Canceled, bt.Order.Margin, bt.Order.Rejected]:
            # Order was not completed: reset the order tracker
            self.log(f"[{prefix}] Order Canceled/Margin/Rejected")
            self.order = None

