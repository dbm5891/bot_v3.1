# Practical Strategy Development Example

This guide provides a complete, step-by-step walkthrough of developing a specific trading strategy using the Bot v3.1 system. We'll build a dual moving average strategy with volatility filtering that works across multiple timeframes.

## Strategy Concept

Our strategy will:
1. Use SMA crossovers for entry signals
2. Filter trades using ATR (Average True Range) for volatility assessment
3. Use daily trend for direction confirmation
4. Apply proper risk management with dynamic position sizing

## Step 1: Create the Strategy File

Create a new file at `backtesting/backtrader/strategies/st_dual_ma_atr.py` with the following content:

```python
import backtrader as bt
import numpy as np

class DualMaAtrStrategy(bt.Strategy):
    """
    A dual moving average strategy with ATR-based volatility filter and trend confirmation.
    Uses 5-minute data for entries and daily data for trend direction.
    """
    params = (
        ('fast_period', 10),        # Fast SMA period
        ('slow_period', 30),        # Slow SMA period
        ('atr_period', 14),         # ATR calculation period
        ('atr_threshold', 1.5),     # Volatility threshold (multiplier of avg ATR)
        ('risk_pct', 1.0),          # Risk percentage per trade (1% of account)
        ('tp_atr_mult', 2.0),       # Take profit as ATR multiplier
        ('sl_atr_mult', 1.0),       # Stop loss as ATR multiplier
    )
    
    def __init__(self):
        # Initialize data feeds
        self.data_5m = self.datas[0]  # 5-minute data
        
        # Check if we have two data sources (for multi-timeframe)
        self.multi_timeframe = len(self.datas) > 1
        if self.multi_timeframe:
            self.data_1d = self.datas[1]  # Daily data
        
        # Initialize indicators - 5-minute timeframe
        self.fast_sma = bt.indicators.SMA(self.data_5m.close, period=self.params.fast_period)
        self.slow_sma = bt.indicators.SMA(self.data_5m.close, period=self.params.slow_period)
        self.atr_5m = bt.indicators.ATR(self.data_5m, period=self.params.atr_period)
        self.atr_avg = bt.indicators.SMA(self.atr_5m, period=50)  # Average ATR for volatility comparison
        
        # Initialize indicators - daily timeframe (if available)
        if self.multi_timeframe:
            self.sma_50_1d = bt.indicators.SMA(self.data_1d.close, period=50)
            self.atr_1d = bt.indicators.ATR(self.data_1d, period=self.params.atr_period)
        
        # Crossover signals
        self.crossover = bt.indicators.CrossOver(self.fast_sma, self.slow_sma)
        
        # Initialize trade tracking variables
        self.orders = []
        self.trades = []
        self.trades_info = []
        self.positions_info = []
        
        # Track current day for multi-timeframe synchronization
        self.current_day = None
    
    def next(self):
        # Skip if not enough data for indicators
        if len(self.data_5m) <= self.params.slow_period:
            return
            
        # Update current day for tracking daily changes
        current_date = bt.num2date(self.data_5m.datetime[0]).date()
        if self.current_day != current_date:
            self.current_day = current_date
        
        # Skip if we already have a position
        if self.position:
            self.update_position_info()
            return
            
        # Check for volatility filter - only trade when volatility is sufficient
        if self.atr_5m[0] < self.atr_avg[0] * self.params.atr_threshold:
            return
            
        # Determine trend direction from daily timeframe (if available)
        daily_trend_up = True  # Default to long-only if no daily data
        if self.multi_timeframe:
            # Check if daily data is synced with current 5m bar date
            if self.data_1d.datetime.date(0) == current_date:
                daily_trend_up = self.data_1d.close[0] > self.sma_50_1d[0]
        
        # Trading logic
        if self.crossover > 0:  # Fast SMA crosses above slow SMA (bullish)
            if daily_trend_up:  # Only take long trades in uptrend
                self.enter_long()
                
        elif self.crossover < 0:  # Fast SMA crosses below slow SMA (bearish)
            if not daily_trend_up:  # Only take short trades in downtrend
                self.enter_short()
    
    def enter_long(self):
        # Calculate position size based on risk
        entry_price = self.data_5m.close[0]
        atr_value = self.atr_5m[0]
        
        # Stop loss is ATR-based
        stop_price = entry_price - (atr_value * self.params.sl_atr_mult)
        risk_per_share = entry_price - stop_price
        
        # Skip if risk calculation is invalid
        if risk_per_share <= 0:
            return
        
        # Calculate account risk amount
        account_risk = self.broker.getvalue() * (self.params.risk_pct / 100)
        
        # Calculate position size based on risk
        size = int(account_risk / risk_per_share)
        if size <= 0:
            return
            
        # Calculate take profit level
        take_profit = entry_price + (atr_value * self.params.tp_atr_mult)
        
        # Enter with bracket order (main entry + stop loss + take profit)
        self.buy_bracket(
            size=size,
            exectype=bt.Order.Market,
            stopprice=stop_price,
            limitprice=take_profit,
        )
        
        # Log the trade for analysis
        self.log(f"BUY ORDER: Size={size}, Entry={entry_price:.2f}, SL={stop_price:.2f}, TP={take_profit:.2f}")
    
    def enter_short(self):
        # Calculate position size based on risk
        entry_price = self.data_5m.close[0]
        atr_value = self.atr_5m[0]
        
        # Stop loss is ATR-based
        stop_price = entry_price + (atr_value * self.params.sl_atr_mult)
        risk_per_share = stop_price - entry_price
        
        # Skip if risk calculation is invalid
        if risk_per_share <= 0:
            return
        
        # Calculate account risk amount
        account_risk = self.broker.getvalue() * (self.params.risk_pct / 100)
        
        # Calculate position size based on risk
        size = int(account_risk / risk_per_share)
        if size <= 0:
            return
            
        # Calculate take profit level
        take_profit = entry_price - (atr_value * self.params.tp_atr_mult)
        
        # Enter with bracket order (main entry + stop loss + take profit)
        self.sell_bracket(
            size=size,
            exectype=bt.Order.Market,
            stopprice=stop_price,
            limitprice=take_profit,
        )
        
        # Log the trade for analysis
        self.log(f"SELL ORDER: Size={size}, Entry={entry_price:.2f}, SL={stop_price:.2f}, TP={take_profit:.2f}")
    
    def notify_order(self, order):
        if order.status in [order.Submitted, order.Accepted]:
            # Order submitted/accepted - no action required
            return
            
        if order.status in [order.Completed]:
            # Order executed
            self.orders.append(order)
            
            if order.isbuy():
                self.log(f"BUY EXECUTED: Price={order.executed.price:.2f}, Size={order.executed.size}")
            else:
                self.log(f"SELL EXECUTED: Price={order.executed.price:.2f}, Size={order.executed.size}")
                
        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            # Order was canceled/rejected - log it
            self.log(f"Order {order.ref} Canceled/Margin/Rejected")
    
    def notify_trade(self, trade):
        if trade.isclosed:
            self.trades.append(trade)
            self.log(f"TRADE P/L: {trade.pnl:.2f}, Net: {trade.pnlcomm:.2f}")
            
            # Store trade info for later analysis
            try:
                trade_info = (
                    "DualMaAtrStrategy",
                    trade.ref,
                    self.data_5m._name,
                    "LONG" if trade.history[0].event.size > 0 else "SHORT",
                    "CLOSED",
                    trade.open.dt,
                    trade.close.dt,
                    trade.history[0].event.size,
                    trade.history[0].event.price,
                    trade.history[1].event.price,
                    trade.history[1].event.price - trade.history[0].event.price,
                    ((trade.history[1].event.price / trade.history[0].event.price) - 1) * 100 if trade.history[0].event.price != 0 else 0,
                    trade.pnl,
                )
                self.trades_info.append(trade_info)
            except (IndexError, AttributeError):
                # Handle incomplete trade history
                pass
    
    def update_position_info(self):
        """Record current position information for analysis"""
        if self.position:
            pos_info = (
                "DualMaAtrStrategy",
                bt.num2date(self.data_5m.datetime[0]),
                self.position.size,
                self.position.price,
                self.data_5m.close[0],
                ((self.data_5m.close[0] / self.position.price) - 1) * 100 if self.position.price != 0 else 0,
                self.position.price * abs(self.position.size),
                self.data_5m.close[0] * abs(self.position.size),
                (self.data_5m.close[0] - self.position.price) * self.position.size,
            )
            self.positions_info.append(pos_info)
    
    def log(self, txt, dt=None):
        """Logging function"""
        dt = dt or bt.num2date(self.data_5m.datetime[0])
        print(f"{dt.isoformat()} {txt}")
```

