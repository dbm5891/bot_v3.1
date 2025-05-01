# TradingView Integration Guide

This document explains how to integrate TradingView with the Bot v3.1 system for enhanced visualization, strategy testing, and seamless workflow between platforms.

## Overview

TradingView is a popular charting platform that offers advanced visualization and social trading features. Integrating TradingView with Bot v3.1 provides several advantages:

1. Enhanced charting capabilities
2. Pine Script strategy prototyping
3. Data comparison and validation
4. Expanding your strategy development toolkit

## Integration Methods

### Method 1: CSV Data Export/Import

The simplest integration approach is to exchange data between the systems using CSV files.

#### Exporting Data from Bot v3.1 to TradingView

1. **Prepare your data in Bot v3.1 format**:
   ```bash
   python backtesting\backtrader\dfs_prepare.py
   python backtesting\backtrader\dfs_set_ta_indicators_5m.py
   ```

2. **Create a TradingView-compatible CSV file**:
   Create a new file `backtesting/export_to_tv.py`:

   ```python
   import pandas as pd
   from dfs_prepare import df_5m
   
   # Create TradingView compatible format (OHLCV)
   tv_df = df_5m[['open', 'high', 'low', 'close', 'volume']].copy()
   
   # Format for TradingView CSV import
   # TradingView format: time,open,high,low,close,volume
   tv_df = tv_df.reset_index()
   tv_df['date'] = tv_df['date'].dt.strftime('%Y-%m-%d %H:%M:%S')
   
   # Export to CSV
   tv_df.to_csv('backtesting/csv_input/for_tradingview.csv', index=False, 
                header=['time', 'open', 'high', 'low', 'close', 'volume'])
   
   print(f"CSV exported for TradingView with {len(tv_df)} bars")
   ```

3. **Run the export script**:
   ```bash
   python backtesting\export_to_tv.py
   ```

4. **Import into TradingView**:
   - Go to TradingView Chart
   - Click on "Data" menu in bottom panel
   - Select "Import Data"
   - Upload your CSV file
   - Map columns if needed

#### Importing Data from TradingView to Bot v3.1

1. **Export data from TradingView**:
   - Open your chart in TradingView
   - Right-click on the chart
   - Select "Export Chart Data..."
   - Choose CSV format and download

2. **Create an import script** `backtesting/import_from_tv.py`:

   ```python
   import pandas as pd
   import os
   
   # Path to your TradingView export (update as needed)
   tv_csv_path = 'backtesting/csv_input/tradingview_export.csv'
   
   # Read the TradingView CSV
   df = pd.read_csv(tv_csv_path)
   
   # Format for Bot v3.1 system
   # Convert time to datetime
   df['date'] = pd.to_datetime(df['time'])
   df = df.drop('time', axis=1)
   
   # Add symbol column
   symbol = input("Enter the symbol for this data (e.g., AAPL): ")
   df['symbol'] = symbol
   
   # Set date as index
   df = df.set_index('date')
   
   # Define output path
   output_path = f'backtesting/csv_input/{symbol}_from_tv.csv'
   
   # Export to CSV
   df.to_csv(output_path)
   
   print(f"Imported {len(df)} bars for {symbol} from TradingView")
   print(f"Saved to {output_path}")
   ```

3. **Run the import script**:
   ```bash
   python backtesting\import_from_tv.py
   ```

### Method 2: Pine Script to Python Translation

TradingView strategies written in Pine Script can be translated to Python for use in Bot v3.1.

#### Basic Pine to Python Translation Guidelines

1. **Pine Script Variables to Python Variables**:
   
   Pine Script:
   ```
   study("My Indicator")
   len = input(14)
   src = close
   my_sma = ta.sma(src, len)
   ```
   
   Python Equivalent:
   ```python
   def my_indicator(data, length=14):
       src = data['close']
       my_sma = src.rolling(window=length).mean()
       return my_sma
   ```

2. **Conditions and Signals**:
   
   Pine Script:
   ```
   buySignal = ta.crossover(fast_ma, slow_ma)
   sellSignal = ta.crossunder(fast_ma, slow_ma)
   ```
   
   Python Equivalent:
   ```python
   # Create crossover signal
   def crossover(series1, series2):
       return (series1 > series2) & (series1.shift(1) <= series2.shift(1))
       
   def crossunder(series1, series2):
       return (series1 < series2) & (series1.shift(1) >= series2.shift(1))
   
   buy_signal = crossover(fast_ma, slow_ma)
   sell_signal = crossunder(fast_ma, slow_ma)
   ```

