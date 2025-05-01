# Operational Scripts

This directory contains operational scripts for the Bot v3.1 trading system, providing data collection, real-time market interaction, and testing capabilities.

## Overview

The scripts in this directory are designed for:

- Recording live market quotes from TD Ameritrade
- Running live trading operations
- Testing new functionality in isolated environments
- Processing and formatting market data

## Main Scripts

- **run_record_quotes.py**: Records real-time market quotes from TD Ameritrade's API
- Additional operational scripts for executing trades and managing the bot's runtime behavior

## Testing Directory

The `/testing` subdirectory contains:

### Plot Testing

The `/testing/plot` directory focuses on visualization testing:
- Chart rendering experiments
- Custom plot types for technical analysis
- Performance visualization tools

### Polygon Integration

The `/testing/polygon` directory contains scripts for working with the Polygon.io market data API:
- Data fetching and normalization
- Converting Polygon data to formats compatible with the backtesting framework
- Comparison tools for different data sources

## Usage

### Recording Market Quotes

To start recording real-time market quotes:

```bash
cd c:\Users\dbm58\bot_v3.1
python scripts\run_record_quotes.py
```

### Running Test Scripts

Testing scripts can be executed individually:

```bash
cd c:\Users\dbm58\bot_v3.1
python scripts\testing\plot\[script_name].py
```

## Integration

The scripts directory integrates with the rest of the system:

- Recorded data feeds into the backtesting framework
- Test results help refine strategies and indicators
- Visualization tools provide real-time feedback on trading performance
- Polygon integration expands available data sources for analysis