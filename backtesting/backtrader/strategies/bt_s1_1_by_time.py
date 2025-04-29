import backtrader as bt
from datetime import time

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from bt_s1_1_base import Strategy1_1_base

# [5m] enter at 18.00, exit at 19.00
class Strategy1_1_by_time(Strategy1_1_base):

    

    # def next(self):
        
    #     super().next()
    #     current_time: time=self.data_5m.datetime.time()
    
    def my_strategy(self):
        
        current_time: time=self.data_5m.datetime.time()

        # ----------------------------------------------
        # Enter long position at 10:00 AM
        if current_time == time(18, 0) and self.position.size == 0:
            self.order = self.buy(data=self.data_5m)
            order_status_name = bt.Order.Status[self.order.status]
            self.log(f"[place buy order] order(ref={self.order.ref}, status={self.order.status, order_status_name})")

        # Exit position at 11:00 AM
        elif current_time == time(19, 0) and self.position.size > 0:
            self.order = self.close(data=self.data_5m)
            order_status_name = bt.Order.Status[self.order.status]
            self.log(f"[place close order] order(ref={self.order.ref}, status={self.order.status, order_status_name})")