3. **Creating a translation wrapper**:
   
   Create a utility file `backtesting/pine_to_python.py`:
   
   ```python
   import pandas as pd
   import numpy as np
   
   class PineIndicators:
       @staticmethod
       def sma(series, length):
           """Simple Moving Average"""
           return series.rolling(window=length).mean()
           
       @staticmethod
       def ema(series, length):
           """Exponential Moving Average"""
           return series.ewm(span=length, adjust=False).mean()
           
       @staticmethod
       def rsi(series, length):
           """Relative Strength Index"""
           delta = series.diff()
           gain = delta.where(delta > 0, 0).rolling(window=length).mean()
           loss = -delta.where(delta < 0, 0).rolling(window=length).mean()
           
           rs = gain / loss
           return 100 - (100 / (1 + rs))
           
       @staticmethod
       def crossover(series1, series2):
           """Crossover detection"""
           return (series1 > series2) & (series1.shift(1) <= series2.shift(1))
           
       @staticmethod
       def crossunder(series1, series2):
           """Crossunder detection"""
           return (series1 < series2) & (series1.shift(1) >= series2.shift(1))
   ```

4. **Using the translation wrapper**:
   
   ```python
   from pine_to_python import PineIndicators as pine
   
   # Translating a Pine Script strategy
   def apply_pine_strategy(df):
       # Pine: fast_ma = ta.sma(close, 10)
       df['fast_ma'] = pine.sma(df['close'], 10)
       
       # Pine: slow_ma = ta.sma(close, 30)
       df['slow_ma'] = pine.sma(df['close'], 30)
       
       # Pine: buy = ta.crossover(fast_ma, slow_ma)
       df['buy_signal'] = pine.crossover(df['fast_ma'], df['slow_ma'])
       
       # Pine: sell = ta.crossunder(fast_ma, slow_ma)
       df['sell_signal'] = pine.crossunder(df['fast_ma'], df['slow_ma'])
       
       return df
   ```

### Method 3: Creating a Bot v3.1 Strategy from TradingView Alert

TradingView can send alerts that trigger actions in Bot v3.1.

#### Setting up TradingView Alerts

1. Create a Pine Script strategy or indicator in TradingView
2. Set up an alert with webhook delivery
3. Format the alert message as JSON with strategy details:
   ```
   {
     "symbol": "{{ticker}}",
     "action": "{{strategy.order.action}}",
     "price": {{close}},
     "time": "{{time}}",
     "strategy": "SMA_Crossover"
   }
   ```

#### Creating an Alert Receiver

1. **Add a webhook receiver** to your system by creating `scripts/tv_alert_receiver.py`:
   
   ```python
   from flask import Flask, request, jsonify
   import pandas as pd
   import json
   from datetime import datetime
   import os

   app = Flask(__name__)

   # Configure logging
   import logging
   logging.basicConfig(
       level=logging.INFO,
       format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
       filename='tradingview_alerts.log'
   )

   # Store received alerts
   alert_log = []

   @app.route('/webhook', methods=['POST'])
   def webhook():
       if request.method == 'POST':
           try:
               data = request.json
               
               # Add timestamp
               data['received_at'] = datetime.now().isoformat()
               
               # Log alert
               logging.info(f"Alert received: {data}")
               alert_log.append(data)
               
               # Save to CSV
               alerts_df = pd.DataFrame(alert_log)
               alerts_df.to_csv('tradingview_alerts.csv', index=False)
               
               # Here you could trigger your trading logic
               # process_trading_signal(data)
               
               return jsonify({"status": "success", "message": "Alert received"}), 200
           
           except Exception as e:
               logging.error(f"Error processing webhook: {str(e)}")
               return jsonify({"status": "error", "message": str(e)}), 500
       
       return jsonify({"status": "error", "message": "Method not allowed"}), 405

   def process_trading_signal(data):
       """Process the trading signal from TradingView"""
       # Implement your trading logic here
       # This function would integrate with your Bot v3.1 system
       pass

   if __name__ == '__main__':
       app.run(host='0.0.0.0', port=5000)
   ```

2. **Set up ngrok or similar tool** to expose your webhook endpoint:
   ```bash
   ngrok http 5000
   ```

3. **Use the ngrok URL** in your TradingView webhook alert settings

## Developing Hybrid Strategies

You can leverage both platforms' strengths by using TradingView for visualization and signal generation, while executing and analyzing trades in Bot v3.1.

### Workflow Example

1. **Prototype in TradingView** using Pine Script
2. **Extract signals** to CSV or via webhooks
3. **Implement in Bot v3.1** with optimized parameters
4. **Backtest and refine** using Bot v3.1's statistical tools
5. **Visualize results** in both platforms

### Sample Hybrid Strategy Implementation

