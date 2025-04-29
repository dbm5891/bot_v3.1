import backtrader as bt


class FindSequences(bt.Indicator):
    
    lines = ('sequence', 'input',) # must receive input indicator as line, so we can access current value in next() method. (otherwise, we get only the last value in series in next())


    plotlines = dict(
        input=dict(_plotskip=True)
    )


    def __init__(self, input_indicator):

        self.input_indicator = input_indicator 
        self.lines.input = input_indicator # used in next() method to access current value (otherwise, we get only the last value in series in next())
        
        self.start = 0 # current sequence start index

    
    def next(self):

        # start index of the first sequence
        if len(self)==1:
            self.lines.sequence[0] = self.start
        
        elif self.lines.input[0] != self.lines.input[-1]:
            self.start = len(self)-1 # new sequence begins (save current bar index)

        self.lines.sequence[0] = self.start # set bar's current sequence start index

        # print(self.lines.input[0], self.lines.sequence[0])

   