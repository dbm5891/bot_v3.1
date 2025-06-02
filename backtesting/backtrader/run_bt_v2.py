# =================================================================================================
# IMPORTS AND SETUP
# =================================================================================================

# Import necessary libraries for date/time handling, plotting, and data manipulation
from datetime import datetime, timedelta
from matplotlib import pyplot as plt
import numpy as np
import pandas as pd
import matplotlib.dates as mdates
import pytz
import os
import sys
import argparse  # For parsing command line arguments

# Import libraries for timing execution and backtesting
import time as tm
import backtrader as bt


# Get the project root directory (two levels up from this file)
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(current_dir))
sys.path.insert(0, project_root)
sys.path.insert(0, os.path.join(project_root, "scripts"))

# Also add current working directory for compatibility
cwd = os.getcwd()
if cwd not in sys.path:
    sys.path.append(cwd)
if os.path.join(cwd, "scripts") not in sys.path:
    sys.path.append(os.path.join(cwd, "scripts"))


# =================================================================================================
# IMPORT CUSTOM FUNCTIONS AND DATA
# =================================================================================================

# Import helper functions for running cerebro engine, timing, and printing summaries
from run_bt_func import cerebro_run, print_current_runtime, print_summary
# Import the 5-minute data frame and symbols from CSV
from scripts.testing.plot.read_multi_symbols_csv import df_5m, symbols
# Import helper function for dataframe info display
from backtesting.functional.dataframes import get_df_title
# Import predefined symbol lists (S&P 500 subsets)
from testing.polygon.snp500_symbols import symbols32, symbols5

# Import trading strategies
from strategies.st_time import Strategy18to19  # Time-based strategy (trades during specific hours)
from strategies.st_each_bar_long_lr import StrategyEachBar_Long_LR  # Linear regression trend-following strategy


# =================================================================================================
# PARSE COMMAND LINE ARGUMENTS
# =================================================================================================

