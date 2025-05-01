# Backtesting Framework

This directory contains the core backtesting framework for the Bot v3.1 trading system, built on the Backtrader library.

## Directory Structure

- **backtrader/**: Core backtesting implementation and strategy testing
- **csv_input/**: Historical price data for various securities

## Backtesting Framework

The backtesting framework allows you to:

1. Test trading strategies against historical market data
2. Apply various technical indicators to price data
3. Analyze performance metrics like profit/loss, win rate, and drawdowns
4. Visualize trade entries, exits, and equity curves

## Data Preparation

Before running backtests, data needs to be prepared with the appropriate indicators:

```bash
python backtesting\backtrader\dfs_prepare.py
python backtesting\backtrader\dfs_set_ta_indicators_5m.py  # For 5-minute data
python backtesting\backtrader\dfs_set_ta_indicators_1D.py  # For daily data
```

The `dfs_prepare.py` script loads CSV data files and prepares them for use in the backtesting framework. You can customize the date range by modifying the time_begin and time_end variables.

## Available Strategies

The framework includes numerous trading strategies in the `backtrader/strategies/` directory:

- Price action strategies
- Moving average based strategies
- Peak/valley detection strategies
- Linear regression strategies
- Time-based entry strategies
- Multi-timeframe strategies

## Running Backtests

To run a backtest with a specific strategy:

```bash
python backtesting\backtrader\run_bt_v1.1.py
```

You can modify the script to enable different strategies by uncommenting the corresponding `cerebro.addstrategy()` line.

## Visualization

After running a backtest, you can visualize the results using:

```bash
python backtesting\backtrader\dfs_plot2_positions.py  # Plot positions
python backtesting\backtrader\dfs_plot_mpf_candles.py  # Plot candles with indicators
python backtesting\backtrader\dfs_plot2_drawdown.py    # Plot drawdown
```

## Statistical Analysis

Several scripts are available for statistical analysis of trading strategies:

- `df_test31_normal_distribution.py`: Tests if returns follow a normal distribution
- `df_test4_normal_distribution_5m.py`: Normal distribution tests for 5-minute data
- `df_test4_normal_distribution_1d.py`: Normal distribution tests for daily data

## Output Files

Backtest results are saved to the `backtesting/outputs/` directory, including:
- Trade details
- Position information
- Order execution data