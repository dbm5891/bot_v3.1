# Import the backtrader platform
from datetime import time
import backtrader as bt

from backtesting.backtrader.indicators.in_ohlc import OHLC4


# Create a Stratey
class TestStrategy_0(bt.Strategy):

    def log(self, txt, dt=None):
        ''' Logging function for this strategy'''
        dt = dt or self.datas[0].datetime.datetime(0)
        # print('%s, %s' % (dt.isoformat(), txt))
        print('%s, %s' % (dt, txt))
        pass

    def __init__(self):
        # Keep a reference to the "close" line in the data[0] dataseries
        self.dataclose = self.datas[0].close
        pass

    def next(self):
        # Simply log the closing price of the series from the reference
        self.log('Close, %.2f' % self.dataclose[0])
        pass


# Step 2: Create a Custom Strategy
class TestStrategy_v0(bt.Strategy):
    def next(self):
        print(f"Date: {self.datas[0].datetime.datetime(0)}, Close: {self.datas[0].close[0]}")
        pass


# Create a Stratey
class TestStrategy_1(bt.Strategy):

    def log(self, txt, dt=None):
        ''' Logging function fot this strategy'''
        dt = dt or self.datas[0].datetime.date(0)
        print('%s, %s' % (dt.isoformat(), txt))

    def __init__(self):
        # Keep a reference to the "close" line in the data[0] dataseries
        self.dataclose = self.datas[0].close

    def next(self):
        # Simply log the closing price of the series from the reference
        self.log('Close, %.2f' % self.dataclose[0])

        if self.dataclose[0] < self.dataclose[-1]:
            # current close less than previous close

            if self.dataclose[-1] < self.dataclose[-2]:
                # previous close less than the previous close

                # BUY, BUY, BUY!!! (with all possible default parameters)
                self.log('BUY CREATE, %.2f' % self.dataclose[0])
                self.buy()



