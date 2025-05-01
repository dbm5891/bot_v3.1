# Order Management and Position Sizing

This guide explains order management and position sizing techniques available in the Bot v3.1 backtesting framework.

## Overview

Effective order management and position sizing are crucial components of a profitable trading strategy. While trade signals define when to enter and exit markets, order management determines how trades are executed and position sizing controls how much capital to risk on each trade.

## Order Types in Bot v3.1

The backtesting framework supports multiple order types:

### Market Orders

Market orders execute immediately at the current market price.

```python
# Simple market buy order
self.buy()

# Market buy with specific size
self.buy(size=100)

# Market sell order
self.sell()

# Close an existing position with market order
self.close()
```

### Limit Orders

Limit orders execute only when the price reaches a specified level or better.

```python
# Buy limit order (buy when price drops to or below limit_price)
self.buy(exectype=bt.Order.Limit, price=limit_price)

# Sell limit order (sell when price rises to or above limit_price)
self.sell(exectype=bt.Order.Limit, price=limit_price)
```

### Stop Orders

Stop orders become market orders when a specified price level is reached.

```python
# Buy stop order (buy when price rises to or above stop_price)
self.buy(exectype=bt.Order.Stop, price=stop_price)

# Sell stop order (sell when price drops to or below stop_price)
self.sell(exectype=bt.Order.Stop, price=stop_price)
```

### Stop-Limit Orders

Combines stop and limit orders - when the stop price is reached, a limit order is placed.

```python
# Buy stop-limit (when price hits stop_price, place limit order at limit_price)
self.buy(exectype=bt.Order.StopLimit, price=limit_price, plimit=stop_price)

# Sell stop-limit
self.sell(exectype=bt.Order.StopLimit, price=limit_price, plimit=stop_price)
```

## Position Sizing Strategies

### 1. Fixed Size

The simplest approach - always trade the same number of shares.

```python
# Always trade 100 shares
self.buy(size=100)
```

Can be set as the default for all trades:

```python
# In run_bt_v1.1.py
cerebro.addsizer(bt.sizers.FixedSize, stake=100)
```

### 2. Fixed Dollar Amount

Trade a consistent dollar amount regardless of share price.

```python
# Custom method to calculate shares based on fixed dollar amount
def calculate_position_size(self, dollar_amount):
    price = self.data.close[0]
    if price > 0:
        return int(dollar_amount / price)
    return 0

# Using the method
size = self.calculate_position_size(5000)  # $5,000 position
self.buy(size=size)
```

### 3. Percent of Equity

Size positions as a percentage of current account equity.

```python
def percent_position(self, percent):
    cash = self.broker.getcash()
    value = self.broker.getvalue()
    price = self.data.close[0]
    
    if price > 0:
        return int((value * percent / 100) / price)
    return 0

# Risk 2% of account on this trade
size = self.percent_position(2)
self.buy(size=size)
```

### 4. Volatility-Based Position Sizing

Adjust position size based on market volatility - larger positions in low volatility, smaller in high volatility.

```python
def volatility_adjusted_size(self, risk_amount):
    atr = self.atr[0]  # Assuming ATR indicator is defined
    price = self.data.close[0]
    
    if atr > 0 and price > 0:
        # Size inversely proportional to volatility
        return int(risk_amount / atr)
    return 0

# $1,000 risk adjusted by volatility
size = self.volatility_adjusted_size(1000)
self.buy(size=size)
```

### 5. Kelly Criterion

Optimal position sizing based on win rate and reward/risk ratio.

```python
def kelly_position(self, win_rate, reward_risk_ratio):
    kelly_percentage = win_rate - ((1 - win_rate) / reward_risk_ratio)
    
    # Apply a fraction of Kelly to be more conservative
    kelly_percentage = kelly_percentage * 0.5  # Half-Kelly
    
    # Cap at a maximum percentage
    kelly_percentage = min(kelly_percentage, 0.10)  # Maximum 10%
    
    cash = self.broker.getcash()
    price = self.data.close[0]
    
    if price > 0 and kelly_percentage > 0:
        return int((cash * kelly_percentage) / price)
    return 0

# Assuming 60% win rate and 2:1 reward/risk ratio
size = self.kelly_position(0.60, 2.0)
self.buy(size=size)
```

## Advanced Order Management Techniques

### 1. Bracket Orders

Create a set of orders that manage both profit targets and stop losses.

```python
def buy_with_bracket(self, size, take_profit_pct, stop_loss_pct):
    price = self.data.close[0]
    take_profit = price * (1 + take_profit_pct/100)
    stop_loss = price * (1 - stop_loss_pct/100)
    
    # Create the bracket order
    self.buy_bracket(
        price=price,  # Main order price (can be None for market order)
        size=size,
        limitprice=take_profit,  # Take profit price
        stopprice=stop_loss,  # Stop loss price
    )
```

### 2. Order Cancellation

Cancel existing orders that are no longer relevant.

```python
def next(self):
    # Check if we need to cancel pending orders
    if self.some_condition:
        # Cancel all pending orders
        for order in self.broker.get_orders_open():
            self.broker.cancel(order)
```

### 3. Order Replacement

Update an existing order with new parameters.

