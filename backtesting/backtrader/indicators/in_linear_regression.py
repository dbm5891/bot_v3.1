from datetime import datetime, time, timedelta
import backtrader as bt
import numpy as np
from scipy.stats import linregress

# calculate linear regression from today at market-open (11:00) to current bar
# see reference pandas-ta custom indicator:
# def rolling_regression(df: pd.DataFrame, column_name: str = "close"):
class RollingLinearRegression(bt.Indicator):
    lines = ('slope', 'r2score', 'zero', 'r2score_threshold')

    
    # plotinfo = dict(subplot=False)
    plotlines = dict(
        r2score=dict(_plotskip=True),
        zero=dict(linestyle='dashed', alpha=0.50),
        r2score_threshold=dict(_plotskip=True, linestyle='dashed', alpha=0.50),
    )

    # params = (
    #     ('time_begin', time(hour=11, minute=0)),
    #     ('duration', timedelta(hours=16)),
    # )



    # implement indicator in __init__() OR next(). not both.
    def __init__(
            self,
            time_start=time(hour=13, minute=25),
            duration=timedelta(hours=6, minutes=30),
            r2score_threshold=0.70,
            
        ):

        # self.input_indicator = input_indicator 
        # self.lines.input = input_indicator # used in next() method to access current value (otherwise, we get only the last value in series in next())
        # self.addminperiod(2)

        self.time_start: time = time_start
        self.duration: timedelta = duration
        self.r2score_threshold=r2score_threshold

        
        


    def next(self):

        self.lines.zero[0] = 0.0
        self.lines.r2score_threshold[0] = self.r2score_threshold

        # Get the current bar's datetime
        current_datetime: datetime = self.datas[0].datetime.datetime(0)

        if 1:
            # market: 16:30 to 23:00 (Israel)
            time_begin = datetime.combine(current_datetime.date(), self.time_start)
            time_end = time_begin + self.duration
        


        # whole day (pre market to after hours)
        if 0:
            # after pre-market open
            if current_datetime.time() >= time(hour=11):
                # get all rows between today at 11:00 to next day at 03:00
                time_begin = datetime.combine(current_datetime.date(), time(hour=11, minute=0))
                time_end = time_begin + timedelta(hours=16)

                
            else:
                time_end = datetime.combine(current_datetime.date(), time(hour=3, minute=0))
                time_begin = time_end - timedelta(hours=16)

        # print(f"{time_begin} <= {current_datetime} <= {time_end}")


        # Filter bars from the current trading day's 11:00 AM onward
        selected_bars = []
        x_values = []
        
        for i in range(len(self)):  # Loop over all processed bars
            bar_datetime: datetime = self.datas[0].datetime.datetime(-i)  # Get datetime of past bars
            
            if (bar_datetime>=time_begin) and (bar_datetime<=time_end) and (bar_datetime<=current_datetime):
                selected_bars.append(self.data[-i]) # TODO: use self.input_indicator for different data than 'close'
                x_values.append(len(selected_bars) - 1)  # Assign x values based on order
            else:
                break  # Stop when reaching bars before 'time_begin' (11:00 AM)





        if len(selected_bars) < 2:
            return  # Not enough data for regression

        selected_bars.reverse() # values were added from newest to oldest, need to reverse order.

        # Convert to numpy arrays
        y_values = np.array(selected_bars)
        x_values = np.array(x_values)

        # Compute linear regression
        slope, intercept, r_value, _, _ = linregress(x_values, y_values)

        # Store computed values
        self.lines.slope[0] = slope
        self.lines.r2score[0] = r_value**2  # R² score
        
        
        

