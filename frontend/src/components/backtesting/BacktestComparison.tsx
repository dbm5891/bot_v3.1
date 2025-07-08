import React, { useState, useMemo } from 'react';

// Interface to match the mapped data we're providing
interface BacktestResult {
  id: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  totalReturns: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  tradesCount: number;
  date: string;
}

interface BacktestComparisonProps {
  backtests: BacktestResult[];
  loading?: boolean;
  error?: string | null;
  onRemoveBacktest?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onExportData?: (format: 'csv' | 'json') => void;
}

// Metric definitions for tooltips
const metricDefinitions = {
  totalReturns: "Total percentage return of the backtest",
  sharpeRatio: "Measure of risk-adjusted return (higher is better)",
  maxDrawdown: "Maximum observed loss from a peak to a trough (lower is better)",
  winRate: "Percentage of winning trades",
  profitFactor: "Ratio of gross profits to gross losses (higher is better)",
  tradesCount: "Total number of trades executed"
};

// Compare options for sorting
const compareOptions = [
  { value: 'totalReturns', label: 'Total Returns' },
  { value: 'sharpeRatio', label: 'Sharpe Ratio' },
  { value: 'maxDrawdown', label: 'Max Drawdown' },
  { value: 'winRate', label: 'Win Rate' },
  { value: 'profitFactor', label: 'Profit Factor' },
  { value: 'tradesCount', label: 'Trades Count' }
];

