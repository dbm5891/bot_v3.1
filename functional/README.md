# Functional Utilities

This directory contains utility modules that provide core functionality for the Bot v3.1 trading system.

## Overview

The functional modules provide essential utilities for:

- DataFrame manipulation and analysis
- File operations and data management
- General utility functions

## Modules

### dataframes.py

Provides dataframe manipulation utilities:

- `print_df()`: Formatted dataframe printing
- `print_df_index_range()`: Display the range of dates in a dataframe
- DataFrame filtering, transformation, and analysis functions
- Statistical operations on time series data

### files.py

Handles file operations:

- `list_tuple_to_csv()`: Export lists of tuples to CSV files
- Reading and writing data to various file formats
- File path manipulation and management
- Directory operations

### util.py

Contains general utility functions:

- Date and time manipulation
- Data formatting and type conversion
- Mathematical and statistical utilities
- Configuration management

## Usage

Import these modules as needed in your backtesting and analysis scripts:

```python
from functional.dataframes import print_df, print_df_index_range
from functional.files import list_tuple_to_csv
from functional.util import [function_name]
```

## Integration

These utility functions are used throughout the project:

- By the backtesting framework for data manipulation
- By TA modules for file operations
- By data collection scripts for formatting and storage