```python
def update_stop_loss(self):
    # Cancel old stop order
    if hasattr(self, 'stop_order') and self.stop_order:
        self.broker.cancel(self.stop_order)
        
    # Create new stop order with updated price
    new_stop_price = self.data.low[0] - self.atr[0]
    self.stop_order = self.sell(exectype=bt.Order.Stop, price=new_stop_price)
```

### 4. Scaling In/Out

Gradually build or reduce positions rather than entering/exiting all at once.

```python
def scale_in(self, total_size, num_parts):
    """Scale into a position in equal parts"""
    part_size = total_size // num_parts
    
    # Initial entry
    self.buy(size=part_size)
    
    # Set up scaling levels
    price = self.data.close[0]
    self.scale_levels = []
    
    # Create additional entry orders at progressively better prices
    for i in range(1, num_parts):
        scale_price = price * (1 - (i * 0.01))  # Each 1% lower
        order = self.buy(size=part_size, exectype=bt.Order.Limit, price=scale_price)
        self.scale_levels.append(order)
```

### 5. Trailing Stops

Adjust stop losses to lock in profits as the trade moves favorably.

```python
def trailing_stop(self):
    """Update trailing stop based on current price and ATR"""
    if not self.position or not hasattr(self, 'stop_order'):
        return
        
    # For long positions
    if self.position.size > 0:
        new_stop = self.data.close[0] - (self.atr[0] * 3)  # 3 ATR below current price
        
        # Only move stop up, never down
        if not self.stop_order.executed and new_stop > self.stop_order.created.price:
            self.broker.cancel(self.stop_order)
            self.stop_order = self.sell(exectype=bt.Order.Stop, price=new_stop)
```

## Implementation in Strategies

### Basic Order Management Strategy

```python
class OrderManagementStrategy(bt.Strategy):
    params = (
        ('risk_pct', 1.0),  # Risk 1% of account per trade
        ('reward_risk', 2.0),  # Target 2:1 reward/risk ratio
        ('trail_atr', 2.0),  # Trailing stop at 2x ATR
    )
    
    def __init__(self):
        self.atr = bt.indicators.ATR(period=14)
        self.orders = {}  # Track orders
        
    def next(self):
        # Only trade if no open positions
        if not self.position:
            if self.buy_signal():
                # Calculate position size based on risk
                entry_price = self.data.close[0]
                stop_price = entry_price - (self.atr[0] * 2)
                risk_per_share = entry_price - stop_price
                
                if risk_per_share <= 0:
                    return
                
                # Account risk in dollars
                account_risk = self.broker.getvalue() * (self.params.risk_pct / 100)
                
                # Position size
                size = int(account_risk / risk_per_share)
                
                if size <= 0:
                    return
                
                # Calculate take profit level
                profit_target = entry_price + (risk_per_share * self.params.reward_risk)
                
                # Enter with bracket order
                self.buy_bracket(
                    size=size,
                    exectype=bt.Order.Market,
                    stopprice=stop_price,
                    limitprice=profit_target,
                )
                
        else:
            # Update trailing stop for existing positions
            self.manage_trailing_stop()
    
    def manage_trailing_stop(self):
        # Implementation of trailing stop logic
        pass
        
    def buy_signal(self):
        # Implement your entry signal logic
        return False
```

## Order Output and Analysis

The Bot v3.1 backtesting framework records detailed order information for analysis:

```python
# In run_bt_v1.1.py
if 1:
    orders_info: list[tuple] = [] 
    orders: list[bt.Order] = cerebro.runstrats[0][0].orders
    for o in orders:
        o_info=(
            # Order details collection here
            o.ref,
            o.ordtypename(),   # ['Buy', 'Sell']
            o.getstatusname(), # [Status names]
            o.size,
            o.executed.price,
            # etc.
        )
        orders_info.append(o_info)

    # Export to CSV for analysis
    list_tuple_to_csv(header=header, list_tuples=orders_info, output_filename=output_filename)
```

This data can be visualized using the order visualization scripts:
- `dfs_plot3_orders_list.py`
- `dfs_plot3_orders_pairs.py`

## Best Practices

1. **Always Use Position Sizing**: Never use arbitrary position sizes; always tie position size to account risk
2. **Risk Management First**: Define maximum risk per trade and total portfolio risk
3. **Diversify Entry Types**: Consider using a mix of market, limit, and stop orders based on strategy needs
4. **Monitor Fill Quality**: When backtesting, analyze execution prices versus expected prices
5. **Always Use Stop Losses**: Every trade should have a predefined exit point for losses
6. **Track Order History**: Store and analyze all order information to identify improvement areas

## Common Pitfalls

1. **Over-leveraging**: Using too large position sizes relative to account size
2. **Stop Placement**: Setting stops too tight (get stopped out constantly) or too wide (excessive risk)
3. **Ignoring Liquidity**: Not accounting for potential slippage in less liquid markets
4. **Chasing Entries**: Repeatedly canceling and replacing orders to chase price movements
5. **Complex Order Structures**: Creating overly complex order management systems that are hard to maintain

## Related Documentation

- [Strategy Development Workflow](STRATEGY_DEVELOPMENT.md)
- [Statistical Analysis Guide](backtrader/STATISTICAL_ANALYSIS.md)
- [Multiple Timeframe Analysis](MULTIPLE_TIMEFRAME_ANALYSIS.md)