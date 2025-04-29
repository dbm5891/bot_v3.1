import csv
import backtrader as bt
from datetime import time

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


class Strategy110(StrategyBase):

    params = dict(
        bb_period=20,        # Bollinger Bands period
        bb_dev=2,            # Standard deviation
        rsi_period=14,       # RSI period
        rsi_oversold=25,     # RSI oversold level
        rsi_overbought=75,   # RSI overbought level
        atr_period=14,       # ATR for stop loss
        risk_reward_ratio=3  # Reward-to-risk ratio (3x ATR)
    )
    
    

    def __init__(self):
        super().__init__()
        self.order = None  # To keep track of the pending order

        # sma
        length=200
        diff_period=10
        self.sma = bt.indicators.SMA(self.data_5m.close, period=length)
        self.sma_diff = Diff(self.data_5m, input_indicator=self.sma, periods=diff_period)
        # self.sma_diff_sign = ToSign(self.data_5m, input_indicator=self.sma_diff)
        # self.sma_diff_sign_sequences = FindSequences(self.data_5m, input_indicator=self.sma_diff_sign)



        # Indicators
        self.bb = bt.indicators.BollingerBands(self.data_5m.close, period=self.params.bb_period, devfactor=self.params.bb_dev)
        self.rsi = bt.indicators.RSI(self.data_5m.close, period=self.params.rsi_period)
        self.atr = bt.indicators.ATR(self.data_5m, period=self.params.atr_period)

        
       



    def next(self):
        super().next()

        self.close_positions_market_close()
        if not self.allow_trade():
            return
        
        # from this point, trading is valid
        
        # ----------------------------------------------
        # return
    

        txt=""

        # trades by date
        current_time: time=self.data_5m.datetime.datetime()
        trades=self.get_trades_by_close_date(current_time)
        if len(trades)>1:
            return

        # enter position
        if not self.position:

            if self.data_5m.close[0] < self.bb.lines.bot[0] and self.rsi[0] < self.params.rsi_oversold:
                entry_price = self.data_5m.close[0]
                # stop_loss = entry_price - self.atr[0] * 1.5  # Tight SL
                # take_profit = entry_price + (self.atr[0] * self.params.risk_reward_ratio)
                stop_loss = entry_price - 10
                # stop_loss = None
                take_profit = entry_price + 0.01

                # Buy Order with SL & TP
                self.order = self.buy_bracket(
                    data=self.data_5m,
                    price=entry_price,
                    stopprice=stop_loss,
                    limitprice=take_profit
                )
                txt+=f"[ENTER] placed: BUY"
                # txt+=f"[ENTER] [order.ref={self.order.ref} placed: BUY]"

            elif self.data_5m.close[0] > self.bb.lines.top[0] and self.rsi[0] > self.params.rsi_overbought:
                entry_price = self.data_5m.close[0]
                # stop_loss = entry_price + self.atr[0] * 1.5
                # take_profit = entry_price - (self.atr[0] * self.params.risk_reward_ratio)
                stop_loss = entry_price + 10
                # stop_loss = None
                take_profit = entry_price - 0.01

                # Sell Order with SL & TP
                self.order = self.sell_bracket(
                    price=entry_price,
                    stopprice=stop_loss,
                    limitprice=take_profit
                )
                txt+=f"[ENTER] placed: SELL"
                # txt+=f"[ENTER] [order.ref={self.order.ref} placed: SELL]"



        self.log(f"{txt}")









        






    def notify_order(self, order):
        super().notify_order(order)

        if order.status in [bt.Order.Submitted, bt.Order.Accepted]:
            # Buy/Sell order submitted/accepted to/by broker - Nothing to do
            return

        elif order.status in [bt.Order.Completed]:
            if order.isbuy():
                self.log(f"BUY executed")
                
            elif order.issell():
                self.log(f"SELL executed")
            
            self.order = None # reset order tracking

        elif order.status in [bt.Order.Canceled, bt.Order.Margin, bt.Order.Rejected]:
            # Order was not completed: reset the order tracker
            self.log("Order Canceled/Margin/Rejected")
            self.order = None



    

