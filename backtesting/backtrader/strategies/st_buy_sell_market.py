import backtrader as bt

import os
import sys

cwd = os.getcwd()
curr_path = f"{cwd}\\backtesting\\backtrader\\strategies"
sys.path.append(curr_path)


from st_base import StrategyBase

class StrategyBuySellMarket(StrategyBase):
    DESCRIPTION = "A simple strategy that places immediate market orders to buy or sell an asset."
    params = (
        ('take_profit', 0.01),  # Take profit amount in currency units (e.g., $0.01)
    )

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order

    def next(self):
        super().next()

        self.close_positions_market_close()
        if not self.allow_place_new_order():
            return
        
        # from this point, trading is valid
        # return


        # ----------------------------------------------
        # Check if there is an open position
        if not self.position:
            # No position: place a buy order
            self.log(f"place buy order")
            self.order = self.buy(data=self.data_5m)
            self.log(f"buy order.ref={self.order.ref} placed")

    



    def notify_order(self, order):
        super().notify_order(order)

        if order.status in [bt.Order.Submitted, bt.Order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        elif order.status in [bt.Order.Completed]:
            if order.isbuy():
                self.log(f"buy executed")
                
                # Buy order completed: place a take-profit sell limit order
                # take_profit_price = order.executed.price + self.params.take_profit
                # take_profit_price = self.position.price + self.params.take_profit
                # self.log(f"place sell order, price={take_profit_price}")

                
                if self.allow_place_new_order():
                
                    self.log(f"place sell order")
                    self.order = self.sell(data=self.data_5m)
                    self.log(f"sell order.ref={self.order.ref} placed")
                    # self.order = self.sell(data=self.data_5m, exectype=bt.Order.Limit, price=take_profit_price)
                    # self.order = self.sell(data=self.data_5m, exectype=bt.Order.Stop, price=take_profit_price)
                    # self.order = self.sell(data=self.data_5m, exectype=bt.Order.StopLimit, price=take_profit_price)
                    # self.order = self.close(data=self.data_5m, exectype=bt.Order.Limit, price=take_profit_price)
                
                
            elif order.issell() :
                self.log(f"sell executed")
                self.order = None  # Clear the order reference

        elif order.status in [bt.Order.Canceled, bt.Order.Margin, bt.Order.Rejected]:
            # Order was not completed: reset the order tracker
            self.log("Order Canceled/Margin/Rejected")
            self.order = None

