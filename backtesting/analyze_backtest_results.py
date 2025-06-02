import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from pathlib import Path
import json
import argparse

def load_results(results_file):
    """Load backtest results from JSON or CSV file"""
    if results_file.suffix == '.json':
        with open(results_file, 'r') as f:
            data = json.load(f)
        return pd.DataFrame(data)
    elif results_file.suffix == '.csv':
        return pd.read_csv(results_file)
    else:
        raise ValueError("Results file must be JSON or CSV")

def create_performance_summary(df, output_dir):
    """Create performance summary tables and charts"""
    
    # Performance summary by strategy
    strategy_summary = df.groupby('strategy').agg({
        'total_return': ['mean', 'std', 'min', 'max'],
        'sharpe_ratio': ['mean', 'std'],
        'max_drawdown': ['mean', 'max'],
        'total_trades': 'mean',
        'winning_trades': 'mean',
        'losing_trades': 'mean'
    }).round(4)
    
    strategy_summary.columns = ['_'.join(col).strip() for col in strategy_summary.columns]
    strategy_summary.to_csv(output_dir / 'strategy_performance_summary.csv')
    
    # Performance summary by data file (symbol)
    symbol_summary = df.groupby('data_file').agg({
        'total_return': ['mean', 'std', 'min', 'max'],
        'sharpe_ratio': ['mean', 'std'],
        'max_drawdown': ['mean', 'max'],
        'total_trades': 'mean'
    }).round(4)
    
    symbol_summary.columns = ['_'.join(col).strip() for col in symbol_summary.columns]
    symbol_summary.to_csv(output_dir / 'symbol_performance_summary.csv')
    
    return strategy_summary, symbol_summary

def create_visualizations(df, output_dir):
    """Create performance visualization charts"""
    
    # Set style
    plt.style.use('seaborn-v0_8')
    fig_size = (12, 8)
    
    # 1. Strategy Performance Comparison
    fig, axes = plt.subplots(2, 2, figsize=(15, 12))
    
    # Total Return by Strategy
    df.boxplot(column='total_return', by='strategy', ax=axes[0,0])
    axes[0,0].set_title('Total Return Distribution by Strategy')
    axes[0,0].set_xlabel('Strategy')
    axes[0,0].set_ylabel('Total Return')
    
    # Sharpe Ratio by Strategy
    df.boxplot(column='sharpe_ratio', by='strategy', ax=axes[0,1])
    axes[0,1].set_title('Sharpe Ratio Distribution by Strategy')
    axes[0,1].set_xlabel('Strategy')
    axes[0,1].set_ylabel('Sharpe Ratio')
    
    # Max Drawdown by Strategy
    df.boxplot(column='max_drawdown', by='strategy', ax=axes[1,0])
    axes[1,0].set_title('Max Drawdown Distribution by Strategy')
    axes[1,0].set_xlabel('Strategy')
    axes[1,0].set_ylabel('Max Drawdown (%)')
    
    # Win Rate by Strategy (calculate win rate)
    df['win_rate'] = df['winning_trades'] / (df['winning_trades'] + df['losing_trades']) * 100
    df.boxplot(column='win_rate', by='strategy', ax=axes[1,1])
    axes[1,1].set_title('Win Rate Distribution by Strategy')
    axes[1,1].set_xlabel('Strategy')
    axes[1,1].set_ylabel('Win Rate (%)')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'strategy_performance_comparison.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 2. Risk-Return Scatter Plot
    fig, ax = plt.subplots(figsize=fig_size)
    
    for strategy in df['strategy'].unique():
        strategy_data = df[df['strategy'] == strategy]
        ax.scatter(strategy_data['max_drawdown'], strategy_data['total_return'], 
                  label=strategy, alpha=0.7, s=60)
    
    ax.set_xlabel('Max Drawdown (%)')
    ax.set_ylabel('Total Return')
    ax.set_title('Risk-Return Profile by Strategy')
    ax.legend()
    ax.grid(True, alpha=0.3)
    
    plt.savefig(output_dir / 'risk_return_scatter.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 3. Performance Heatmap
    pivot_table = df.pivot_table(values='total_return', index='strategy', columns='data_file', aggfunc='mean')
    
    fig, ax = plt.subplots(figsize=(14, 8))
    sns.heatmap(pivot_table, annot=True, cmap='RdYlGn', center=0, fmt='.3f', ax=ax)
    ax.set_title('Strategy Performance Heatmap (Total Return)')
    plt.tight_layout()
    plt.savefig(output_dir / 'performance_heatmap.png', dpi=300, bbox_inches='tight')
    plt.close()
    
    # 4. Top Performers Chart
    top_performers = df.nlargest(10, 'total_return')[['strategy', 'data_file', 'total_return', 'sharpe_ratio']]
    
    fig, ax = plt.subplots(figsize=fig_size)
    x_pos = np.arange(len(top_performers))
    bars = ax.bar(x_pos, top_performers['total_return'], color='green', alpha=0.7)
    
    ax.set_xlabel('Strategy + Symbol')
    ax.set_ylabel('Total Return')
    ax.set_title('Top 10 Performing Strategy-Symbol Combinations')
    ax.set_xticks(x_pos)
    ax.set_xticklabels([f"{row['strategy']}\n{Path(row['data_file']).stem}" 
                       for _, row in top_performers.iterrows()], rotation=45, ha='right')
    
    # Add value labels on bars
    for bar, value in zip(bars, top_performers['total_return']):
        ax.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.01,
               f'{value:.3f}', ha='center', va='bottom')
    
    plt.tight_layout()
    plt.savefig(output_dir / 'top_performers.png', dpi=300, bbox_inches='tight')
    plt.close()