# Create a Stratey
class TestStrategy_2(bt.Strategy):

    def log(self, txt, dt=None):
        ''' Logging function fot this strategy'''
        dt = dt or self.datas[0].datetime.date(0)
        print('%s, %s' % (dt.isoformat(), txt))

    def __init__(self):
        # Keep a reference to the "close" line in the data[0] dataseries
        self.dataclose = self.datas[0].close

        # To keep track of pending orders
        self.order = None

    def notify_order(self, order):
        if order.status in [order.Submitted, order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        # Check if an order has been completed
        # Attention: broker could reject order if not enough cash
        if order.status in [order.Completed]:
            if order.isbuy():
                self.log('BUY EXECUTED, %.2f' % order.executed.price)
            elif order.issell():
                self.log('SELL EXECUTED, %.2f' % order.executed.price)

            self.bar_executed = len(self)

        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log('Order Canceled/Margin/Rejected')

        # Write down: no pending order
        self.order = None

    def next(self):
        # Simply log the closing price of the series from the reference
        self.log('Close, %.2f' % self.dataclose[0])

        # Check if an order is pending ... if yes, we cannot send a 2nd one
        if self.order:
            return

        # Check if we are in the market
        if not self.position:

            # Not yet ... we MIGHT BUY if ...
            if self.dataclose[0] < self.dataclose[-1]:
                    # current close less than previous close

                    if self.dataclose[-1] < self.dataclose[-2]:
                        # previous close less than the previous close

                        # BUY, BUY, BUY!!! (with default parameters)
                        self.log('BUY CREATE, %.2f' % self.dataclose[0])

                        # Keep track of the created order to avoid a 2nd order
                        self.order = self.buy()

        else:

            # Already in the market ... we might sell
            if len(self) >= (self.bar_executed + 5):
                # SELL, SELL, SELL!!! (with all possible default parameters)
                self.log('SELL CREATE, %.2f' % self.dataclose[0])

                # Keep track of the created order to avoid a 2nd order
                self.order = self.sell()


# Create a Stratey
class TestStrategy_3(bt.Strategy):
    params = (
        ('maperiod', 15),
    )

    def log(self, txt, dt=None):
        ''' Logging function fot this strategy'''
        dt = dt or self.datas[0].datetime.datetime(0)
        print('%s, %s' % (dt.isoformat(), txt))

    def __init__(self):
        # Keep a reference to the "close" line in the data[0] dataseries
        self.dataclose = self.datas[0].close

        # To keep track of pending orders and buy price/commission
        self.order = None
        self.buyprice = None
        self.buycomm = None

        # Add a MovingAverageSimple indicator
        self.sma = bt.indicators.SimpleMovingAverage(
            self.datas[0], period=self.params.maperiod)

    def notify_order(self, order):
        if order.status in [order.Submitted, order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        # Check if an order has been completed
        # Attention: broker could reject order if not enough cash
        if order.status in [order.Completed]:
            if order.isbuy():
                self.log(
                    'BUY EXECUTED, Price: %.2f, Cost: %.2f, Comm %.2f' %
                    (order.executed.price,
                     order.executed.value,
                     order.executed.comm))

                self.buyprice = order.executed.price
                self.buycomm = order.executed.comm
            else:  # Sell
                self.log('SELL EXECUTED, Price: %.2f, Cost: %.2f, Comm %.2f' %
                         (order.executed.price,
                          order.executed.value,
                          order.executed.comm))

            self.bar_executed = len(self)

        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log('Order Canceled/Margin/Rejected')

        self.order = None

    def notify_trade(self, trade):
        if not trade.isclosed:
            return

        self.log('OPERATION PROFIT, GROSS %.2f, NET %.2f' %
                 (trade.pnl, trade.pnlcomm))

    def next(self):
        # Simply log the closing price of the series from the reference
        self.log('Close, %.2f' % self.dataclose[0])

        # Check if an order is pending ... if yes, we cannot send a 2nd one
        if self.order:
            return

        # Check if we are in the market
        if not self.position:

            # Not yet ... we MIGHT BUY if ...
            if self.dataclose[0] > self.sma[0]:

                # BUY, BUY, BUY!!! (with all possible default parameters)
                self.log('BUY CREATE, %.2f' % self.dataclose[0])

                # Keep track of the created order to avoid a 2nd order
                self.order = self.buy()

        else:

            if self.dataclose[0] < self.sma[0]:
                # SELL, SELL, SELL!!! (with all possible default parameters)
                self.log('SELL CREATE, %.2f' % self.dataclose[0])

                # Keep track of the created order to avoid a 2nd order
                self.order = self.sell()



# Create a Stratey
class TestStrategy_4(bt.Strategy):
    params = (
        ('maperiod', 20),
    )

    def log(self, txt, dt=None):
        ''' Logging function fot this strategy'''
        dt = dt or self.datas[0].datetime.date(0)
        print('%s, %s' % (dt.isoformat(), txt))

    def __init__(self):
        # Keep a reference to the "close" line in the data[0] dataseries
        self.dataclose = self.datas[0].close

        # To keep track of pending orders and buy price/commission
        self.order = None
        self.buyprice = None
        self.buycomm = None

        # Use the custom indicator
        self.ohlc_avg = OHLC4(self.data)

        # Add a MovingAverageSimple indicator
        self.sma = bt.indicators.SimpleMovingAverage(self.datas[0], period=20)
        self.sma_50 = bt.indicators.SimpleMovingAverage(self.datas[0], period=50)
        self.sma_192 = bt.indicators.SimpleMovingAverage(self.datas[0], period=192)

        if 0:
            # Indicators for the plotting show
            bt.indicators.ExponentialMovingAverage(self.datas[0], period=25)
            bt.indicators.WeightedMovingAverage(self.datas[0], period=25,
                                                subplot=True)
            bt.indicators.StochasticSlow(self.datas[0])
            bt.indicators.MACDHisto(self.datas[0])
            rsi = bt.indicators.RSI(self.datas[0])
            bt.indicators.SmoothedMovingAverage(rsi, period=10)
            bt.indicators.ATR(self.datas[0], plot=False)

    def notify_order(self, order):
        if order.status in [order.Submitted, order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        # Check if an order has been completed
        # Attention: broker could reject order if not enough cash
        if order.status in [order.Completed]:
            if order.isbuy():
                self.log(
                    'BUY EXECUTED, Price: %.2f, Cost: %.2f, Comm %.2f' %
                    (order.executed.price,
                     order.executed.value,
                     order.executed.comm))

                self.buyprice = order.executed.price
                self.buycomm = order.executed.comm
            else:  # Sell
                self.log('SELL EXECUTED, Price: %.2f, Cost: %.2f, Comm %.2f' %
                         (order.executed.price,
                          order.executed.value,
                          order.executed.comm))

            self.bar_executed = len(self)

        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log('Order Canceled/Margin/Rejected')

        # Write down: no pending order
        self.order = None

    def notify_trade(self, trade):
        if not trade.isclosed:
            return

        self.log('OPERATION PROFIT, GROSS %.2f, NET %.2f' %
                 (trade.pnl, trade.pnlcomm))

    def next(self):
        # Simply log the closing price of the series from the reference
        self.log('Close, %.2f' % self.dataclose[0])

        # Check if an order is pending ... if yes, we cannot send a 2nd one
        if self.order:
            return

        # Check if we are in the market
        if not self.position:

            # Not yet ... we MIGHT BUY if ...
            if self.dataclose[0] > self.sma[0]:

                # BUY, BUY, BUY!!! (with all possible default parameters)
                self.log('BUY CREATE, %.2f' % self.dataclose[0])

                # Keep track of the created order to avoid a 2nd order
                self.order = self.buy()

        else:

            if self.dataclose[0] < self.sma[0]:
                # SELL, SELL, SELL!!! (with all possible default parameters)
                self.log('SELL CREATE, %.2f' % self.dataclose[0])

                # Keep track of the created order to avoid a 2nd order
                self.order = self.sell()





class TakeProfitStopLossStrategy(bt.Strategy):
    params = (
        ("take_profit", 0.10),  # Profit target in dollars
        ("stop_loss", 1.00),   # Stop loss in dollars
        ('market_open', time(16, 30)),  # Market opens at 9:30 AM
        ('market_close', time(23, 0)), # Market closes at 4:00 PM
    )

    def __init__(self):
        self.order = None  # Track active orders
        self.buy_price = None  # Track the price at which we entered

        # Use the custom indicator
        self.ohlc_avg = OHLC4(self.data)
        # self.ohlc_avg.plotinfo.color = 'black'  # Set custom color

        # Add a MovingAverageSimple indicator
        self.sma = bt.indicators.SimpleMovingAverage(self.datas[0], period=20)

    def notify_order(self, order):
        if order.status in [order.Completed]:
            if order.isbuy():
                self.log(f"BUY EXECUTED: Price = {order.executed.price}, Size = {order.executed.size}")
                self.buy_price = order.executed.price
            elif order.issell():
                self.log(f"SELL EXECUTED: Price = {order.executed.price}, Size = {order.executed.size}")
            self.order = None  # Reset order after execution

        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            self.log("Order Canceled/Margin/Rejected")
            self.order = None

    def notify_trade(self, trade):
        if trade.isclosed:
            self.log(f"TRADE CLOSED: PnL = {trade.pnl}")

    def log(self, txt):
        dt = self.datas[0].datetime.datetime(0)
        print(f"{dt}: {txt}")

    def next(self):

        # Get the current time from the data feed
        current_time = self.datas[0].datetime.time()
        
        # Check if the market is near closing time
        if current_time >= self.params.market_close:
            if self.position:
                self.log(f"Market close: Closing position. Current time = {current_time}")
                # self.close()  # Close the position
                self.sell()


        # Check if the current time is within regular market hours
        if (current_time < self.params.market_open) or (current_time > self.params.market_close):
            self.log(f"Market is close (Time: {current_time})")
            return


        # Check if we already have an open position
        if self.position:
            # Calculate take profit and stop loss levels
            take_profit_price = self.buy_price + self.params.take_profit
            stop_loss_price = self.buy_price - self.params.stop_loss

            # Check if we should exit for take-profit or stop-loss
            if self.data.close[0] >= take_profit_price:
                self.log(f"Take Profit Hit: Close Price = {self.data.close[0]}")
                self.sell()  # Close position
            elif self.data.close[0] <= stop_loss_price:
                self.log(f"Stop Loss Hit: Close Price = {self.data.close[0]}")
                self.sell()  # Close position
        else:
            # Enter a new position if no active position exists
            if not self.order:
                self.log(f"BUY ORDER (LONG) SENT: Close Price = {self.data.close[0]}")
                self.order = self.buy()