## Step 2: Prepare the Data

Now we'll prepare the data for our backtesting:

1. **First, prepare the 5-minute data**:

```bash
python backtesting\backtrader\dfs_prepare.py
python backtesting\backtrader\dfs_set_ta_indicators_5m.py
```

2. **Enable the daily data in `dfs_prepare.py`**:

Open `backtesting/backtrader/dfs_prepare.py` and ensure both timeframes are enabled:

```python
# Make sure both of these sections are active (no "if 0:" conditions)

# ----------------------------------------------
# read 5min timeframe data
filename="aapl_5m_2022-05-09_to_2023-07-12.csv"
df_5m = pd.read_csv(f"{path}/{filename}", parse_dates=["date"])
df_5m = df_5m.set_index("date")
df_5m.sort_index(ascending=True, inplace=True)
df_5m = df_5m.ffill()  # Forward-fill the NaN values

# ----------------------------------------------
# read 1day timeframe data
filename="aapl_1d_2019_to_2024.csv"
df_1d = pd.read_csv(f"{path}/{filename}")
df_1d["date"] = pd.to_datetime(df_1d["date"], format="%m/%d/%Y")
df_1d = df_1d.set_index("date")
df_1d.sort_index(ascending=True, inplace=True)
```

3. **Add indicators to the daily data**:

```bash
python backtesting\backtrader\dfs_set_ta_indicators_1D.py
```

## Step 3: Modify the Backtest Runner

Open `backtesting/backtrader/run_bt_v1.1.py` and make the following changes:

1. **Import the new strategy**:
```python
from strategies.st_dual_ma_atr import DualMaAtrStrategy
```

2. **Enable both data feeds**:
```python
# Enable 5-minute data
data_5m = bt.feeds.PandasData(
    dataname=df_5m, 
    timeframe=bt.TimeFrame.Minutes,
    compression=5,
)
data_5m._name = df_5m.iloc[0]["symbol"]
cerebro.adddata(data_5m)

# Enable daily data
data_1d = bt.feeds.PandasData(dataname=df_1d)
data_1d._name = df_1d.iloc[0]["symbol"]
cerebro.adddata(data_1d)

if (data_5m._name != data_1d._name):
    raise ValueError("dataframes must represent same symbol.")
```

3. **Comment out other strategies and add our new one**:
```python
# Comment out other strategies
# cerebro.addstrategy(StrategyEachBar_Long_LR, take_profit_usd=100.0, stop_loss_usd=100.0)

# Add our strategy
cerebro.addstrategy(DualMaAtrStrategy, 
    fast_period=10, 
    slow_period=30,
    atr_period=14,
    atr_threshold=1.2,
    risk_pct=1.0,
    tp_atr_mult=2.0,
    sl_atr_mult=1.0
)
```

## Step 4: Run the Backtest

Execute the backtest:

