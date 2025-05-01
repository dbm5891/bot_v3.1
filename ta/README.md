# Technical Analysis (TA) Tools

This directory contains the technical analysis components of the Bot v3.1 trading system, with a focus on indicator implementation and comparison.

## Overview

The TA module provides:

- Integration with pandas-ta library for technical indicators
- Custom indicator development and implementation
- Tools for comparing different indicator lists and settings
- Utilities for creating standard CSV formats for the backtesting framework

## Key Files

- **create_standard_csv_for_backtrader.py**: Converts raw data into a standardized format for the Backtrader framework
- **lists_compare_func.py**: Core functions for comparing different technical indicator combinations
- **lists_compare34_pandas_ta_*.py**: Various versions of pandas-ta indicator comparison scripts
- **lists_compare34_pandas_ta_custom_indicators.py**: Implementation of custom technical indicators

## Available Indicators

The technical analysis module includes support for:

1. **Trend Indicators**:
   - Moving Averages (SMA, EMA, WMA, HMA)
   - MACD (Moving Average Convergence Divergence)
   - ADX (Average Directional Index)
   - Linear Regression

2. **Momentum Indicators**:
   - RSI (Relative Strength Index)
   - Stochastic Oscillator
   - CCI (Commodity Channel Index)
   - MFI (Money Flow Index)

3. **Volatility Indicators**:
   - Bollinger Bands
   - ATR (Average True Range)
   - Standard Deviation

4. **Volume Indicators**:
   - OBV (On-Balance Volume)
   - Volume SMA
   - Chaikin Money Flow

## Custom Indicators

The framework allows for the creation of custom indicators not available in standard libraries. These are defined in the `lists_compare34_pandas_ta_custom_indicators.py` file.

## Usage

To compare different indicator combinations:

```bash
python ta\lists_compare34_pandas_ta.py
```

To generate standardized CSV files for backtesting:

```bash
python ta\create_standard_csv_for_backtrader.py
```

## Integration with Backtesting

The technical analysis tools integrate with the backtesting framework by:

1. Generating indicator values for historical data
2. Creating standardized formats for Backtrader consumption
3. Supporting multi-timeframe analysis (1D, 5m, etc.)
4. Enabling indicator parameter optimization