const BacktestComparison: React.FC<BacktestComparisonProps> = ({
  backtests,
  loading = false,
  error = null,
  onRemoveBacktest,
  onViewDetails,
  onExportData
}) => {
  const [sortBy, setSortBy] = useState<string>('totalReturns');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedBacktests = useMemo(() => {
    if (!backtests || backtests.length === 0) return [];
    
    return [...backtests].sort((a, b) => {
      const aValue = a[sortBy as keyof BacktestResult];
      const bValue = b[sortBy as keyof BacktestResult];
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [backtests, sortBy, sortDirection]);

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'totalReturns':
      case 'maxDrawdown':
        return `${value.toFixed(2)}%`;
      case 'winRate':
        return `${(value * 100).toFixed(2)}%`;
      case 'sharpeRatio':
      case 'profitFactor':
        return value.toFixed(2);
      case 'tradesCount':
        return value.toString();
      default:
        return value.toString();
    }
  };

  const getBestValue = (metric: string) => {
    if (!backtests || backtests.length === 0) return null;
    
    let bestIndex = 0;
    let bestValue = backtests[0][metric as keyof BacktestResult] as number;
    
    backtests.forEach((backtest, index) => {
      const currentValue = backtest[metric as keyof BacktestResult] as number;
      
      // For most metrics, higher is better
      let isBetter = currentValue > bestValue;
      
      // For drawdown, lower is better
      if (metric === 'maxDrawdown') {
        isBetter = currentValue < bestValue;
      }
      
      if (isBetter) {
        bestIndex = index;
        bestValue = currentValue;
      }
    });
    
    return backtests[bestIndex].id;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>;
  }

  if (!backtests || backtests.length === 0) {
    return (
      <div className="bg-info text-info-content p-4 rounded">
        No backtests available for comparison. Run multiple backtests to compare their results.
      </div>
    );
  }

  return (
    <div className="bg-base-100 shadow-md rounded-lg">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <select
            className="select select-bordered select-primary w-full max-w-xs"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {compareOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="tooltip tooltip-primary" data-tip="Sort direction">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
            </button>
          </div>
        </div>
        {onExportData && (
          <div className="tooltip tooltip-primary" data-tip="Export comparison data">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => onExportData('csv')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div className="p-0">
        <div className="overflow-x-auto">
          <table className="table table-compact w-full">
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Symbol</th>
                <th>Timeframe</th>
                <th>
                  <div className="flex items-center">
                    Total Returns
                    <div className="tooltip tooltip-primary" data-tip={metricDefinitions.totalReturns}>
                      <button className="btn btn-ghost btn-xs btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </th>
                <th>
                  <div className="flex items-center">
                    Sharpe Ratio
                    <div className="tooltip tooltip-primary" data-tip={metricDefinitions.sharpeRatio}>
                      <button className="btn btn-ghost btn-xs btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </th>
                <th>
                  <div className="flex items-center">
                    Max Drawdown
                    <div className="tooltip tooltip-primary" data-tip={metricDefinitions.maxDrawdown}>
                      <button className="btn btn-ghost btn-xs btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </th>
                <th>
                  <div className="flex items-center">
                    Win Rate
                    <div className="tooltip tooltip-primary" data-tip={metricDefinitions.winRate}>
                      <button className="btn btn-ghost btn-xs btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </th>
                <th>
                  <div className="flex items-center">
                    Profit Factor
                    <div className="tooltip tooltip-primary" data-tip={metricDefinitions.profitFactor}>
                      <button className="btn btn-ghost btn-xs btn-circle">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedBacktests.map((backtest) => {
                const bestTotalReturns = getBestValue('totalReturns');
                const bestSharpe = getBestValue('sharpeRatio');
                const bestDrawdown = getBestValue('maxDrawdown');
                const bestWinRate = getBestValue('winRate');
                const bestProfitFactor = getBestValue('profitFactor');

                return (
                  <tr key={backtest.id} className="hover">
                    <td>
                      <div className="font-normal">{backtest.strategyName}</div>
                      <div className="text-sm text-gray-500">{new Date(backtest.date).toLocaleDateString()}</div>
                    </td>
                    <td>{backtest.symbol}</td>
                    <td>{backtest.timeframe}</td>
                    <td>
                      <div className="flex items-center">
                        <div className={`font-normal ${backtest.totalReturns >= 0 ? 'text-success' : 'text-error'} ${backtest.id === bestTotalReturns ? 'font-bold' : ''}`}>
                          {formatValue(backtest.totalReturns, 'totalReturns')}
                        </div>
                        {backtest.id === bestTotalReturns && (
                          <div className="ml-2 text-success text-sm font-bold">Best</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className={`font-normal ${backtest.id === bestSharpe ? 'font-bold' : ''}`}>
                          {formatValue(backtest.sharpeRatio, 'sharpeRatio')}
                        </div>
                        {backtest.id === bestSharpe && (
                          <div className="ml-2 text-success text-sm font-bold">Best</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className={`font-normal ${backtest.id === bestDrawdown ? 'font-bold' : ''}`}>
                          {formatValue(backtest.maxDrawdown, 'maxDrawdown')}
                        </div>
                        {backtest.id === bestDrawdown && (
                          <div className="ml-2 text-success text-sm font-bold">Best</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className={`font-normal ${backtest.id === bestWinRate ? 'font-bold' : ''}`}>
                          {formatValue(backtest.winRate, 'winRate')}
                        </div>
                        {backtest.id === bestWinRate && (
                          <div className="ml-2 text-success text-sm font-bold">Best</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className={`font-normal ${backtest.id === bestProfitFactor ? 'font-bold' : ''}`}>
                          {formatValue(backtest.profitFactor, 'profitFactor')}
                        </div>
                        {backtest.id === bestProfitFactor && (
                          <div className="ml-2 text-success text-sm font-bold">Best</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <div className="tooltip tooltip-primary" data-tip="View details">
                          <button
                            className="btn btn-ghost btn-xs btn-circle"
                            onClick={() => onViewDetails && onViewDetails(backtest.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        </div>
                        {onRemoveBacktest && (
                          <div className="tooltip tooltip-primary" data-tip="Remove from comparison">
                            <button
                              className="btn btn-ghost btn-xs btn-circle"
                              onClick={() => onRemoveBacktest(backtest.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BacktestComparison; 