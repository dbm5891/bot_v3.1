# Troubleshooting Guide

This guide provides solutions for common issues when using the Bot v3.1 trading and backtesting system.

## Backtesting Issues

### No Trades Being Generated

If your backtest runs without errors but doesn't generate any trades:

1. **Check Strategy Logic**
   - Ensure your buy/sell conditions are being triggered
   - Add debug print statements to verify signal values
   - Example: `print(f"Date: {bt.num2date(self.data.datetime[0])}, Signal value: {self.my_signal[0]}")`

2. **Data Range Issues**
   - Verify your data covers the expected time period
   - Check for misaligned dates between different timeframes
   - Solution: Use `print_df_index_range(df_5m)` to verify date ranges

3. **Indicator Calculation**
   - Some indicators require a warmup period before generating valid values
   - Make sure you're checking for valid indicator values before trading
   - Solution: Add lookback period checks, e.g., `if len(self.data) > self.params.sma_period:`

### Unrealistic Performance

If backtesting shows suspiciously good performance:

1. **Look-Ahead Bias**
   - Check if your strategy uses future data (even accidentally)
   - Example problem: Using daily close prices for intraday decisions
   - Fix: Ensure proper data alignment and indexing

2. **Overfitting**
   - Strategy may be too optimized for historical data
   - Test on out-of-sample data periods not used for development
   - Use statistical analysis tools to check robustness

3. **Transaction Costs**
   - Ensure commissions and slippage are properly configured
   - Add to backtrader setup: `cerebro.broker.setcommission(commission=0.001)` (0.1%)

### Data Errors

Common data-related issues:

1. **Missing or NaN Values**
   - Check for data gaps: `df.isna().sum()`
   - Fix with appropriate filling: `df.fillna(method='ffill')`
   - Or filter out problematic dates

2. **Time Zone Inconsistencies**
   - Ensure all data sources use the same time zone
   - Check for daylight saving time issues
   - Solution: Standardize to UTC and convert as needed

3. **Duplicate Timestamps**
   - Find duplicates: `df[df.index.duplicated()]`
   - Fix: `df = df[~df.index.duplicated(keep='first')]`

## Visualization Issues

### Charts Not Displaying Correctly

1. **Missing or Incomplete Plots**
   - Check for library conflicts
   - Update matplotlib: `pip install matplotlib --upgrade`
   - Try different backend: `import matplotlib; matplotlib.use('TkAgg')`

2. **Indicator Alignment Problems**
   - Ensure indicators and price data have the same index
   - Check for length mismatches between data series
   - Use `len(self.data)` vs `len(self.indicator)` to verify

3. **Custom Indicator Plotting**
   - When plotinfo attributes are not set correctly
   - Fix with proper configuration:
     ```python
     class MyIndicator(bt.Indicator):
         lines = ('signal',)
         plotinfo = dict(plot=True, subplot=False, plotname="My Signal")
         plotlines = dict(signal=dict(color='green', width=1))
     ```

## Strategy Implementation Issues

### Parameter Optimization Problems

1. **Excessive Runtime**
   - Reduce parameter combinations
   - Use smarter search algorithms
   - Parallelize the optimization: `cerebro.run(maxcpus=4)`

2. **Inconsistent Results**
   - Set a fixed random seed for reproducibility
   - Check for data leakage between optimization and testing
   - Solution: `random.seed(42)` and `numpy.random.seed(42)`

### Memory Issues

1. **Out of Memory Errors**
   - Reduce data size or timeframe
   - Process data in chunks
   - Free memory after heavy computations: `import gc; gc.collect()`

2. **Slow Performance**
   - Profile your code: `import cProfile; cProfile.run('function_to_profile()')`
   - Pre-calculate indicators where possible instead of computing them during backtesting
   - Reduce lookback periods if appropriate

## TD Ameritrade API Issues

### Authentication Problems

1. **API Connection Errors**
   - Check credentials and token expiration
   - Verify network connectivity
   - Implement proper token refresh logic

2. **Rate Limiting**
   - Implement retry logic with exponential backoff
   - Cache frequent requests
   - Space out API calls with `time.sleep()`

### Data Retrieval Issues

1. **Incomplete Data**
   - Check for gaps in retrieved data
   - Implement proper error handling for failed requests
   - Consider alternative data sources for the missing periods

2. **Symbol Mismatches**
   - Ensure consistent symbol format (e.g., with/without exchange prefix)
   - Create a symbol mapping dictionary if needed

## Technical Analysis Issues

### Indicator Inconsistencies

1. **Results Different from Other Platforms**
   - Check calculation methods - some platforms use different defaults
   - Verify price inputs (OHLC vs only close)
   - Check for adjusted vs. unadjusted prices

2. **Custom Indicator Bugs**
   - Add validation checks for input data
   - Test with simple, known data and verify results manually
   - Compare against established implementations

## File Management Issues

1. **CSV Output Errors**
   - Check file paths and permissions
   - Ensure directories exist: `os.makedirs(path, exist_ok=True)`
   - Handle file locking issues with try/except blocks

2. **Data Import Problems**
   - Verify file format and delimiters
   - Use explicit parameters: `pd.read_csv(file, delimiter=',', parse_dates=['date'])`
   - Check for byte order mark (BOM) in files

## Common Error Messages and Solutions

### "NoneType has no attribute 'append'"
- Usually indicates an uninitialized list or object
- Fix: Ensure all objects are properly initialized before use
- Example solution: `self.trades_info = []` in `__init__`

### "Index out of bounds"
- Trying to access data that doesn't exist
- Fix: Add boundary checks before accessing indexed data
- Example solution: `if len(self.data) > self.params.window:`

### "Object has no attribute 'lines'"
- Backtrader-specific error when trying to access indicators incorrectly
- Fix: Make sure to access indicator values properly
- Correct usage: `self.sma[0]` not `self.sma.lines[0]`

## Debugging Techniques

### Using Logging

```python
import logging
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    filename='backtest_debug.log')

# In strategy
def next(self):
    logging.debug(f"Processing bar at {self.data.datetime.datetime(0)} Close: {self.data.close[0]}")
```

### Monitoring Indicators

```python
def next(self):
    if self.buy_signal():
        # Log detailed signal information
        print(f"Buy signal at {bt.num2date(self.data.datetime[0])}")
        print(f"SMA values: Fast={self.fast_ma[0]:.2f}, Slow={self.slow_ma[0]:.2f}")
        print(f"RSI value: {self.rsi[0]:.2f}")
```

### Validating Order Execution

```python
def notify_order(self, order):
    if order.status in [order.Completed]:
        print(f"Order {order.ref} executed at price {order.executed.price:.2f}")
        print(f"Size: {order.executed.size}, Value: {order.executed.value:.2f}")
        print(f"Commission: {order.executed.comm:.2f}")
```

## Getting Help

If you encounter persistent issues:

1. Check existing documentation files:
   - [Data Preparation Guide](backtesting/DATA_PREPARATION.md)
   - [Strategy Development Workflow](backtesting/STRATEGY_DEVELOPMENT.md)
   - [Statistical Analysis Guide](backtesting/backtrader/STATISTICAL_ANALYSIS.md)

2. Review backtrader official documentation:
   - [Backtrader Documentation](https://www.backtrader.com/docu/)
   - [Backtrader Community](https://community.backtrader.com/)

3. Examine the output files in `backtesting/outputs/` for clues