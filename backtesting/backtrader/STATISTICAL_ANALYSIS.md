# Statistical Analysis Tools

This document provides an overview of the statistical analysis tools available in the Bot v3.1 backtesting framework.

## Overview

The statistical analysis components of the backtesting framework enable:

- Testing returns for normal distribution patterns
- Analyzing strategy performance metrics
- Evaluating risk/reward characteristics
- Comparing different timeframes and instruments

## Key Statistical Analysis Scripts

### Normal Distribution Testing

- **df_test31_normal_distribution.py**: Basic normal distribution tests for trading returns
- **df_test32_normal_distribution.py**: Advanced normal distribution analysis
- **df_test4_normal_distribution_1d.py**: Normal distribution testing specific to daily timeframe data
- **df_test4_normal_distribution_5m.py**: Normal distribution testing specific to 5-minute timeframe data

### General Analysis Tools

- **df_test.py**, **df_test1.py**, **df_test2.py**, **df_test3.py**: Progressive development of testing frameworks
- **df_test5.py**: Advanced testing methodology

## Importance of Statistical Analysis

Statistical analysis provides critical insights for trading strategy development:

1. **Risk Assessment**:
   - Understanding the probability distribution of returns
   - Identifying outlier events and tail risks

2. **Strategy Validation**:
   - Testing if strategy performance is statistically significant
   - Avoiding strategies that may only perform well by chance

3. **Parameter Optimization**:
   - Identifying optimal parameter sets
   - Preventing overfitting through statistical validation

4. **Comparative Analysis**:
   - Comparing multiple strategies on the same data
   - Evaluating a single strategy across different instruments or timeframes

## Normal Distribution Testing

A key component of the statistical analysis is testing whether trading returns follow a normal distribution:

- If returns are normally distributed, standard statistical tools can be applied
- Non-normal distributions may require specialized risk management approaches
- Understanding the "fat tails" in return distributions is critical for managing extreme events

## Key Metrics Analyzed

The statistical analysis scripts evaluate:

- Mean return
- Standard deviation of returns
- Skewness and kurtosis
- Maximum drawdown
- Sharpe and Sortino ratios
- Win/loss ratios
- Profit factor

## Usage

To run a statistical analysis:

```bash
# For 5-minute data normal distribution testing
python backtesting\backtrader\df_test4_normal_distribution_5m.py

# For daily data normal distribution testing
python backtesting\backtrader\df_test4_normal_distribution_1d.py
```

## Integration with Backtesting

These tools are designed to work with the output from backtesting runs. Typically:

1. Run a backtest using `run_bt_v1.1.py`
2. Perform statistical analysis on the results
3. Use visualization tools to plot the statistical findings

This integrated approach ensures a comprehensive understanding of strategy performance beyond simple profit/loss metrics.