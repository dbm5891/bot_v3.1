# Changelog

All notable changes to the Bot v3.1 trading system will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.1] - 2025-05-05

### Fixed

- Resolved blank page issue when navigating to the Market Data page in the frontend application
- Fixed incorrect Redux store import paths in MarketDataPage component
- Updated DataUploadDialog component to use proper Material UI Grid implementation
- Added missing data properties required by the DataTable component
- Enhanced error handling for data fetching operations by adding retry logic, improved logging for failed requests, and better handling of network timeouts

## [3.1.0] - 2025-05-01

### Added
- Complete documentation suite with comprehensive guides
  - Quick start guide (QUICKSTART.md)
  - Strategy development workflow (backtesting/STRATEGY_DEVELOPMENT.md)
  - Order management and position sizing (backtesting/ORDER_MANAGEMENT.md)
  - Multiple timeframe analysis (backtesting/MULTIPLE_TIMEFRAME_ANALYSIS.md)
  - Complete troubleshooting guide (TROUBLESHOOTING.md)
- Improved statistical analysis tools in (`backtesting/STATISTICAL_ANALYSIS.md`)
- Enhanced visualization capabilities with multiple plot types:
  - Candlestick charts (dfs_plot_mpf_candles.py)
  - Position tracking (dfs_plot2_positions.py)
  - Drawdown analysis (`dfs_plot2_drawdown.py`)
- Sample strategy implementations in `backtesting/strategies/`
- Integration with TradingView for strategy prototyping
- Webhook receiver for TradingView alerts
- Pine Script to Python translation utilities
- Dual moving average strategy with ATR volatility filter example (`backtesting/STRATEGY_EXAMPLE.md`)
- Machine learning integration capabilities (`backtesting/MACHINE_LEARNING_INTEGRATION.md`)
- Frontend React/Redux application with comprehensive market data management
- Added new architectural diagrams in the `diagrams/` directory to clarify system design and improve developer understanding

### Changed
- Optimized data preparation workflow in dfs_prepare.py
- Improved backtrader integration with enhanced run_bt_v2.py
- Enhanced indicator calculation performance:
  - Separate timeframe optimizations (dfs_set_ta_indicators_1D.py and dfs_set_ta_indicators_5m.py)
  - Custom indicator implementations (pandas_ta_custom_indicators.py)
- Restructured project organization for better maintainability
  - Split documentation into specialized guides
  - Organized backtesting scripts by functionality
- Updated dependencies to latest compatible versions in requirements.txt
- Migrated frontend build system to Vite for improved development experience
- Enhanced React components with Material UI for consistent design language

### Fixed
- Time synchronization issues in multi-timeframe analysis
- Data handling for missing values in market data
- Visualization scaling for different timeframes
- Memory usage optimizations for large datasets
- Normal distribution handling in tests (df_test31_normal_distribution.py, df_test32_normal_distribution.py)
- Cross-timeframe data alignment issues in df_test4_normal_distribution_1d.py and df_test4_normal_distribution_5m.py

## [3.0.1] - 2025-01-15

### Added
- TypeScript-based frontend application structure
- Initial Redux store implementation for state management
- Material UI integration for component design
- Basic routing setup with React Router
- Dashboard and data visualization components
- Page layout system with responsive design

### Changed
- Switched from Python Dash to React for frontend implementation
- Updated normal distribution testing methodology (df_test4_normal_distribution_1d.py, df_test4_normal_distribution_5m.py)
- Improved plotting capabilities with new visualization utilities

### Fixed
- Data visualization edge cases for extreme values
- User interface inconsistencies in early prototypes
- Compilation errors in TypeScript strict mode
- State management issues in early component architecture

## [3.0.0] - 2024-10-15

### Added
- Initial Backtrader integration with run_bt_v1.0.py and run_bt_v1.1.py
- Support for multiple data sources in csv_input/ directory
- Basic strategy templates in backtesting/strategies/
- Technical analysis indicator library in ta/ directory
- CSV data handling utilities in backtesting/
  - Data preparation scripts (dfs_prepare.py)
  - Multiple timeframe support (1D and 5m)
- Statistical analysis functions in backtesting/STATISTICAL_ANALYSIS.md
- Visualization scripts for strategy analysis:
  - Basic plotting (dfs_plot.py)
  - Difference analysis (dfs_plot1_diff.py)
  - Column-specific visualization (dfs_plot2_column.py)
- Position tracking and trade analysis with dfs_plot2_positions.py and dfs_plot3_orders_pairs.py
- Comprehensive backtesting framework with run_bt_v1.1.py
- Order management tools with visualization (dfs_plot3_orders_list.py, dfs_plot3_orders_pairs.py)
- Architecture and component diagrams in the diagrams/ directory

