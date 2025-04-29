import backtrader as bt
from datetime import time


# iterate multi time frame
class Strategy1_1_base(bt.Strategy):

    params = (
        ("take_profit", 0.10),
        ("stop_loss", 1.00),
    )
    
    def __init__(self):
        self.trades = []

        self.data_5m = self.datas[0]
        self.data_1d = None
        if len(self.datas)==2:
            self.data_1d = self.datas[1]

        self.premarket_open = time(hour=11, minute=0)
        self.market_open = time(hour=16, minute=30)
        self.market_close = time(hour=22, minute=55)
        self.after_hours_close = time(hour=3, minute=0) # next day

        self.order = None  # track active orders
        self.buy_order = None
        self.sell_order = None

        self.buy_price = None  # track the price at which we entered
        self.entry_price = None

        self.set_tradehistory(True)

    def notify_order(self, order):
        
        order_status_name = bt.Order.Status[order.status]
        txt=f"order(ref={order.ref}, status={order.status, order_status_name}, type={order.exectype}, Price = {order.executed.price}, Size = {order.executed.size}, Value = {order.executed.value})"
        print(f"\nOrder:\n")
        txt=f"\n{order}\n"
        self.log(txt)
        # self.log(f"order(ref={order.ref}, status={order.status, order_status_name})")
        # if order.status in [order.Submitted, order.Accepted]:
        #     # Buy/Sell order submitted/accepted to/by broker - Nothing to do
        #     return

        # Check if an order has been completed
        # Attention: broker could reject order if not enough cash
        if order.status in [order.Completed]:
            if order.isbuy():
                self.log(f"BUY EXECUTED: {txt}")
                self.buy_price = order.executed.price
                self.entry_price = order.executed.price
                self.buy_order = None  # Reset the buy order

            elif order.issell():
                self.log(f"SELL EXECUTED: {txt}")
                self.sell_order = None  # Reset the sell order tracker after execution
                self.entry_price = None  # Reset the entry price after closing the position

            self.order = None  # Reset order after execution

        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log("Order Canceled/Margin/Rejected")
            self.order = None

    def notify_trade(self, trade: bt.trade.Trade):
        # if not trade.isclosed:
        #     self.log(f"TRADE CLOSED: PnL = {trade.pnl}, PnLcomm = {trade.pnlcomm}")

        txt_bars=f"[{trade.baropen} -> {trade.barclose if trade.barclose else None}]"
        self.log(txt_bars)

        # if trade.isopen:
        #     self.log(f"Trade Opened: Size={trade.size}, Price={trade.price} {txt_bars}")
        # elif trade.isclosed:
        #     self.log(f"Trade Closed: Gross PnL={trade.pnl}, Net PnL={trade.pnlcomm} {txt_bars}")
        
        print(f"\nTrade:\n")
        self.log(f"\n{trade}\n")

        # store trade
        if trade.isclosed:  # When the trade is closed
            trade_info = {
                'ticker': trade.data._name,  # Ticker name
                'profit': trade.pnl,  # Profit/Loss of the trade
                'net_profit': trade.pnlcomm,  # Profit after commission
                'open_date': trade.open_datetime(),
                'close_date': trade.close_datetime(),
                'size': trade.size,  # Size of the position
                'price': trade.price,  # Close price
                
                'event_size': trade.history[-1].event.size,  # current event Size
                'event_price': trade.history[-1].event.price,  # current event Close price

               
            }
            # self.trades.append(trade_info)  # Add to trades list
            self.trades.append(trade)  # Add to trades list
            self.log(f"Trade closed: {trade_info}")

    def log(self, txt=""):
        prefix=""
        # prefix=f"[1D]: {self.data_1d.datetime.datetime(0)}, close: {self.data_1d.close[0]}, "
        # prefix+=f"[5m]: {self.data_5m.datetime.datetime(0)}, close: {self.data_5m.close[0]}"
        # prefix+=f"[5m]: {self.data_5m.datetime.datetime(0)}, (open: {self.data_5m.open[0]}, high: {self.data_5m.high[0]}, low: {self.data_5m.low[0]}, close: {self.data_5m.close[0]})"
        if self.data_1d:
            prefix+=f"[1D]: {self.data_1d.datetime.datetime(0)}, (o={self.data_1d.open[0]}, h={self.data_1d.high[0]}, l={self.data_1d.low[0]}, c={self.data_1d.close[0]}), "
        prefix+=f"[5m]: {self.data_5m.datetime.datetime(0)}, (o={self.data_5m.open[0]}, h={self.data_5m.high[0]}, l={self.data_5m.low[0]}, c={self.data_5m.close[0]})"
        print(f"{prefix}: {txt}")



    def allow_trade(self) -> bool:

        current_time: time=self.data_5m.datetime.time()
        
        # trading boundries
        if current_time<self.market_open or current_time>self.market_close:
            txt="not RTH (we don't trade)"
            self.log(txt)
            return False
        
        return True
    

    
    def next(self):

        if self.allow_trade():

            txt=""
            current_time: time=self.data_5m.datetime.time()
            
            # close position at market close
            if self.position and current_time>=self.market_close:
                self.log(f"[place close order] market close")
                self.close(data=self.data_5m)
                self.buy_order = None
                self.sell_order = None

            txt="rth..."
            if self.position:
                position_cost = self.position.price * self.position.size
                txt+=f" position(price={self.position.price}, size={self.position.size}, cost={position_cost})"
                print(f"\nPosition:\n")
                self.log(f"\n{self.position}\n")

            self.log(txt)
            self.my_strategy()

    
    # ---------------------------------------------------
    # virtual method
    def my_strategy(self):
        raise NotImplementedError()





        