```bash
python backtesting\backtrader\run_bt_v1.1.py
```

The backtest will run and display performance metrics in the console, followed by a chart showing the trades and equity curve.

## Step 5: Analyze the Results

1. **Visualize the positions**:
```bash
python backtesting\backtrader\dfs_plot2_positions.py
```

2. **Analyze drawdowns**:
```bash
python backtesting\backtrader\dfs_plot2_drawdown.py
```

3. **Check the order pairs**:
```bash
python backtesting\backtrader\dfs_plot3_orders_pairs.py
```

## Step 6: Optimize the Strategy

Let's create a simple parameter optimization script to find better parameters:

Create a file named `backtesting/backtrader/run_bt_optimize.py`:

```python
from datetime import datetime
import backtrader as bt
import itertools
from pprint import pprint

# Import data preparation functions
from dfs_prepare import df_5m, df_1d

# Import our strategy
from strategies.st_dual_ma_atr import DualMaAtrStrategy

# Parameter ranges to test
fast_periods = [5, 10, 15, 20]
slow_periods = [20, 30, 40, 50]
atr_thresholds = [1.0, 1.2, 1.5, 1.8]
tp_multiples = [1.5, 2.0, 2.5]
sl_multiples = [0.8, 1.0, 1.2]

# Store best results
best_params = None
best_profit = 0
best_sharpe = 0

# Generate all parameter combinations
param_combinations = list(itertools.product(
    fast_periods, 
    slow_periods, 
    atr_thresholds, 
    tp_multiples, 
    sl_multiples
))

print(f"Testing {len(param_combinations)} parameter combinations...")

# Track all results
all_results = []

# Test each combination
for idx, (fast, slow, atr_thresh, tp_mult, sl_mult) in enumerate(param_combinations):
    # Skip invalid combinations
    if fast >= slow:
        continue
        
    print(f"Testing combination {idx+1}/{len(param_combinations)}: SMA({fast},{slow}), ATR({atr_thresh}), TP({tp_mult}), SL({sl_mult})")
    
    # Create a new cerebro instance
    cerebro = bt.Cerebro()
    
    # Add data
    data_5m = bt.feeds.PandasData(
        dataname=df_5m, 
        timeframe=bt.TimeFrame.Minutes,
        compression=5,
    )
    data_5m._name = df_5m.iloc[0]["symbol"]
    cerebro.adddata(data_5m)
    
    data_1d = bt.feeds.PandasData(dataname=df_1d)
    data_1d._name = df_1d.iloc[0]["symbol"]
    cerebro.adddata(data_1d)
    
    # Add the strategy with current parameters
    cerebro.addstrategy(DualMaAtrStrategy, 
        fast_period=fast,
        slow_period=slow,
        atr_threshold=atr_thresh,
        tp_atr_mult=tp_mult,
        sl_atr_mult=sl_mult
    )
    
    # Add analyzers
    cerebro.addanalyzer(bt.analyzers.SharpeRatio, _name='sharpe')
    cerebro.addanalyzer(bt.analyzers.Returns, _name='returns')
    cerebro.addanalyzer(bt.analyzers.DrawDown, _name='drawdown')
    cerebro.addanalyzer(bt.analyzers.TradeAnalyzer, _name='trades')
    
    # Set starting cash
    cerebro.broker.setcash(100000.0)
    
    # Run the backtest
    results = cerebro.run()
    strategy = results[0]
    
    # Get metrics
    sharpe = strategy.analyzers.sharpe.get_analysis()['sharperatio']
    returns = strategy.analyzers.returns.get_analysis()['rtot'] * 100
    max_dd = strategy.analyzers.drawdown.get_analysis()['max']['drawdown']
    trade_count = strategy.analyzers.trades.get_analysis()['total']['total']
    profit = cerebro.broker.getvalue() - 100000.0
    
    # Skip if no trades
    if trade_count == 0:
        continue
    
    # Store result
    result = {
        'fast': fast,
        'slow': slow,
        'atr_thresh': atr_thresh,
        'tp_mult': tp_mult,
        'sl_mult': sl_mult,
        'profit': profit,
        'returns': returns,
        'sharpe': sharpe,
        'max_dd': max_dd,
        'trade_count': trade_count
    }
    all_results.append(result)
    
    # Check if this is the best so far
    if sharpe > best_sharpe:
        best_sharpe = sharpe
        best_params = result
        print(f"New best parameters found! Sharpe: {sharpe:.2f}")

# Sort results by Sharpe ratio
all_results.sort(key=lambda x: x['sharpe'], reverse=True)

# Print top 5 results
print("\nTop 5 parameter combinations by Sharpe ratio:")
for i, result in enumerate(all_results[:5]):
    print(f"{i+1}. Fast: {result['fast']}, Slow: {result['slow']}, ATR: {result['atr_thresh']}, "
          f"TP: {result['tp_mult']}, SL: {result['sl_mult']}")
    print(f"   Profit: ${result['profit']:.2f}, Sharpe: {result['sharpe']:.2f}, "
          f"Max DD: {result['max_dd']:.2f}%, Trades: {result['trade_count']}")

if best_params:
    print("\nBest parameters:")
    pprint(best_params)
else:
    print("No valid parameter combinations found.")
```

