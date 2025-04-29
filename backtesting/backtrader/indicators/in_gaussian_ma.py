import backtrader as bt
import numpy as np

class GMA(bt.Indicator):
    """
    Gaussian Moving Average Indicator
    Similar to: df['close'].rolling(window=length, win_type='gaussian').mean(std=std)
    """
    lines = ('gaussian_ma',)
    params = (('period', 14), ('std', 3))
    plotinfo = dict(subplot=False)
    plotlines = dict(
        # gaussian_ma=dict(color='b'),
    )

    def __init__(self):
        # Precompute Gaussian weights
        self.weights = self._gaussian_weights(self.params.period, self.params.std)

    def _gaussian_weights(self, period, std):
        """Generate Gaussian weights for the rolling window."""
        half_window = (period - 1) / 2
        x = np.linspace(-half_window, half_window, period)
        kernel = np.exp(-0.5 * (x / std)**2)
        kernel /= np.sum(kernel)  # Normalize the weights
        return kernel

    def next(self):
        # Apply Gaussian weights to the rolling window
        if len(self.data) >= self.params.period:
            window = self.data.get(size=self.params.period)
            weighted_sum = sum(w * v for w, v in zip(self.weights, window))
            self.lines.gaussian_ma[0] = weighted_sum
        else:
            self.lines.gaussian_ma[0] = np.nan
