from datetime import datetime, time, timedelta
import operator
import backtrader as bt
import numpy as np


class RollingEventPercentage(bt.Indicator):
    lines = ('result', 'input', 'upper_threshold', 'lower_threshold')

    
    # plotinfo = dict(subplot=False)
    plotlines = dict(
        input=dict(_plotskip=True),
        upper_threshold=dict(linestyle='dashed', alpha=0.50),
        lower_threshold=dict(linestyle='dashed', alpha=0.50),
    )

    # params = (
    #     ('time_begin', time(hour=11, minute=0)),
    #     ('duration', timedelta(hours=16)),
    # )



    # implement indicator in __init__() OR next(). not both.
    def __init__(
            self, 
            input_indicator, 
            operator=operator.eq, 
            ref_value: float=0,
            time_start=time(hour=16, minute=25),
            duration=timedelta(hours=6, minutes=30),
            upper_threshold=1.0,
            lower_threshold=0.0,
        ):

        self.input_indicator = input_indicator 
        self.lines.input = input_indicator # used in next() method to access current value (otherwise, we get only the last value in series in next())

        self.operator = operator
        self.ref_value = ref_value
        
        self.time_start: time = time_start
        self.duration: timedelta = duration
        
        self.upper_threshold=upper_threshold
        self.lower_threshold=lower_threshold
        
        


    def next(self):

        self.lines.upper_threshold[0] = self.upper_threshold
        self.lines.lower_threshold[0] = self.lower_threshold

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



        # Filter bars from the current trading day's 11:00 AM onward
        selected_bars_values = []
        
        for i in range(len(self)):  # Loop over all processed bars
            bar_datetime: datetime = self.datas[0].datetime.datetime(-i)  # Get datetime of past bars
            
            if (bar_datetime>=time_begin) and (bar_datetime<=time_end) and (bar_datetime<=current_datetime):
                # selected_bars.append(self.data[-i]) # TODO: use self.input_indicator for different data than 'close'
                selected_bars_values.append(self.lines.input[-i])
            else:
                break  # Stop when reaching bars before 'time_begin' (11:00 AM)





        if not len(selected_bars_values):
            # self.lines.result[0] = 0.0 # default
            return  # no data

        # not must here:
        selected_bars_values.reverse() # values were added from newest to oldest, need to reverse order.

        # Convert to numpy arrays
        values = np.array(selected_bars_values)
        filtered_values: np.ndarray = self.operator(values, self.ref_value)
        percentage = filtered_values.sum()/len(selected_bars_values)
        self.lines.result[0] = percentage
        
        # debug
        if 0:
            print(f"{current_datetime}: {values}")
            print(f"{current_datetime}: {filtered_values}")
            print(f"{current_datetime}: {percentage}")
            print(f"{current_datetime}: {self.lines.input}")
            print()


