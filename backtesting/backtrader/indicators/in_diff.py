import backtrader as bt

class Diff(bt.Indicator):
    lines = ('diff', 'zero', 'input',)

    params = (
        ('periods', 1),  # Lookback period for diff
    )
    # plotinfo = dict(subplot=False)
    plotlines = dict(
        input=dict(_plotskip=True)
    )



    # implement indicator in __init__() OR next(). not both.
    def __init__(self, input_indicator):

        self.input_indicator = input_indicator 
        self.lines.input = input_indicator # used in next() method to access current value (otherwise, we get only the last value in series in next())
        
        self.lines.zero = bt.LineNum(0.0)
        self.lines.diff = self.input_indicator(0) - self.input_indicator(-self.params.periods)
        


    def next(self):
        return
    
        # Set the 'zero' line to always be 0.0
        self.lines.zero[0] = 0.0

        # Calculate the difference line
        # self.lines.diff[0] = self.input_indicator[0] - self.input_indicator[-self.params.periods]
        self.lines.diff[0] = self.lines.input[0] - self.lines.input[-self.params.periods]



