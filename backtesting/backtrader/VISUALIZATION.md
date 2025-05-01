# Visualization Tools

This document provides an overview of the visualization tools available in the Bot v3.1 backtesting framework.

## Overview

The backtesting framework includes multiple visualization scripts to analyze different aspects of trading strategy performance and market data. These tools enable:

- Candlestick chart visualization with technical indicators
- Performance metrics plotting
- Position and trade entry/exit visualization
- Drawdown analysis
- Order execution monitoring

## Key Visualization Scripts

### Candlestick and Price Charts

- **dfs_plot_mpf_candles.py**: Renders professional-grade candlestick charts with technical indicators using `mplfinance`
- **dfs_plot.py**: Basic price plotting functionality
- **dfs_plot1.py**: Enhanced price plotting with additional features

### Strategy Performance

- **dfs_plot2_positions.py**: Visualizes position entries and exits on price charts
- **dfs_plot2_drawdown.py**: Plots equity curves and drawdown analysis
- **dfs_plot2.py**: General performance visualization
- **dfs_plot2_column.py** and **dfs_plot2_column1.py**: Specialized column data visualization

### Technical Analysis Visuals

- **dfs_plot1_diff.py**: Plots differences between indicators
- **dfs_plot2_true_range.py**: Visualizes true range (volatility) indicators

### Trade Analysis

- **dfs_plot3_orders_list.py**: Visualizes orders executed by the strategy
- **dfs_plot3_orders_pairs.py**: Shows paired orders (entry/exit) on price charts
- **dfs_plot3.py**: General trade analysis visualization

## Usage

To run visualization tools, first complete a backtest and then execute the desired visualization script:

```bash
# Run a backtest
python backtesting\backtrader\run_bt_v1.1.py

# Visualize positions
python backtesting\backtrader\dfs_plot2_positions.py

# Generate candlestick charts with indicators
python backtesting\backtrader\dfs_plot_mpf_candles.py
```

## Customization

Most visualization scripts accept parameters to customize the output:

- Time range selection
- Indicator selection
- Chart styling options
- Output file formats

These can be modified directly in the script files or passed as command-line arguments in more advanced implementations.

## Integration with Statistical Analysis

The visualization tools work in conjunction with the statistical analysis scripts:

- **df_test31_normal_distribution.py**
- **df_test32_normal_distribution.py**
- **df_test4_normal_distribution_1d.py**
- **df_test4_normal_distribution_5m.py**

These scripts generate statistical insights that can be visualized to better understand strategy performance and market behavior.