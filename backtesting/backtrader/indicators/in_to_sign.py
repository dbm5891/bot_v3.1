import backtrader as bt


class ToSign(bt.Indicator):
    
    lines = ('tosign', 'input',) # must receive input indicator as line, so we can access current value in next() method. (otherwise, we get only the last value in series in next())


    plotlines = dict(
        input=dict(_plotskip=True)
    )


    def __init__(self, input_indicator):

        self.input_indicator = input_indicator 
        self.lines.input = input_indicator # used in next() method to access current value (otherwise, we get only the last value in series in next())
   

    
    def next(self):

        if self.lines.input[0] > 0:
            self.lines.tosign[0] = 1.0
        else:
            self.lines.tosign[0] = -1.0

        # print(self.lines.input[0], self.lines.tosign[0])

   