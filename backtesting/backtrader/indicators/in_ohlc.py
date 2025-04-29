import backtrader as bt

class OHLC4(bt.Indicator):
    lines = ('ohlc4',)  # Define a custom line
    plotinfo = dict(subplot=False)  # Overlay on the main price chart

    def __init__(self):
        self.lines.ohlc4 = (self.data.open + self.data.high + self.data.low + self.data.close) / 4