### Changed
- Complete rewrite of backtesting engine from run_bt_v1.0.py to run_bt_v1.1.py and run_bt_v2.py
- New API for strategy development in backtesting/strategies/
- Improved data handling capabilities with dfs_prepare.py
- Enhanced architecture as documented in diagrams/architecture_diagram.md
- Component structure improvements detailed in diagrams/component_diagram.md
- Added support for normal distribution analysis with df_test31_normal_distribution.py
- Upgraded indicator calculation with more sophisticated algorithms

### Fixed
- Inconsistent data formatting in CSV files
- Strategy initialization errors in backtesting engine
- Memory leaks during long backtest runs
- Indicator calculation accuracy issues
- Error handling in strategy execution flow

## [2.5.1] - 2024-06-10

### Added
- Enhanced testing framework with df_test2.py and df_test3.py
- Additional data plotting utilities (dfs_plot1.py, dfs_plot2.py, dfs_plot3.py)
- Column-specific visualization tools (dfs_plot2_column.py, dfs_plot2_column1.py)
- Initial documentation structure for backtesting processes

### Changed
- Improved indicator calculation for different timeframes
- Expanded technical analysis library with new indicators
- Updated data preparation pipeline with better filtering

### Fixed
- Performance bottlenecks in data transformation
- Calculation errors in specific technical indicators
- Date alignment issues in multi-timeframe analysis

## [2.5.0] - 2024-02-20

### Added
- Support for TD Ameritrade API integration
- Real-time data collection scripts
- Basic backtesting framework (early versions of run_bt_func.py)
- Fundamental technical indicators in ta/ directory
- True range calculation (dfs_plot2_true_range.py)
- Initial testing framework with df_test.py and df_test1.py
- Separate indicator calculation scripts for different timeframes:
  - Daily timeframe (dfs_set_ta_indicators_1D.py)
  - 5-minute timeframe (dfs_set_ta_indicators_5m.py)
- Multi-variant indicator implementations (dfs_set_ta_indicators_1D_1.py, dfs_set_ta_indicators_1D_2.py)

### Changed
- Enhanced data storage format to support multiple timeframes
- Improved logging system for better debugging
- Initial frontend architecture design
- Restructured functional/ directory for core algorithm components
- Split indicator calculation logic into timeframe-specific implementations
- Added specialized variant implementations for optimization testing

### Fixed
- Data parsing issues with different CSV formats
- Timestamp standardization across data sources
- Indicator calculation edge cases
- Script execution order dependencies
- Performance issues in 5-minute data processing

## [2.1.0] - 2023-12-05

### Added
- Initial technical analysis library structure in ta/ directory
- Basic indicator implementations for trend following
- First version of backtesting function library (run_bt_func.py)
- Data preparation utilities (early version of dfs_prepare.py)
- Extended CSV data collection for Apple stock (AAPL)

### Changed
- Improved data organization with structured csv_input/ directory
- Better script organization with functional separation
- Enhanced documentation with README files in key directories

### Fixed
- Historical data consistency issues
- Calculation performance for large datasets
- Data loading and validation problems

## [2.0.0] - 2023-08-10

### Added
- Initial algorithmic trading framework in functional/ directory
- Support for manual trading signals
- Basic market data collection scripts
- Simple moving average strategies implementation
- Daily timeframe analysis capability
- Project documentation structure (README.md, CONTRIBUTING.md)
- Installation scripts in scripts/ directory (install_nodejs.ps1)
- Initial data visualization tools (early versions of dfs_plot.py)
- First datasets for backtesting in csv_input/ directory

### Changed
- Shifted from manual analysis to algorithmic approach
- Improved data collection methods
- Standardized code structure and organization
- Created separation between data, algorithms, and visualization
- Established clear directory structure for scaling

### Fixed
- Data consistency issues between sources
- Calculation errors in technical indicators
- Performance bottlenecks in data processing
- File naming conventions for better organization

## [1.1.0] - 2023-05-20

### Added
- Extended data collection for multiple symbols
- Additional manual analysis tools
- Early versions of technical indicators
- Improved data cleaning utilities
- Initial project structure planning

### Changed
- Better organization of data files
- Improved documentation of manual processes
- Standardized naming conventions for data files

### Fixed
- Data download reliability issues
- CSV parsing for different data sources
- Date format handling across tools

## [1.0.0] - 2023-01-15

### Added
- Basic market data downloading functionality
- Simple CSV data processing scripts
- Price chart visualization tools
- Manual trading helper functions
- Initial project structure and documentation
- Support for daily data analysis of major symbols
- Foundational technical indicator calculations
- First datasets for Apple stock (AAPL) backtesting
- Simple data transformations for analysis

### Changed
- Established consistent data formats for future development
- Defined project goals and roadmap
- Created initial file organization structure

### Fixed
- Data source connectivity issues
- CSV parsing inconsistencies
- Date format standardization
- Basic error handling for data loading