import backtrader as bt
from datetime import time

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from bt_s1_1_base import Strategy1_1_base

# [5m] enter at 18.00, exit at 19.00
class Strategy1_2_candle_tp(Strategy1_1_base):

    

    def __init__(self):
        super().__init__()

        self.take_profit = 0.10
        self.stop_loss = 0.10

        self.entry_price = None  # Track the entry price of the current position
        self.sell_order = None  # Track the limit sell order
        
    
    def my_strategy(self):

        # Check if there's no open position and no pending sell order
        if not self.position and self.sell_order is None:
            self.order = self.buy(data=self.data_5m)
            order_status_name = bt.Order.Status[self.order.status]
            self.log(f"[place buy (market) order] order(ref={self.order.ref}, status={self.order.status, order_status_name})")

        # If there is an open position and no limit sell order, set the target price
        elif self.position and self.sell_order is None:
            if self.entry_price:
                target_price = self.entry_price + 0.10  # Set target price based on entry price
                self.log(f"Target price set to: {target_price}")
                self.sell_order = self.sell(data=self.data_5m, exectype=bt.Order.Limit, price=target_price)
