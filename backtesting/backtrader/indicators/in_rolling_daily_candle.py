import backtrader as bt
import datetime

class RollingDailyCandle(bt.Indicator):
    lines = (
        'candle_open', 
        'candle_high', 
        'candle_low', 
        'candle_close', 
        'marubozu', 
        'direction'
    )

    # plotinfo = dict(subplot=False)  # Ensure the indicator is plotted on the main chart
    if 0:
        plotlines = dict(
            candle_open=dict(color='b'),
            candle_high=dict(color='g'),
            candle_low=dict(color='r'),
            candle_close=dict(color='orange'),
            
            marubozu=dict(_plotskip=True),
            direction=dict(_plotskip=True),
        )
    else:
        plotlines = dict(
            candle_open=dict(_plotskip=True),
            candle_high=dict(_plotskip=True),
            candle_low=dict(_plotskip=True),
            candle_close=dict(_plotskip=True),
            
            direction=dict(_plotskip=True),
        )

    def __init__(self):
        self.session_start = datetime.time(13, 25) # utc time
        self.session_end = datetime.time(20, 0)
        self.session_active = False
        self.rolling_open = None
        self.rolling_high = None
        self.rolling_low = None
        self.rolling_close = None

    def next(self):
        dt: datetime = self.datas[0].datetime.datetime(0)
        close = self.data.close[0]

        if self.session_start <= dt.time() <= self.session_end:
            if not self.session_active:
                # Start a new session candle
                self.session_active = True
                self.rolling_open = close
                self.rolling_high = close
                self.rolling_low = close

            # Update the rolling OHLC values
            self.rolling_high = max(self.rolling_high, close)
            self.rolling_low = min(self.rolling_low, close)
            self.rolling_close = close

            # Assign to lines
            self.lines.candle_open[0] = self.rolling_open
            self.lines.candle_high[0] = self.rolling_high
            self.lines.candle_low[0] = self.rolling_low
            self.lines.candle_close[0] = self.rolling_close

            
            # ----------------------------------------------
            self.is_marubozu()
            self.set_direction()


            

        else:
            self.session_active = False
            self.lines.marubozu[0] = 0
            self.lines.direction[0] = 0


    
    
    # Check for marubozu pattern (no wicks or very small wicks)
    def is_marubozu(self):

        body_size = abs(self.rolling_close - self.rolling_open)
        upper_wick = self.rolling_high - max(self.rolling_close, self.rolling_open)
        lower_wick = min(self.rolling_close, self.rolling_open) - self.rolling_low

        # Define tolerance for "very small wicks"
        marubozu_threshold: float=0.50
        tolerance = (body_size*marubozu_threshold) if body_size else 0

        if (upper_wick<=tolerance) and (lower_wick<=tolerance):
            self.lines.marubozu[0] = 1  # True
        else:
            self.lines.marubozu[0] = 0  # False

    
    def set_direction(self):
        # Determine candle direction
        # direction_threshold: float=0.001
        direction_threshold: float=0.01
        if self.rolling_close > self.rolling_open*(1+direction_threshold):
            self.lines.direction[0] = 1
        elif self.rolling_close < self.rolling_open*(1-direction_threshold):
            self.lines.direction[0] = -1
        else:
            self.lines.direction[0] = 0