Run the optimization:

```bash
python backtesting\backtrader\run_bt_optimize.py
```

## Step 7: Test with Optimized Parameters

Update the parameters in `run_bt_v1.1.py` with the best ones found:

```python
cerebro.addstrategy(DualMaAtrStrategy, 
    fast_period=best_params['fast'], 
    slow_period=best_params['slow'],
    atr_threshold=best_params['atr_thresh'],
    tp_atr_mult=best_params['tp_mult'],
    sl_atr_mult=best_params['sl_mult']
)
```

Run the backtest again with optimized parameters:

```bash
python backtesting\backtrader\run_bt_v1.1.py
```

## Step 8: Cross-validation

To ensure the strategy is robust, test it on different time periods and securities:

1. **Change the date range** in `dfs_prepare.py`:
```python
# Selecting a subset of data
day=1
month=1
year=2023
time_begin = datetime(year=year, month=month, day=day)
time_end = time_begin + timedelta(days=90)  # Test on Q1 2023

df_5m = df_5m.loc[time_begin:time_end]
df_1d = df_1d.loc[time_begin:time_end]
```

2. **Test on a different security**:
```python
# Change to AMD
filename="AMD_5m_2022-05-09_to_2023-07-12.csv"
```

Run the preparation and backtest scripts again to validate performance across different conditions.

## Step 9: Real-world Implementation Considerations

Before deploying this strategy in a live environment, consider:

1. **Transaction Costs**: Add realistic commission rates to better simulate real trading
```python
cerebro.broker.setcommission(commission=0.001)  # 0.1% commission
```

2. **Market Impact**: In real trading, large orders can move the market
   - Implement a slippage model for more realistic execution
   - Consider scaling into positions over multiple orders

3. **Data Quality**: Live data may have gaps or anomalies that must be handled
   - Add error handling for missing data
   - Implement failsafes for extreme market conditions

4. **Risk Management**: Consider portfolio-level risk
   - Limit overall exposure
   - Correlate with existing positions
   - Implement circuit breakers for extreme losses

## Conclusion

You've now created, optimized, and tested a comprehensive multi-timeframe trading strategy that combines technical analysis with proper risk management. The strategy uses:

- Moving average crossovers for entry signals
- ATR-based volatility filtering to avoid low-volatility periods
- Daily trend confirmation to trade in the direction of the larger trend
- Dynamic position sizing based on account risk percentage
- Proper stop loss and take profit levels based on market volatility

This methodology can be adapted and extended to develop and test other strategy concepts within the Bot v3.1 framework.