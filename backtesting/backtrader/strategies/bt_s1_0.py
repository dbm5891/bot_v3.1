import backtrader as bt


# single time frame
class SingleTimeframeStrategy(bt.Strategy):
    def __init__(self):
        # Access the data feeds by index
        self.data = self.datas[0]

        # Add a MovingAverageSimple indicator
        # self.rsi14 = bt.indicators.RSI(self.data.close, period=14)
        # self.sma20 = bt.indicators.SMA(self.data.close, period=20)

    def next(self):
        # Print the current close prices
        txt=""
        # txt=f"[1D]: {self.data.datetime.datetime(0)},  close: {self.data.close[0]}, sma20: {self.sma20[0]}    "
        txt=f"[1D]: {self.data.datetime.datetime(0)},  close: {self.data.close[0]}"
        print(txt)







# iterate multi time frame
class MultiTimeframeStrategy_basic(bt.Strategy):
    def __init__(self):
        # Access the data feeds by index
        self.data_1d = self.datas[0]
        self.data_5m = self.datas[1]

        # Add a MovingAverageSimple indicator
        # self._1d_rsi14 = bt.indicators.RSI(self.data_1d.close, period=14)
        # self._1d_sma20 = bt.indicators.SMA(self.data_1d.close, period=20)
        
        # self._5m_rsi14 = bt.indicators.RSI(self.data_5m.close, period=14)
        # self._5m_sma20 = bt.indicators.SMA(self.data_5m.close, period=20)
        # self._5m_ema20 = bt.indicators.EMA(self.data_5m.close, period=20)

    def next(self):
        # Print the current close prices
        txt=""
        # txt=f"[1D]: {self.data_1d.datetime.datetime(0)},  close: {self.data_1d.close[0]}, sma20: {self._1d_sma20[0]}    "
        # txt+=f"[5m]: {self.data_5m.datetime.datetime(0)}, close: {self.data_5m.close[0]}, sma20: {self._5m_sma20[0]}"
        
        txt=f"[1D]: {self.data_1d.datetime.datetime(0)},  close: {self.data_1d.close[0]},    "
        txt+=f"[5m]: {self.data_5m.datetime.datetime(0)}, close: {self.data_5m.close[0]}"
        print(txt)
        pass
