# Data Preparation Guide

This document provides a comprehensive guide to preparing market data for use in the Bot v3.1 backtesting framework.

## Overview

Proper data preparation is crucial for accurate backtesting. This guide covers:

1. Acquiring market data
2. Converting it to the required format
3. Adding technical indicators
4. Preparing it for different timeframes
5. Validating data quality

## Data Sources

The system uses several data sources:

- **TD Ameritrade API**: Real-time and historical data (primary source)
- **CSV Files**: Pre-downloaded historical data (included in the repository)
- **Polygon.io**: Alternative data source (testing implementations available)

## File Format Requirements

The backtesting framework expects data in a specific format:

- CSV files with standardized column names
- Proper datetime formatting
- Required columns: Open, High, Low, Close, Volume
- Optional: additional columns for pre-calculated indicators

## Data Preparation Workflow

### 1. Initial Data Acquisition

Data can be acquired using:

```bash
# For TD Ameritrade data recording
cd c:\Users\dbm58\bot_v3.1
python scripts\run_record_quotes.py
```

Or by using pre-downloaded data from the `backtesting/csv_input` directory.

### 2. Basic Data Preparation

Run the base preparation script:

```bash
python backtesting\backtrader\dfs_prepare.py
```

This script:
- Loads CSV data from `backtesting/csv_input/`
- Converts date formats
- Sets proper indexing
- Performs basic data cleaning (handling NaN values)
- Optionally filters data to a specific time range

### 3. Adding Technical Indicators

For 5-minute timeframe data:

```bash
python backtesting\backtrader\dfs_set_ta_indicators_5m.py
```

For daily timeframe data:

```bash
python backtesting\backtrader\dfs_set_ta_indicators_1D.py
```

These scripts add various technical indicators to the data, including:
- Moving averages (SMA, EMA, GMA)
- Relative strength indicators
- Volatility measures
- Custom indicators

### 4. Multi-Timeframe Data Preparation

When working with multiple timeframes (e.g., 5min and daily):

1. Prepare both datasets separately
2. Ensure date ranges align properly
3. Use `dfs_prepare.py` with appropriate settings for each timeframe

### 5. Data Validation

Verify data integrity before backtesting:

```bash
# Check for missing values or data artifacts
python backtesting\backtrader\df_test.py
```

Additional validation can be performed using visualization tools:

```bash
# Visualize candlesticks to check for data anomalies
python backtesting\backtrader\dfs_plot_mpf_candles.py
```

## Creating Standardized CSV Files

For converting data from other sources to the required format:

```bash
python ta\create_standard_csv_for_backtrader.py
```

This script ensures data compatibility with the Backtrader framework.

## Handling Different Symbols

The system supports multiple symbols (e.g., AAPL, AMD, TSLA). To switch symbols:

1. Edit the `filename` variable in `dfs_prepare.py`:
```python
# For AAPL
filename="aapl_5m_2022-05-09_to_2023-07-12.csv"

# For AMD
# filename="amd_5m_2022-05-09_to_2023-07-12.csv"

# For TSLA
# filename="TSLA_5m_2022-05-09_to_2023-07-12.csv"
```

2. Run the data preparation script
3. Verify data loaded correctly

## Custom Indicators

To add custom indicators to the data preparation process:

1. Define custom indicators in `backtesting/backtrader/pandas_ta_custom_indicators.py`
2. Import and apply them in the appropriate `dfs_set_ta_indicators_*.py` file

## Data Storage and Management

- Processed data is typically stored in memory during the backtesting process
- Output files from backtests are saved to `backtesting/outputs/`
- The original data files should be preserved unchanged in `backtesting/csv_input/`

## Best Practices

1. **Date Range Selection**: Choose meaningful date ranges that include different market conditions
2. **Data Frequency**: Match data frequency to your trading strategy timeframe
3. **Forward-Fill**: Handle missing data with forward fill rather than interpolation
4. **Symbol Consistency**: Ensure symbol consistency between data preparation and backtesting
5. **Indicator Calculation**: Calculate indicators during preparation rather than during backtesting for efficiency