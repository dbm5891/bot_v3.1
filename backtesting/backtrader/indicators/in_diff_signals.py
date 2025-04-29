import backtrader as bt

class DiffSignals(bt.Indicator):
    lines = ('diff', 'zero', 'input0', 'input1',)

    # plotinfo = dict(subplot=False)
    plotlines = dict(
        input0=dict(_plotskip=True),
        input1=dict(_plotskip=True),
    )



    # implement indicator in __init__() OR next(). not both.
    def __init__(self, input0, input1):

        # self.input0 = input0 
        # self.lines.input0 = input0 # used in next() method to access current value (otherwise, we get only the last value in series in next())
        # self.lines.input1 = input1 # used in next() method to access current value (otherwise, we get only the last value in series in next())
        
        self.lines.zero = bt.LineNum(0.0)
        self.lines.diff = input0 - input1
        


    def next(self):
        return
    
        # Set the 'zero' line to always be 0.0
        self.lines.zero[0] = 0.0

        # Calculate the difference line
        self.lines.diff[0] = self.lines.input0[0] - self.lines.input1[0]



