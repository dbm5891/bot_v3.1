import backtrader as bt

# give me example code for strategy that open position at 150 limit and sell at 151 limit, 
# and ensure that only one order is placed at a time until the current position is closed.
    
class LimitOrderStrategy(bt.Strategy):
    def __init__(self):
        self.order = None  # Track active order

    def next(self):
        # If there's no position and no active order, place a buy limit order at 150
        if not self.position and self.order is None:
            price = 150  # Target buy limit price
            print(f"Placing BUY LIMIT order at price: {price}")
            self.order = self.buy(price=price, exectype=bt.Order.Limit)

    def notify_order(self, order):
        # Handle order notifications
        if order.status in [bt.Order.Completed]:  # Order executed
            if order.isbuy():
                print(f"BUY EXECUTED at price: {order.executed.price}")
                # Place a sell limit order at 151 after buy is executed
                sell_price = 151
                print(f"Placing SELL LIMIT order at price: {sell_price}")
                self.order = self.sell(price=sell_price, exectype=bt.Order.Limit)

            elif order.issell():
                print(f"SELL EXECUTED at price: {order.executed.price}")
                self.order = None  # Reset order tracking after sell execution

        elif order.status in [bt.Order.Canceled, bt.Order.Rejected, bt.Order.Margin]:
            print("Order Canceled/Rejected/Margin")
            self.order = None  # Reset on failure

    def notify_trade(self, trade):
        # Reset order tracking when a trade is fully closed
        if trade.isclosed:
            print(f"TRADE CLOSED: PnL: {trade.pnl}")
            self.order = None