# Multiple Timeframe Analysis

This guide explains how to implement and use multiple timeframe analysis in the Bot v3.1 backtesting framework.

## Overview

Multiple timeframe analysis (MTA) is a powerful technique that combines data from different timeframes to improve trading decisions. For example, using daily charts to determine overall trend direction and 5-minute charts for entry timing.

The Bot v3.1 system supports MTA through:
- Parallel data loading of different timeframe data
- Cross-timeframe signals and indicators
- Synchronized backtesting across timeframes

## Benefits of Multiple Timeframe Analysis

1. **Trend Confirmation**: Using higher timeframes to confirm trends before entering positions
2. **Better Entry Points**: Using lower timeframes for precise entries
3. **Reduced Noise**: Filtering out market noise by validating signals across timeframes
4. **Improved Risk Management**: Setting stops based on volatility in higher timeframes

## Implementation in Bot v3.1

### 1. Data Preparation

Prepare datasets for both timeframes:

```bash
# First prepare daily data
python backtesting\backtrader\dfs_prepare.py
python backtesting\backtrader\dfs_set_ta_indicators_1D.py

# Then prepare 5-minute data
python backtesting\backtrader\dfs_prepare.py
python backtesting\backtrader\dfs_set_ta_indicators_5m.py
```

Ensure both datasets cover the same date range for proper synchronization.

### 2. Configuring Multiple Data Feeds in Backtrader

In the `run_bt_v1.1.py` script, you need to enable both data feeds:

```python
# Enable 5-minute data
data_5m = bt.feeds.PandasData(
    dataname=df_5m, 
    timeframe=bt.TimeFrame.Minutes,
    compression=5,
)
data_5m._name = df_5m.iloc[0]["symbol"]
cerebro.adddata(data_5m)

# Enable daily data (uncomment and use)
data_1d = bt.feeds.PandasData(dataname=df_1d)
data_1d._name = df_1d.iloc[0]["symbol"]
cerebro.adddata(data_1d)

# Ensure both datasets represent the same symbol
if (data_5m._name != data_1d._name):
    raise ValueError("dataframes must represent same symbol.")
```

### 3. Creating MTA Strategies

When implementing a strategy that uses multiple timeframes:

```python
import backtrader as bt

class MultiTimeframeStrategy(bt.Strategy):
    params = (
        ('fast_period', 10),
        ('slow_period', 30),
    )
    
    def __init__(self):
        # 5-minute data (first data in the system)
        self.data_5m = self.datas[0]
        
        # Daily data (second data in the system)
        self.data_1d = self.datas[1]
        
        # 5-minute indicators
        self.sma_fast_5m = bt.indicators.SMA(self.data_5m.close, period=self.params.fast_period)
        
        # Daily indicators
        self.sma_slow_1d = bt.indicators.SMA(self.data_1d.close, period=self.params.slow_period)
        
        # Store the current day for synchronization
        self.current_day = bt.num2date(self.data_5m.datetime[0]).date()
    
    def next(self):
        # Get the current bar's date
        current_date = bt.num2date(self.data_5m.datetime[0]).date()
        
        # Check if we've moved to a new day
        if current_date != self.current_day:
            self.current_day = current_date
            # Perform any daily updates
            
        # Multi-timeframe trading logic
        # Only trade if daily trend is up (daily close > daily SMA)
        daily_trend_is_up = False
        
        # Check if daily data is aligned with current 5m bar date
        if self.data_1d.datetime.date(0) == current_date:
            daily_trend_is_up = self.data_1d.close[0] > self.sma_slow_1d[0]
            
        # If daily trend is up, look for entries on 5-minute chart
        if daily_trend_is_up:
            # 5-minute entry logic
            if self.sma_fast_5m[-1] < self.data_5m.close[-1] and self.sma_fast_5m[0] > self.data_5m.close[0]:
                self.buy()
```

### 4. Synchronization Considerations

When working with multiple timeframes, proper synchronization is crucial:

