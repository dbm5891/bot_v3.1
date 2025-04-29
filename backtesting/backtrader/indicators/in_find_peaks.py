import backtrader as bt
import numpy as np
from scipy.signal import find_peaks, peak_prominences

class FindPeaks(bt.Indicator):
    lines = ('peaks', 'signal', "peak_detected")

    params = (
        ('window_size', None),
        ('height', None),
        ('prominence', None),
        ('prominence_left_base', 0),
        ('distance', None), 
        ('find_valleys', False), 
        ('plot_color', "yellow"), 
    )

    plotinfo = dict(subplot=False)  # Ensure the indicator is plotted on the main chart
    plotlines = dict(
        peaks=dict(marker='o', markersize=12, color='yellow', markeredgecolor='black', linestyle='None'),
        signal=dict(linestyle='None'),
    )

    def __init__(self, signal_indicator):

        # Use the input indicator in the custom logic
        self.signal_indicator = signal_indicator
        self.lines.signal = signal_indicator 


        # Dynamically set the plot color based on the parameter
        self.plotlines.peaks.color = self.params.plot_color


    def log(self, txt=""):
        prefix=f"{self.data.datetime.datetime(0)}, (o={self.data.open[0]}, h={self.data.high[0]}, l={self.data.low[0]}, c={self.data.close[0]})"
        print(f"{prefix}: {txt}")


    def next(self):
        # default
        self.lines.peak_detected[0] = False

        
        if not self.params.window_size:
            # gather all values up to the current point
            window_size=len(self.lines.signal)
        else:
            window_size=self.params.window_size
        
        values = np.array(self.lines.signal.get(size=window_size)) # last n values

        
        # Find peaks using scipy.signal.find_peaks
        # peak_indices, _ = find_peaks(values, distance=self.params.distance)
        # peak_indices, properties = find_peaks(values, prominence=self.params.prominence)
        
        if self.params.find_valleys:
            values*=-1

        peak_indices, _ = find_peaks(values)
        prominences, left_bases, right_bases = peak_prominences(values, peak_indices)
        # properties=prominences
        
        # print(values, peak_indices)

        # filter peaks based on left-base prominence
        # prominence: looks leaf and right. but right has no data yet, so it doesn't work.
        # we need to consider only left prominence for filtering peaks.

        left_prominence = np.array(values)[peak_indices] - np.array(values)[left_bases]  # Proper indexing
        left_only_peaks = peak_indices[left_prominence >= self.params.prominence_left_base]

        if left_only_peaks.size==0:
            return

        # Check if the current index is a peak
        # if peak_indices[-1] == (window_size-2):
        #     pass

        if left_only_peaks[-1] == (window_size-2):
            # self.lines.peaks[-1] = self.data.close[-1] # the peak
            # self.lines.peaks[-1] = self.data.high[-1] # the peak
            # self.lines.peaks[-1] = self.zlema_zlema[-1] # the peak
            self.lines.peaks[-1] = self.lines.signal[-1] # the peak
            self.lines.peak_detected[0] = True
            # self.lines.peaks[-1] = self.zlema[-1] # the peak
            # self.lines.peaks[0] = self.zlema[0] # the bar we detected the peak
            
            # debug
            if 0:
                if self.params.find_valleys:
                    self.log("found valley")
                else:
                    self.log("found peak")
            
            # print(values)
            # print(peak_indices)
            # print(properties)
            # print(left_only_peaks)
            # print()
            
        else:
            self.lines.peaks[-1] = np.nan
            # self.lines.peaks[0] = 100
            # print("np.nan")