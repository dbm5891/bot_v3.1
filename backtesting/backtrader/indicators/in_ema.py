import backtrader as bt
import numpy as np


class EMA(bt.Indicator):
    """
    Custom Exponential Moving Average Indicator
    """
    params = (
        ('period', 20),  # Default EMA period
    )
    
    lines = ('ema',)  # Define the output line

    plotinfo = dict(subplot=False)  # Overlay on the main price chart
    plotlines = dict(
        ema=dict(color='grey'),
    )
    
    def __init__(self):
        # Use Exponential Moving Average formula
        self.alpha = 2 / (self.params.period + 1)  # Smoothing factor
        self.addminperiod(self.params.period)  # Ensure enough data is available

    def next(self):
        if len(self) == self.params.period:  # When we have exactly `period` bars
            # Initialize EMA as the average of the last `period` bars
            self.lines.ema[0] = sum(self.data.get(size=self.params.period)) / self.params.period # SMA
            # self.lines.ema[0] = self.data[0] # use close value instead SMA

        else:
            prev_ema = self.lines.ema[-1]
            
            # Use numpy.isnan to check for NaN
            if not np.isnan(prev_ema):
                # Calculate EMA recursively
                self.lines.ema[0] = (self.alpha * self.data[0] + (1 - self.alpha) * self.lines.ema[-1])

            else:
                # Restart calculation if NaN

                # self.lines.ema[0] = self.data[0] # use close value instead SMA
                self.lines.ema[0] = sum(self.data.get(size=self.params.period)) / self.params.period # SMA






