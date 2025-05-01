# Bot v3.1 Quickstart Guide

This guide provides step-by-step instructions for getting started with the Bot v3.1 algorithmic trading system. Follow these instructions to install, configure, and run your first backtest.

## 1. Installation

### Prerequisites

- Python 3.7 or higher
- Windows operating system (for full compatibility)
- Basic knowledge of Python and trading concepts

### Setup Steps

1. **Clone or download the repository**

2. **Install dependencies**

   ```bash
   cd c:\Users\dbm58\bot_v3.1
   pip install -r requirements.txt
   ```

3. **Verify installation**

   ```bash
   # Run a simple test to verify installation
   python backtesting\backtrader\df_test.py
   ```

## 2. Basic Workflow

The typical workflow using Bot v3.1 follows these steps:

```
Data Preparation → Strategy Development → Backtesting → Analysis → Refinement
```

## 3. Your First Backtest

### Step 1: Prepare Sample Data

We'll use the included AAPL sample data for your first backtest:

```bash
# Navigate to the project directory
cd c:\Users\dbm58\bot_v3.1

# Run data preparation script
python backtesting\backtrader\dfs_prepare.py
```

This will load the AAPL data (by default uses `aapl_5m_2022-05-09_to_2023-07-12.csv`).

### Step 2: Add Technical Indicators

```bash
# Add technical indicators to the data
python backtesting\backtrader\dfs_set_ta_indicators_5m.py
```

This enriches your data with various technical indicators needed for the strategies.

### Step 3: Run a Simple Backtest

```bash
# Run a backtest with a pre-configured strategy
python backtesting\backtrader\run_bt_v1.1.py
```

The default configuration in `run_bt_v1.1.py` uses a linear regression strategy on AAPL data. You'll see performance metrics in the console output and a chart will display the backtest results.

### Step 4: Analyze Results

```bash
# Visualize positions on the price chart
python backtesting\backtrader\dfs_plot2_positions.py

# Analyze drawdowns
python backtesting\backtrader\dfs_plot2_drawdown.py
```

These commands will generate visualization charts to help you understand the strategy's performance.

## 4. Customizing Your Strategy

### Modifying an Existing Strategy

1. Open `backtesting\backtrader\run_bt_v1.1.py`
2. Find the strategy section (around line 50):

```python
# Comment out the current strategy
# cerebro.addstrategy(StrategyEachBar_Long_LR, take_profit_usd=100.0, stop_loss_usd=100.0)

# Uncomment the strategy you want to test
cerebro.addstrategy(StrategySMAsCross)
```

3. Save and run the backtest again:

```bash
python backtesting\backtrader\run_bt_v1.1.py
```

### Creating Your Own Strategy

1. Create a new file in `backtesting\backtrader\strategies\`, for example `st_my_strategy.py`
2. Implement your strategy following the template:

```python
import backtrader as bt

class MyStrategy(bt.Strategy):
    params = (
        ('fast_period', 10),
        ('slow_period', 30),
    )
    
    def __init__(self):
        # Initialize indicators
        self.fast_ma = bt.indicators.SMA(self.data.close, period=self.params.fast_period)
        self.slow_ma = bt.indicators.SMA(self.data.close, period=self.params.slow_period)
        
        # Initialize tracking variables
        self.orders = []
        self.trades = []
        self.trades_info = []
        self.positions_info = []
    
    def next(self):
        # Simple moving average crossover strategy
        if self.fast_ma[-1] < self.slow_ma[-1] and self.fast_ma[0] > self.slow_ma[0]:
            self.buy()
        elif self.fast_ma[-1] > self.slow_ma[-1] and self.fast_ma[0] < self.slow_ma[0]:
            self.sell()
            
    # Add notification methods
    def notify_order(self, order):
        if order.status in [order.Completed]:
            self.orders.append(order)
            
    def notify_trade(self, trade):
        if trade.isclosed:
            self.trades.append(trade)
            
            # Store trade info for later analysis
            trade_info = (
                "MyStrategy",
                trade.ref,
                self.data._name,
                "LONG" if trade.history[0].event.size > 0 else "SHORT",
                "CLOSED",
                trade.open.dt,
                trade.close.dt,
                trade.history[0].event.size,
                trade.history[0].event.price,
                trade.history[1].event.price,
                trade.history[1].event.price - trade.history[0].event.price,
                ((trade.history[1].event.price / trade.history[0].event.price) - 1) * 100,
                trade.pnl,
            )
            self.trades_info.append(trade_info)
```

3. Update `run_bt_v1.1.py` to use your strategy:

```python
# Add your import
from strategies.st_my_strategy import MyStrategy

# Use your strategy
cerebro.addstrategy(MyStrategy, fast_period=5, slow_period=20)
```

## 5. Testing Different Securities

To run your strategy on a different security:

1. Open `backtesting\backtrader\dfs_prepare.py`
2. Modify the filename variable (around line 16):

```python
# Comment out current security
# filename="aapl_5m_2022-05-09_to_2023-07-12.csv"

# Uncomment the security you want to test
filename="AMD_5m_2022-05-09_to_2023-07-12.csv"
# filename="TSLA_5m_2022-05-09_to_2023-07-12.csv"
```

3. Run the data preparation and backtest:

```bash
python backtesting\backtrader\dfs_prepare.py
python backtesting\backtrader\dfs_set_ta_indicators_5m.py
python backtesting\backtrader\run_bt_v1.1.py
```

## 6. Multi-Timeframe Analysis

To use both 5-minute and daily data in your strategy:

1. In `run_bt_v1.1.py`, enable both data feeds by changing the `if 0:` to `if 1:`:

```python
if 1:
    data_1d = bt.feeds.PandasData(dataname=df_1d)
    data_1d._name = df_1d.iloc[0]["symbol"]
    cerebro.adddata(data_1d)

    if (data_5m._name != data_1d._name):
        raise ValueError("dataframes must represent same symbol.")
```

2. Use a strategy that supports multi-timeframe analysis or create your own based on the [Multiple Timeframe Analysis Guide](backtesting/MULTIPLE_TIMEFRAME_ANALYSIS.md).

## 7. Next Steps

After you've run your first backtest, explore these aspects of the system:

1. **Optimize Strategy Parameters**:
   - Try different parameters for your strategy
   - Use statistical analysis to validate improvements

2. **Implement Risk Management**:
   - Add position sizing based on risk
   - Implement stop-loss and take-profit mechanisms

3. **Explore Different Strategies**:
   - Test various pre-built strategies in the system
   - Combine multiple indicators for more robust signals

4. **Test Extended Periods**:
   - Use different date ranges to test strategy robustness
   - Check performance during different market conditions

## 8. Common Issues

If you encounter issues, refer to the [Troubleshooting Guide](TROUBLESHOOTING.md) for solutions to common problems.

## 9. Resources

- [Comprehensive Documentation](README.md)
- [Data Preparation Guide](backtesting/DATA_PREPARATION.md)
- [Strategy Development Workflow](backtesting/STRATEGY_DEVELOPMENT.md)
- [Order Management Guide](backtesting/ORDER_MANAGEMENT.md)
- [Multiple Timeframe Analysis](backtesting/MULTIPLE_TIMEFRAME_ANALYSIS.md)
- [Statistical Analysis Guide](backtesting/backtrader/STATISTICAL_ANALYSIS.md)
- [Visualization Tools Guide](backtesting/backtrader/VISUALIZATION.md)