1. **Date Alignment**: Ensure the higher timeframe data point corresponds to the correct date
2. **Data Availability**: Check if the higher timeframe data is available for the current bar
3. **Time Zone Consistency**: Ensure both datasets use the same time zone

### 5. Example Use Cases

#### Trend-Following with Multiple Timeframes

```python
# Determine trend direction on daily chart
daily_trend_up = self.data_1d.close[0] > self.sma_50_1d[0]

# Enter trades only in the direction of the daily trend
if daily_trend_up:
    # Look for 5-minute buying opportunities
    if self.rsi_5m[0] < 30 and self.rsi_5m[-1] < self.rsi_5m[0]:  # RSI oversold and rising
        self.buy()
else:
    # Look for 5-minute selling opportunities
    if self.rsi_5m[0] > 70 and self.rsi_5m[-1] > self.rsi_5m[0]:  # RSI overbought and falling
        self.sell()
```

#### Support/Resistance from Higher Timeframes

```python
# Calculate support/resistance levels from daily chart
daily_pivot = (self.data_1d.high[-1] + self.data_1d.low[-1] + self.data_1d.close[-1]) / 3
daily_support = 2 * daily_pivot - self.data_1d.high[-1]
daily_resistance = 2 * daily_pivot - self.data_1d.low[-1]

# Use levels for 5-minute trading
close_price = self.data_5m.close[0]

# Buy near daily support
if close_price < daily_support * 1.01:  # Within 1% of support
    self.buy()
    
# Sell near daily resistance
if close_price > daily_resistance * 0.99:  # Within 1% of resistance
    self.sell()
```

## Best Practices for Multiple Timeframe Analysis

1. **Hierarchical Approach**: Use higher timeframes for strategic decisions and lower timeframes for tactical execution
2. **Consistent Ratio**: Use timeframes with consistent ratios (e.g., 1-day to 4-hour to 1-hour)
3. **Data Alignment**: Ensure proper alignment between timeframes
4. **Performance Optimization**: Be mindful of increased computational requirements when using multiple timeframes
5. **Selective Indicators**: Not all indicators need to be calculated on all timeframes

## Common Pitfalls to Avoid

1. **Look-ahead Bias**: Ensure you're not using future data from higher timeframes
2. **Over-optimization**: Avoid curve-fitting across multiple timeframes
3. **Signal Conflicts**: Establish clear rules for resolving conflicting signals across timeframes
4. **Overtrading**: Using too many timeframes can lead to confusion and overtrading

## Advanced Techniques

### Adaptive Timeframe Selection

```python
# Adjust timeframe based on volatility
if self.data_1d.atr[0] > self.data_1d.atr.mean() * 1.5:
    # In high volatility, use wider stops from daily chart
    self.stop_loss = self.data_1d.low[0]
else:
    # In low volatility, use tighter stops from 5-minute chart
    self.stop_loss = self.data_5m.low[0] - self.data_5m.atr[0]
```

### Timeframe Confluence

```python
# Check for signal confluence across timeframes
bullish_daily = self.sma_fast_1d[0] > self.sma_slow_1d[0]
bullish_5min = self.sma_fast_5m[0] > self.sma_slow_5m[0]
bullish_rsi_5min = self.rsi_5m[0] > 50

# Only enter when multiple timeframes align
if bullish_daily and bullish_5min and bullish_rsi_5min:
    self.buy()
```

## Conclusion

Multiple timeframe analysis adds a powerful dimension to your trading strategies by combining the trend identification ability of higher timeframes with the precision entry/exit capabilities of lower timeframes. The Bot v3.1 framework provides all the necessary tools to implement sophisticated multi-timeframe strategies with proper synchronization and data management.

## Related Documentation

- [Data Preparation Guide](DATA_PREPARATION.md)
- [Strategy Development Workflow](STRATEGY_DEVELOPMENT.md)
- [Statistical Analysis Guide](backtrader/STATISTICAL_ANALYSIS.md)