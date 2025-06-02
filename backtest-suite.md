# Backtesting Suite Workflow

This workflow runs comprehensive backtesting across multiple strategies and datasets, generating comparative performance reports and visualizations.

## Overview

This workflow will:
1. Run all available strategies against multiple symbols
2. Generate comparative performance reports
3. Create visualization dashboards
4. Export results to standardized formats
5. Archive results with timestamps

## Prerequisites

Before running this workflow, ensure:
- Historical data is prepared and available in `backtesting/csv_input/`
- Required Python packages are installed (`pip install -r requirements.txt`)
- All strategy files are properly implemented in `backtesting/backtrader/strategies/`

## Workflow Steps

### Step 1: Environment Setup and Data Validation

First, let's verify the environment and available data:

```xml
<execute_command>
<command>cd backtesting && python -c "import os; print('Available CSV files:'); [print(f) for f in os.listdir('csv_input') if f.endswith('.csv')]"</command>
<requires_approval>false</requires_approval>
</execute_command>
```

### Step 2: List Available Strategies

Identify all available strategies for testing:

```xml
<execute_command>
<command>cd backtesting/backtrader/strategies && python -c "import os; strategies = [f[:-3] for f in os.listdir('.') if f.endswith('.py') and not f.startswith('__')]; print('Available strategies:'); [print(f'- {s}') for s in strategies]"</command>
<requires_approval>false</requires_approval>
</execute_command>
```

### Step 3: Run Comprehensive Backtesting

Execute the comprehensive backtesting script:

```xml
<execute_command>
<command>cd backtesting && python run_comprehensive_backtest.py</command>
<requires_approval>false</requires_approval>
</execute_command>
```

This will:
- Create a timestamped results directory
- Run all strategies against all available data files
- Save results in both JSON and CSV formats
- Display progress and final summary

### Step 4: Generate Performance Analysis

Run the analysis script on the generated results:

```xml
<execute_command>
<command>cd backtesting && python analyze_backtest_results.py outputs/comprehensive_backtest_*/backtest_results.csv</command>
<requires_approval>false</requires_approval>
</execute_command>
```

This will generate:
- Strategy performance summaries
- Symbol performance summaries
- Performance visualization charts
- Risk-return analysis
- Comprehensive HTML report

### Step 5: View Results

Open the generated HTML report:

```xml
<execute_command>
<command>cd backtesting && start outputs/comprehensive_backtest_*/analysis/backtest_report.html</command>
<requires_approval>false</requires_approval>
</execute_command>
```

On macOS/Linux, use:
```bash
open outputs/comprehensive_backtest_*/analysis/backtest_report.html
```

### Step 6: Archive Results (Optional)

Create a backup of the results with descriptive naming:

```xml
<ask_followup_question>
<question>Would you like to archive these results with a custom name for future reference?</question>
<options>["Yes, archive with custom name", "No, keep current timestamp naming"]</options>
</ask_followup_question>
```

If yes, rename the results directory:

```xml
<execute_command>
<command>cd backtesting/outputs && set /p name="Enter archive name: " && ren comprehensive_backtest_* %name%_results</command>
<requires_approval>false</requires_approval>
</execute_command>
```

## Output Files Generated

### Primary Results
- `backtest_results.json` - Complete results in JSON format
- `backtest_results.csv` - Results in CSV format for analysis

### Analysis Reports
- `strategy_performance_summary.csv` - Performance metrics by strategy
- `symbol_performance_summary.csv` - Performance metrics by symbol
- `backtest_report.html` - Comprehensive visual report

### Visualization Charts
- `strategy_performance_comparison.png` - Box plots of strategy performance
- `risk_return_scatter.png` - Risk vs return scatter plot
- `performance_heatmap.png` - Strategy-symbol performance heatmap
- `top_performers.png` - Top 10 performing combinations

## Customization Options

### Modifying Strategy List

Edit the `get_available_strategies()` function in `run_comprehensive_backtest.py` to include/exclude specific strategies:

```python
def get_available_strategies():
    """Get list of available strategy classes"""
    strategies = [
        'st_sma_close',
        'st_smas_cross', 
        'st_each_bar_long',
        'st_each_bar_short',
        'st_find_peaks',
        'st_signal_peaks_long'
    ]
    return strategies
```

### Adjusting Date Range

Modify the date range in the `run_strategy_backtest()` function:

```python
data = bt.feeds.YahooFinanceCSVData(
    dataname=data_file,
    fromdate=datetime.datetime(2022, 1, 1),  # Start date
    todate=datetime.datetime(2024, 12, 31),   # End date
    reverse=False
)
```

### Adding New Analyzers

Include additional backtrader analyzers for more metrics:

```python
cerebro.addanalyzer(bt.analyzers.VWR, _name='vwr')  # Variability-Weighted Return
cerebro.addanalyzer(bt.analyzers.SQN, _name='sqn')  # System Quality Number
cerebro.addanalyzer(bt.analyzers.Calmar, _name='calmar')  # Calmar Ratio
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all strategy files are properly imported
2. **Data Format Issues**: Verify CSV files match expected format
3. **Memory Issues**: For large datasets, consider running strategies in batches
4. **Missing Dependencies**: Install required packages with `pip install -r requirements.txt`

### Performance Optimization

- Run backtests in parallel using multiprocessing
- Filter data files to specific symbols or date ranges
- Use data compression for large result sets
- Implement progress bars for long-running operations

## Integration with Other Workflows

This workflow can be combined with:
- Strategy optimization workflows
- Paper trading validation
- Risk management analysis
- Performance monitoring dashboards

## Best Practices

1. **Version Control**: Track strategy changes and results over time
2. **Documentation**: Document any modifications to strategies or parameters
3. **Validation**: Cross-validate results with different data sources
4. **Regular Updates**: Rerun comprehensive tests when strategies are modified
5. **Risk Assessment**: Always evaluate maximum drawdown and risk metrics
