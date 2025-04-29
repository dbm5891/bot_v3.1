import backtrader as bt
from datetime import time

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from bt_s1_1_base import Strategy1_1_base

# [5m] enter at 18.00, exit at 19.00
class BuySellLimit(Strategy1_1_base):

    

    def __init__(self):
        super().__init__()
        self.buy_order = None
        self.sell_order = None
        
    
    def my_strategy(self):

        # print(self.__class__.__name__)

        # Check if there's no open position and no pending buy order
        if not self.position and self.buy_order is None:
            # Set a limit price below the current close price
            # limit_price = self.data.close[0] - 0.50
            limit_price = 153
            print(f"Placing limit buy order at: {limit_price}")
            
            # Place a limit buy order
            self.buy_order = self.buy(data=self.data_5m, exectype=bt.Order.Limit, price=limit_price)
            # self.buy_order = self.buy(data=self.data_5m, exectype=bt.Order.Stop, price=limit_price)

        elif self.position and self.buy_order:
            limit_price = 153.5
            print(f"Placing limit sell order at: {limit_price}")

            self.sell_order = self.sell(data=self.data_5m, exectype=bt.Order.Limit, price=limit_price)
