import backtrader as bt

class DiffPlot(bt.Indicator):
    # lines = ('input', 'above', 'below', 'na')
    lines = ('above', 'below', 'na')

    params = (
        ('threshold', 0.0),
    )
    plotinfo = dict(subplot=False)
    plotlines = dict(
        # input=dict(_plotskip=True),
        above=dict(color='green', marker='o'),
        below=dict(color='red', marker='o'),
        na=dict(color='grey', marker='o'),
    )


    def __init__(self, input_indicator):

        # self.lines.input = input_indicator 
        self.input_indicator = input_indicator 
        
        # used for plot
        self.lines.above = bt.If(self.input_indicator > self.params.threshold, self.input_indicator.lines.diff, float('nan'))
        self.lines.below = bt.If(self.input_indicator < -self.params.threshold, self.input_indicator.lines.sma, float('nan'))
        self.lines.na = bt.If(abs(self.input_indicator) < self.params.threshold, self.input_indicator.lines.sma, float('nan'))



