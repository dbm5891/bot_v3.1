# Trading Strategies

This directory contains the trading strategies available in the Bot v3.1 system. Each strategy is implemented as a separate Python file following the Backtrader framework.

## Available Strategies

### Moving Average Strategies

#### `st_smas_cross.py` - Simple Moving Average Crossover

A strategy that generates buy and sell signals when fast and slow simple moving averages cross.

**Parameters:**
- `fast_period` (default: 10): Period for the fast moving average
- `slow_period` (default: 30): Period for the slow moving average

**Usage:**
```python
cerebro.addstrategy(StrategySMAsCross, fast_period=5, slow_period=20)
```

**Performance Characteristics:**
- Best in trending markets
- Higher false signals in sideways markets
- Medium trading frequency

#### `st_emas_cross.py` - Exponential Moving Average Crossover

Similar to SMA crossover but uses exponential moving averages which respond faster to recent price changes.

**Parameters:**
- `fast_period` (default: 12): Period for the fast EMA
- `slow_period` (default: 26): Period for the slow EMA

**Usage:**
```python
cerebro.addstrategy(StrategyEMAsCross, fast_period=12, slow_period=26)
```

### Linear Regression Strategies

#### `st_linear_regression.py` - Linear Regression Channel

A strategy based on linear regression channels that trades pullbacks to the regression line.

**Parameters:**
- `period` (default: 100): Lookback period for the linear regression
- `dev_factor` (default: 2.0): Standard deviation factor for channel width
- `take_profit_usd` (default: 2.0): Take profit amount in USD
- `stop_loss_usd` (default: 1.0): Stop loss amount in USD

**Usage:**
```python
cerebro.addstrategy(StrategyEachBar_Long_LR, period=100, take_profit_usd=2.0, stop_loss_usd=1.0)
```

**Performance Characteristics:**
- Works well in mean-reverting markets
- Provides precise entry and exit points
- Lower trading frequency with longer periods

### Oscillator-based Strategies

#### `st_rsi.py` - Relative Strength Index

A strategy that buys when RSI is oversold and sells when RSI is overbought.

**Parameters:**
- `period` (default: 14): RSI calculation period
- `oversold` (default: 30): Oversold threshold
- `overbought` (default: 70): Overbought threshold

**Usage:**
```python
cerebro.addstrategy(StrategyRSI, period=14, oversold=30, overbought=70)
```

**Performance Characteristics:**
- Best in range-bound markets
- Can be combined with trend indicators to filter signals
- Medium trading frequency

### Multi-Timeframe Strategies

#### `st_dual_ma_atr.py` - Dual Moving Average with ATR Filters

A sophisticated strategy that uses multiple timeframes, combining daily trend direction with 5-minute entry signals and ATR-based position sizing.

**Parameters:**
- `fast_period` (default: 10): Fast SMA period for 5-minute timeframe
- `slow_period` (default: 30): Slow SMA period for 5-minute timeframe
- `atr_period` (default: 14): ATR calculation period
- `atr_threshold` (default: 1.5): Volatility threshold as ATR multiplier
- `risk_pct` (default: 1.0): Risk percentage per trade
- `tp_atr_mult` (default: 2.0): Take profit as ATR multiplier
- `sl_atr_mult` (default: 1.0): Stop loss as ATR multiplier

**Usage:**
```python
cerebro.addstrategy(DualMaAtrStrategy, 
    fast_period=10, 
    slow_period=30,
    atr_threshold=1.2,
    risk_pct=1.0,
    tp_atr_mult=2.0,
    sl_atr_mult=1.0
)
```

**Performance Characteristics:**
- More robust due to multi-timeframe confirmation
- Adaptive position sizing based on volatility
- Lower frequency trading with higher quality signals

### Experimental Strategies

#### `st_tradingview_signals.py` - TradingView Signal Integration

A strategy that executes trades based on signals imported from TradingView.

**Parameters:**
- `signals_csv` (default: 'tradingview_signals.csv'): Path to CSV file with signals
- `risk_pct` (default: 1.0): Risk percentage per trade

**Usage:**
```python
cerebro.addstrategy(TradingViewSignalsStrategy, signals_csv='my_signals.csv')
```

## Creating New Strategies

To create a new strategy:

1. Create a new Python file following the naming convention `st_strategy_name.py`
2. Implement your strategy class extending `bt.Strategy`
3. Include comprehensive docstrings and parameter documentation
4. Initialize tracking variables for orders, trades, and positions
5. Implement `next()` method with your trading logic
6. Add notification methods for orders and trades

### Template for New Strategies

```python
import backtrader as bt

class MyNewStrategy(bt.Strategy):
    """
    Strategy description goes here
    """
    params = (
        ('param1', default_value1),
        ('param2', default_value2),
    )
    
    def __init__(self):
        # Initialize indicators
        self.indicator1 = bt.indicators.Indicator(self.data, period=self.params.param1)
        
        # Initialize tracking variables
        self.orders = []
        self.trades = []
        self.trades_info = []
        self.positions_info = []
    
    def next(self):
        # Trading logic goes here
        if self.buy_condition():
            self.buy()
        elif self.sell_condition():
            self.sell()
    
    def buy_condition(self):
        # Implement your buy logic
        return False
        
    def sell_condition(self):
        # Implement your sell logic
        return False
            
    def notify_order(self, order):
        if order.status in [order.Completed]:
            self.orders.append(order)
    
    def notify_trade(self, trade):
        if trade.isclosed:
            self.trades.append(trade)
            
            # Store trade info for later analysis
            trade_info = (
                self.__class__.__name__,
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

## Strategy Performance Comparison

| Strategy | Win Rate | Avg Profit/Trade | Sharpe Ratio | Best Market Condition |
|----------|----------|------------------|--------------|----------------------|
| SMA Crossover | 45-55% | 0.5-1.5% | 0.8-1.2 | Trending |
| EMA Crossover | 45-55% | 0.6-1.6% | 0.9-1.3 | Trending |
| Linear Regression | 50-60% | 0.8-1.8% | 1.0-1.4 | Mean-reverting |
| RSI | 40-50% | 0.3-1.3% | 0.6-1.0 | Range-bound |
| Dual MA ATR | 50-60% | 1.0-2.0% | 1.2-1.6 | Multiple conditions |

*Note: Performance metrics are approximate and depend on market conditions, parameter settings, and the specific assets being traded.*

## Related Documentation

- [Strategy Development Workflow](../../STRATEGY_DEVELOPMENT.md)
- [Multiple Timeframe Analysis](../../MULTIPLE_TIMEFRAME_ANALYSIS.md)
- [Order Management](../../ORDER_MANAGEMENT.md)
- [Strategy Example](../../STRATEGY_EXAMPLE.md)