# Backtrader Backtesting System

## Overview

This backtesting system uses the Backtrader framework to test trading strategies on historical market data. It processes 5-minute candlestick data across multiple stocks and trading days, evaluates strategy performance, and generates comprehensive performance metrics.

## Features

- Test trading strategies against historical 5-minute stock data
- Process multiple symbols and trading days
- Generate detailed performance metrics and trade summaries
- Export results to CSV files for further analysis
- Visualization of trading signals and price action

## Installation

### Prerequisites

- Python 3.8+
- Required packages:

  ```
  backtrader>=1.9.78
  pandas
  numpy
  matplotlib
  pytz
  ```

### Setup

1. Clone this repository
2. Install the required packages:

   ```
   pip install -r requirements.txt
   ```

## Data Format

The system expects 5-minute candlestick data in CSV format with the following columns:

- timestamp (datetime)
- open, high, low, close (price data)
- volume
- symbol (ticker symbol)

Example file path: `data_2020_2025/by_dates/503symbols_2022-05.csv`

## Usage

### Basic Usage

```python
python backtesting/backtrader/run_bt_v2.py
```

### Command-Line Arguments

The backtesting script supports various command-line arguments to customize execution without modifying the code:

#### Symbol Selection
```
--symbols AAPL MSFT NVDA       # Test specific symbols
--symbols5                      # Use predefined list of 5 major stocks
--symbols32                     # Use predefined list of 32 S&P 500 stocks
--all-symbols                   # Use all available symbols (default)
```

#### Date Range
```
--start-date 2022-05-01        # Start backtesting from this date
--end-date 2022-05-15          # End backtesting on this date
```

#### Strategy Selection
```
--strategy linear_regression    # Use linear regression strategy (default)
--strategy time_based           # Use time-based strategy
```

#### Visualization
```
--no-plot                       # Disable chart plotting
```

#### Price Filtering
```
--price-threshold 100.0         # Skip stocks with price above this value (default: 500.0)
```

#### Output Options
```
--output-file results.csv       # Save results to custom file location
--verbose                       # Enable detailed output
```

### Customizing the Backtest

To customize the backtest programmatically, modify the following in `run_bt_v2.py`:

1. **Symbol Selection**:

   ```python
   # Use all symbols in the dataset
   symbols = df_date["symbol"].unique()
   
   # Or use a predefined list
   # symbols = symbols5  # ["AAPL", "MSFT", "NVDA", "AMZN", "TSLA"]
   # symbols = symbols32  # Top 32 S&P 500 symbols
   # symbols = ["AAPL"]  # Single symbol
   ```

2. **Strategy Selection**:

   ```python
   cerebro_run(
       df=filtered_df,
       strategy=StrategyEachBar_Long_LR,  # Change strategy here
       # plot=False,  # Toggle visualization
   )
   ```

## Available Strategies

### StrategyEachBar_Long_LR

A trend-following strategy that uses linear regression to identify trend direction:

- Enters long positions when the linear regression slope is positive
- Confirms trends using percentage thresholds
- Trades only during specific market hours (14:15-19:45 UTC)
- Monitors daily candle patterns for additional confirmation

### Strategy18to19

A time-based strategy focusing on trading during a specific hour of the market session.

## Output

The backtester generates:

1. **Console Output**:
   - Trade execution details
   - Daily performance summaries
   - Overall performance metrics

2. **CSV Export**:
   - Detailed trade list saved to `backtesting/outputs/` directory
   - Includes entry/exit times, prices, P&L, and more

3. **Visualizations** (when plotting is enabled):
   - Price charts with entry/exit points
   - Technical indicators used by the strategy

## Performance Metrics

- Total number of trades
- Win rate (percentage)
- Profit/loss (total and average)
- Profit factor
- Maximum drawdown
- Return on investment

## Advanced Configuration

### Time Zones

The system uses UTC time for all data processing. Market session times are defined as:

- Pre-market: 08:00-13:30 UTC
- Regular Trading Hours (RTH): 13:30-20:00 UTC
- After-hours: 20:00-00:00 UTC

### Strategy Parameters

Strategy parameters can be customized in the respective strategy files:

- `backtesting/backtrader/strategies/st_each_bar_long_lr.py`
- `backtesting/backtrader/strategies/st_time.py`

## Examples

### Example 1: Running a Backtest on AAPL for May 2022

```bash
python backtesting/backtrader/run_bt_v2.py --symbols AAPL --start-date 2022-05-01 --end-date 2022-05-31
```

### Example 2: Testing Multiple Symbols with Visualization

```bash
python backtesting/backtrader/run_bt_v2.py --symbols5 --strategy linear_regression
```

### Example 3: Running a Quick Test without Plotting

```bash
python backtesting/backtrader/run_bt_v2.py --symbols MSFT NVDA --no-plot --price-threshold 200
```

### Example 4: Saving Results to a Custom File

```bash
python backtesting/backtrader/run_bt_v2.py --symbols32 --output-file my_backtest_results.csv
```

## Extending the System

### Creating a New Strategy
1. Create a new file in `backtesting/backtrader/strategies/`
2. Extend the `StrategyBase` class
3. Implement the `__init__` and `next` methods
4. Import and use your strategy in `run_bt_v2.py`

## Troubleshooting
- Ensure data files are in the correct format and location
- Check timezone settings if trades are not executing at expected times
- For memory issues with large datasets, try processing fewer symbols or trading days