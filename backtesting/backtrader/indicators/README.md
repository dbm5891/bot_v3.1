# Technical Indicators Guide

This directory contains custom technical indicators for use in your trading strategies. These indicators extend Backtrader's built-in indicator system and provide advanced analytical capabilities.

## Using Indicators in Your Strategy

To use an indicator in your Backtrader strategy:

```python
from indicators.indicator_name import IndicatorClass

class MyStrategy(bt.Strategy):
    def __init__(self):
        # Add the indicator to your strategy
        self.my_indicator = IndicatorClass(self.data, param1=value1, param2=value2)
        
    def next(self):
        # Access indicator values
        current_value = self.my_indicator[0]  # Current value
        previous_value = self.my_indicator[-1]  # Previous value
```

## Available Indicators

### Trend Indicators

- **MovingAverageCrossover** - Detects crossovers between two moving averages
- **MACD** - Moving Average Convergence Divergence with customizable parameters
- **DirectionalMovement** - ADX, +DI, -DI indicators for trend strength and direction

### Volatility Indicators

- **BollingerBands** - Calculates upper and lower bands based on price volatility
- **ATR** - Average True Range for measuring market volatility
- **KeltnerChannels** - Alternative volatility bands using ATR

### Momentum Indicators

- **RSI** - Relative Strength Index for overbought/oversold conditions
- **Stochastic** - Stochastic oscillator with %K and %D lines
- **MomentumOscillator** - Rate of change in price movement

### Volume Indicators

- **OnBalanceVolume** - Cumulative volume indicator that relates volume to price change
- **VolumeWeightedAveragePrice** - VWAP calculation for intraday analysis
- **ChaikinMoneyFlow** - Measures buying and selling pressure

### Custom Composite Indicators

- **TripleScreenSystem** - Implementation of Alexander Elder's Triple Screen trading system
- **TrendConfirmation** - Combines multiple indicators to confirm trend direction
- **VolatilityBreakout** - Detects breakouts from low volatility periods

## Creating Your Own Indicators

To create a custom indicator:

1. Create a new Python file in this directory
2. Subclass `bt.Indicator`
3. Define your indicator's lines and parameters
4. Implement the calculation logic

Example template:

```python
import backtrader as bt

class MyCustomIndicator(bt.Indicator):
    """
    Description of what your indicator does
    
    Formula:
    - Explain the calculation
    
    Parameters:
    - param1: Description
    - param2: Description
    """
    # Define the output lines
    lines = ('line1', 'line2',)
    
    # Define parameters with defaults
    params = (
        ('period', 14),
        ('factor', 2.0),
    )
    
    def __init__(self):
        # Perform any initialization here
        self.addminperiod(self.params.period)  # Minimum required periods
    
    def next(self):
        # Calculate indicator values for the current period
        self.lines.line1[0] = ...  # Your calculation
        self.lines.line2[0] = ...  # Your calculation
```

## Testing Indicators

Before using a new indicator in a live strategy, test it thoroughly:

1. Calculate the indicator values on historical data
2. Compare with known implementations from other libraries (e.g., TA-Lib)
3. Visualize the indicator against price to confirm it behaves as expected

## Advanced Features

### Multi-Timeframe Indicators

Some indicators support multi-timeframe analysis:

```python
# Example usage
self.daily_rsi = RSI(self.data1, period=14)  # data1 is a daily timeframe
```

### Indicator Combinations

You can combine indicators to create more complex signals:

```python
# Example of combining RSI and Bollinger Bands
class RSIWithBollinger(bt.Indicator):
    lines = ('signal',)
    params = (('rsi_period', 14), ('bb_period', 20), ('bb_dev', 2.0))
    
    def __init__(self):
        self.rsi = bt.indicators.RSI(self.data, period=self.params.rsi_period)
        self.bb = bt.indicators.BollingerBands(self.data, 
                                               period=self.params.bb_period,
                                               devfactor=self.params.bb_dev)
        
        # Signal is 1 when RSI < 30 and price is below lower band
        # Signal is -1 when RSI > 70 and price is above upper band
        # Signal is 0 otherwise
        self.lines.signal = bt.If(
            bt.And(self.rsi < 30, self.data.close < self.bb.lines.bot),
            1,
            bt.If(
                bt.And(self.rsi > 70, self.data.close > self.bb.lines.top),
                -1,
                0
            )
        )
```

## Related Documentation

- [Strategy Development Guide](../STRATEGY_DEVELOPMENT.md)
- [Multiple Timeframe Analysis](../MULTIPLE_TIMEFRAME_ANALYSIS.md)
- [Machine Learning Integration](../MACHINE_LEARNING_INTEGRATION.md)