Create a file `backtesting/backtrader/strategies/st_tradingview_signals.py`:

```python
import backtrader as bt
import pandas as pd
import os

class TradingViewSignalsStrategy(bt.Strategy):
    """
    Strategy that uses signals imported from TradingView
    """
    params = (
        ('signals_csv', 'tradingview_signals.csv'),  # Path to signals from TradingView
        ('risk_pct', 1.0),                           # Account risk per trade
    )
    
    def __init__(self):
        # Load signals from CSV
        signals_path = os.path.join(os.getcwd(), self.params.signals_csv)
        self.signals_df = pd.read_csv(signals_path)
        
        # Convert time column to datetime
        self.signals_df['time'] = pd.to_datetime(self.signals_df['time'])
        
        # Initialize position tracking
        self.orders = []
        self.trades = []
        self.trades_info = []
        self.positions_info = []
        
        print(f"Loaded {len(self.signals_df)} signals from TradingView")
    
    def next(self):
        # Get current date and time
        current_time = bt.num2date(self.data.datetime[0])
        
        # Search for signals at this time
        signal_row = self.signals_df[self.signals_df['time'] == current_time]
        
        if len(signal_row) > 0:
            action = signal_row['action'].values[0]
            
            if action == 'buy' and not self.position:
                self.buy()
                print(f"BUY signal at {current_time}")
            
            elif action == 'sell' and self.position:
                self.sell()
                print(f"SELL signal at {current_time}")
    
    def notify_order(self, order):
        if order.status in [order.Completed]:
            self.orders.append(order)
    
    def notify_trade(self, trade):
        if trade.isclosed:
            self.trades.append(trade)
            
            # Store trade info
            trade_info = (
                "TradingViewSignals",
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

## Best Practices for Integration

1. **Data Consistency**:
   - Ensure time zones match between TradingView and Bot v3.1
   - Verify OHLC values match between platforms
   - Use the same adjustment methods for dividends and splits

2. **Signal Verification**:
   - Validate signals across platforms before live trading
   - Create visualization tools to compare signals

3. **Separation of Concerns**:
   - Use TradingView for what it does best: visualization and quick prototyping
   - Use Bot v3.1 for robust backtesting, statistical analysis, and execution

4. **Performance Comparison**:
   - Create benchmark scripts to compare strategy performance between platforms
   - Identify and document discrepancies

## Advanced: Exporting Bot v3.1 Results to TradingView

To visualize Bot v3.1 backtest results in TradingView:

1. **Create an export script** `backtesting/export_results_to_tv.py`:
   
   ```python
   import pandas as pd
   import os

   # Load backtest results
   def export_trades_to_tv(trades_csv, output_path):
       # Load trades
       trades_df = pd.read_csv(trades_csv)
       
       # Convert to TradingView format
       trades_df['time'] = pd.to_datetime(trades_df['open'])
       
       # Create signals dataframe
       signals = []
       
       for _, row in trades_df.iterrows():
           # Add entry signal
           entry = {
               'time': row['open'],
               'price': row['open price'],
               'action': 'buy' if row['type'] == 'LONG' else 'sell',
               'label': f"{row['method']}: {row['type']} Entry",
               'tooltip': f"Trade #{row['ref']}, Price: {row['open price']}, Size: {row['size']}"
           }
           signals.append(entry)
           
           # Add exit signal
           exit = {
               'time': row['close'],
               'price': row['close price'],
               'action': 'sell' if row['type'] == 'LONG' else 'buy',
               'label': f"{row['method']}: {row['type']} Exit",
               'tooltip': f"Trade #{row['ref']}, P&L: ${row['pnl']}, ROI: {row['percentage']}%"
           }
           signals.append(exit)
       
       # Convert to dataframe and export
       signals_df = pd.DataFrame(signals)
       signals_df.to_csv(output_path, index=False)
       
       print(f"Exported {len(signals_df)} signals to {output_path}")

   # Example usage
   export_trades_to_tv(
       'backtesting/outputs/SomeStrategy_AAPL_bt_trades.csv', 
       'backtesting/outputs/for_tradingview.csv'
   )
   ```

2. **Import the signals into TradingView** as a custom data source

## Resources

- [TradingView Pine Script Reference](https://www.tradingview.com/pine-script-reference/)
- [Backtrader Documentation](https://www.backtrader.com/docu/)
- [Flask Webhook Documentation](https://flask.palletsprojects.com/)

## Related Documentation

- [Data Preparation Guide](DATA_PREPARATION.md)
- [Strategy Development Workflow](STRATEGY_DEVELOPMENT.md)
- [Visualization Tools Guide](backtrader/VISUALIZATION.md)