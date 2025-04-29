import backtrader as bt
from datetime import time

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from st_base import StrategyBase

class Strategy18to19(StrategyBase):
    

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order



    def next(self):
        super().next()
        self.close_positions_market_close()
        
        if not self.allow_trade():
            return
        
        # from this point, trading is valid
        
        # ----------------------------------------------
        
        current_time: time=self.data_5m.datetime.time()
        
        # Enter position
        if current_time == time(13, 30) and self.position.size == 0:
            self.order = self.buy(data=self.data_5m, size=1)
            self.log(f"place buy order")

        # Exit position
        elif current_time == time(19, 0) and self.position.size > 0:
            self.order = self.close(data=self.data_5m)
            self.log(f"place close order")





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



    