def parse_args():
    """Parse command line arguments for the backtesting script."""
    # Add program description and epilog with examples
    description = '''
    Backtrader backtesting script for testing trading strategies on historical market data.
    
    This script processes 5-minute candlestick data across multiple stocks and trading days,
    evaluates strategy performance, and generates comprehensive performance metrics.
    '''
    
    epilog = '''
    Examples:
      # Run with default settings (all symbols, linear regression strategy)
      python backtesting/backtrader/run_bt_v2.py
      
      # Test specific symbols
      python backtesting/backtrader/run_bt_v2.py --symbols AAPL MSFT NVDA
      
      # Run with date range
      python backtesting/backtrader/run_bt_v2.py --start-date 2022-05-01 --end-date 2022-05-15
      
      # Use time-based strategy with 5 major stocks and no plotting
      python backtesting/backtrader/run_bt_v2.py --symbols5 --strategy time_based --no-plot
      
      # Save results to custom file with lower price threshold
      python backtesting/backtrader/run_bt_v2.py --symbols32 --price-threshold 100 --output-file results.csv
    '''
    
    parser = argparse.ArgumentParser(
        description=description,
        epilog=epilog,
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    # Symbol selection
    symbol_group = parser.add_argument_group('Symbol Selection')
    symbol_selection = symbol_group.add_mutually_exclusive_group()
    symbol_selection.add_argument('--symbols', nargs='+', metavar='SYMBOL',
                        help='Specific symbols to test (e.g., AAPL MSFT NVDA)')
    symbol_selection.add_argument('--symbols5', action='store_true',
                        help='Use predefined list of 5 major stocks (AAPL, MSFT, NVDA, AMZN, TSLA)')
    symbol_selection.add_argument('--symbols32', action='store_true',
                        help='Use predefined list of 32 top S&P 500 stocks')
    symbol_selection.add_argument('--all-symbols', action='store_true',
                        help='Use all available symbols in the dataset (default)')
    
    # Date range
    date_group = parser.add_argument_group('Date Range')
    date_group.add_argument('--start-date', type=str, metavar='YYYY-MM-DD',
                        help='Start date in YYYY-MM-DD format')
    date_group.add_argument('--end-date', type=str, metavar='YYYY-MM-DD',
                        help='End date in YYYY-MM-DD format')
    
    # Strategy selection
    strategy_group = parser.add_argument_group('Strategy')
    strategy_group.add_argument('--strategy', choices=['linear_regression', 'time_based'], 
                       default='linear_regression', 
                       help='Strategy to use for backtesting (default: linear_regression)')
    
    # Visualization options
    visual_group = parser.add_argument_group('Visualization')
    visual_group.add_argument('--no-plot', action='store_true',
                       help='Disable chart plotting (faster execution)')
    
    # Price filter
    filter_group = parser.add_argument_group('Filtering')
    filter_group.add_argument('--price-threshold', type=float, default=500.0, metavar='PRICE',
                       help='Skip stocks with price above this threshold (default: 500.0)')
    
    # Output options
    output_group = parser.add_argument_group('Output Options')
    output_group.add_argument('--output-file', type=str, metavar='FILE',
                       help='Save results to custom file location')
    output_group.add_argument('--verbose', action='store_true',
                       help='Enable detailed output during backtesting')
    
    return parser.parse_args()


# =================================================================================================
# INITIALIZATION
# =================================================================================================

# Parse command line arguments
args = parse_args()

# Dictionary to store trade information by date
trades_info_per_date: dict[pd.Timestamp, list[tuple]] = {}

# Start timing the script execution
start_time = tm.time()


# =================================================================================================
# EXTRACT UNIQUE TRADING DAYS
# =================================================================================================

# Get a list of unique trading days in the data
dates: list[pd.Timestamp] = df_5m.index.normalize().unique()

# Filter by date range if specified
if args.start_date:
    start_date = pd.Timestamp(args.start_date)
    dates = [d for d in dates if d >= start_date]
    
if args.end_date:
    end_date = pd.Timestamp(args.end_date)
    dates = [d for d in dates if d <= end_date]

print(dates)
print(f"count unique trading dates: {len(dates)}")

# =================================================================================================
# PROCESS EACH TRADING DAY
# =================================================================================================

# Iterate through each trading day
for i, date in enumerate(dates):

    print("="*100)  # Print a separator line for readability
    title_date = f"date: {date.date()} ({i+1}/{len(dates)})"  # Format current date info with progress
    print(title_date)

    # Select data for the current day (from beginning of day to 23:55)
    time_begin = date
    time_end = date.replace(hour=23, minute=55)
    df_date = df_5m.loc[time_begin:time_end]
    print(get_df_title(df_date))  # Print summary of the day's dataframe

    # Skip if no data is available for this date
    if not len(df_date):
        print(f"{date}: Empty DataFrame, skip")
        continue


    # Reset the list to store this date's trades
    trades_info: list[tuple] = [] 
    
    # Get symbols based on command line arguments
    if args.symbols:
        # Use user-specified symbols
        symbols_to_use = args.symbols
        # Filter to only include symbols that exist in the data
        symbols_to_use = [s for s in symbols_to_use if s in df_date["symbol"].unique()]
    elif args.symbols5:
        symbols_to_use = symbols5
    elif args.symbols32:
        symbols_to_use = symbols32
    else:  # Default or --all-symbols
        # Get the list of unique symbols available for this date
        symbols_to_use = df_date["symbol"].unique()
    
    # =================================================================================================
    # PROCESS EACH SYMBOL FOR THE CURRENT DAY
    # =================================================================================================
    
    # Iterate through each symbol in the current day
    for i, s in enumerate(symbols_to_use):

        # Display progress for current symbol
        title_symbol = f"[{i+1}/{len(symbols_to_use)}] {s}"
        print(f"{title_date}, {title_symbol}")

        # Filter data by the current symbol
        filtered_df: pd.DataFrame = df_date[df_date['symbol']==s]
        
        # Skip if no data available for this symbol
        if not len(filtered_df):
            print(f"{s}: Empty DataFrame, skip")
            continue
            
        filtered_df = filtered_df.copy()  # Create a copy to avoid pandas SettingWithCopyWarning

        # Skip high-priced stocks based on threshold from command line
        if filtered_df.iloc[0]["close"] >= args.price_threshold:
            print(f"{s}: price >= {args.price_threshold}, skip plot")
            continue

        # =================================================================================================
        # RUN BACKTEST FOR CURRENT SYMBOL
        # =================================================================================================
        
        # Data is in UTC time
        # 08:00----------------13:30------------------------20:00-------------00:00
        # pre-market           market(RTH)                  after-hours       close
        
        # Choose strategy based on command line argument
        if args.strategy == 'time_based':
            strategy = Strategy18to19
        else:  # default to linear_regression
            strategy = StrategyEachBar_Long_LR
        
        # Run backtest with selected strategy and collect trade results
        trades_info.extend(
            cerebro_run(
                df=filtered_df,
                strategy=strategy,
                plot=not args.no_plot,  # Plot unless --no-plot is specified
            )
        )

        # Print the elapsed running time
        print_current_runtime(start_time)


    # =================================================================================================
    # SAVE RESULTS FOR CURRENT DATE
    # =================================================================================================
    
    # Option to print summary for just this date (commented out)
    # print_summary(trades_info) # print this date summary
    
    # Save this date's trades to the dictionary
    trades_info_per_date[date] = trades_info

        
    
# =================================================================================================
# FINAL SUMMARY AND EXPORT
# =================================================================================================

# Aggregate all trades from all dates
trades_info_global: list[tuple] = [] 
for date, trades_info in trades_info_per_date.items():
    # Print summary for each individual date
    print_summary(trades_info, date)
    # Add this date's trades to the global list
    trades_info_global.extend(trades_info)

# Print the overall summary across all dates
print("="*50)
# Generate comprehensive summary from first to last date, with full dataframe output
print_summary(trades_info_global, dates[0], dates[-1], print_df=True, output_file=args.output_file)
print(f"count unique trading dates: {len(dates)}")
# Print total script execution time
print_current_runtime(start_time)


# =================================================================================================
# USAGE EXAMPLES (FOR README)
# =================================================================================================

# To run with default settings:
# python backtesting/backtrader/run_bt_v2.py
#
# To run specific symbols only:
# python backtesting/backtrader/run_bt_v2.py --symbols AAPL MSFT NVDA
#
# To run with date range:
# python backtesting/backtrader/run_bt_v2.py --start-date 2022-05-01 --end-date 2022-05-15
#
# To use pre-defined symbol lists:
# python backtesting/backtrader/run_bt_v2.py --symbols5
# python backtesting/backtrader/run_bt_v2.py --symbols32
#
# To change strategy:
# python backtesting/backtrader/run_bt_v2.py --strategy time_based
#
# To disable plotting:
# python backtesting/backtrader/run_bt_v2.py --no-plot
#
# To set a different price threshold:
# python backtesting/backtrader/run_bt_v2.py --price-threshold 100
#
# To specify a custom output file:
# python backtesting/backtrader/run_bt_v2.py --output-file backtest_results.csv

    
