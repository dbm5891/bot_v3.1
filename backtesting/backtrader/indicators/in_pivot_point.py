import backtrader as bt

class PivotPoint(bt.Indicator):
    """
    Custom Pivot Point Indicator:
    - Calculates Pivot Point, Support, and Resistance levels
    - Based on the High, Low, and Close of the previous session
    """
    lines = ('pivot', 's1', 's2', 'r1', 'r2')
    plotinfo = dict(subplot=False)

    def __init__(self):
        # Add a previous day high, low, close buffer
        self.addminperiod(2)

    def next(self):
        if len(self.data) > 1:  # Ensure enough data points
            high = self.data.high[-1]
            low = self.data.low[-1]
            close = self.data.close[-1]

            # Pivot point calculation
            self.lines.pivot[0] = (high + low + close) / 3

            # Support and resistance levels
            self.lines.s1[0] = (2 * self.lines.pivot[0]) - high
            self.lines.r1[0] = (2 * self.lines.pivot[0]) - low
            self.lines.s2[0] = self.lines.pivot[0] - (high - low)
            self.lines.r2[0] = self.lines.pivot[0] + (high - low)