def generate_report(df, output_dir):
    """Generate comprehensive HTML report"""
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>Backtesting Suite Results</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 40px; }}
            h1, h2 {{ color: #333; }}
            table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
            th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
            th {{ background-color: #f2f2f2; }}
            .metric {{ background-color: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; }}
            .chart {{ text-align: center; margin: 20px 0; }}
        </style>
    </head>
    <body>
        <h1>Backtesting Suite Results Report</h1>
        <p>Generated: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        
        <h2>Executive Summary</h2>
        <div class="metric">
            <strong>Total Backtests Run:</strong> {len(df)}<br>
            <strong>Strategies Tested:</strong> {df['strategy'].nunique()}<br>
            <strong>Symbols Analyzed:</strong> {df['data_file'].nunique()}<br>
            <strong>Average Return:</strong> {df['total_return'].mean():.3f}<br>
            <strong>Best Performing Strategy:</strong> {df.loc[df['total_return'].idxmax(), 'strategy']}<br>
            <strong>Highest Return:</strong> {df['total_return'].max():.3f}
        </div>
        
        <h2>Performance Charts</h2>
        <div class="chart">
            <img src="strategy_performance_comparison.png" alt="Strategy Performance Comparison">
        </div>
        <div class="chart">
            <img src="risk_return_scatter.png" alt="Risk-Return Profile">
        </div>
        <div class="chart">
            <img src="performance_heatmap.png" alt="Performance Heatmap">
        </div>
        <div class="chart">
            <img src="top_performers.png" alt="Top Performers">
        </div>
        
        <h2>Strategy Rankings</h2>
        <p>Strategies ranked by average total return:</p>
        <table>
            <tr>
                <th>Rank</th>
                <th>Strategy</th>
                <th>Avg Return</th>
                <th>Avg Sharpe</th>
                <th>Avg Max DD</th>
                <th>Std Return</th>
            </tr>
    """
    
    # Strategy rankings
    strategy_stats = df.groupby('strategy').agg({
        'total_return': ['mean', 'std'],
        'sharpe_ratio': 'mean',
        'max_drawdown': 'mean'
    }).round(4)
    
    strategy_stats.columns = ['avg_return', 'std_return', 'avg_sharpe', 'avg_drawdown']
    strategy_stats = strategy_stats.sort_values('avg_return', ascending=False)
    
    for rank, (strategy, row) in enumerate(strategy_stats.iterrows(), 1):
        html_content += f"""
            <tr>
                <td>{rank}</td>
                <td>{strategy}</td>
                <td>{row['avg_return']:.3f}</td>
                <td>{row['avg_sharpe']:.3f}</td>
                <td>{row['avg_drawdown']:.3f}</td>
                <td>{row['std_return']:.3f}</td>
            </tr>
        """
    
    html_content += """
        </table>
        
        <h2>Data Files</h2>
        <p>For detailed results, see the CSV files generated alongside this report.</p>
        
    </body>
    </html>
    """
    
    with open(output_dir / 'backtest_report.html', 'w') as f:
        f.write(html_content)

def main():
    """Main function to analyze backtest results"""
    parser = argparse.ArgumentParser(description='Analyze comprehensive backtest results')
    parser.add_argument('results_file', help='Path to results JSON or CSV file')
    parser.add_argument('--output-dir', default=None, help='Output directory for analysis')
    
    args = parser.parse_args()
    
    # Load results
    results_file = Path(args.results_file)
    if not results_file.exists():
        print(f"Error: Results file {results_file} not found")
        return
    
    df = load_results(results_file)
    
    # Set output directory
    if args.output_dir:
        output_dir = Path(args.output_dir)
    else:
        output_dir = results_file.parent / 'analysis'
    
    output_dir.mkdir(exist_ok=True)
    
    print(f"Analyzing {len(df)} backtest results...")
    print(f"Output directory: {output_dir}")
    
    # Generate analysis
    strategy_summary, symbol_summary = create_performance_summary(df, output_dir)
    create_visualizations(df, output_dir)
    generate_report(df, output_dir)
    
    print("Analysis complete!")
    print(f"View the report at: {output_dir / 'backtest_report.html'}")

if __name__ == "__main__":
    main()
