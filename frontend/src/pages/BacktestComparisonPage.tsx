import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import BacktestComparison from '../components/backtesting/BacktestComparison';
import { fetchBacktestHistory, BacktestResult } from '../store/slices/backtestingSlice';
import AppLayout from '../layouts/AppLayoutNew';

function a11yProps(index: number) {
  return {
    id: `backtest-tab-${index}`,
    'aria-controls': `backtest-tabpanel-${index}`,
  };
}

const BacktestComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [tabValue, setTabValue] = useState(0);
  const [selectedBacktests, setSelectedBacktests] = useState<string[]>([]);
  
  const { results, loading, error } = useSelector((state: RootState) => state.backtesting);

  useEffect(() => {
    dispatch(fetchBacktestHistory());
  }, [dispatch]);

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  const handleSelectBacktest = (id: string) => {
    if (selectedBacktests.includes(id)) {
      setSelectedBacktests(selectedBacktests.filter(item => item !== id));
    } else {
      // Limit to 5 backtests for comparison to keep the UI clean
      if (selectedBacktests.length < 5) {
        setSelectedBacktests([...selectedBacktests, id]);
      }
    }
  };

  const handleRemoveBacktest = (id: string) => {
    setSelectedBacktests(selectedBacktests.filter(item => item !== id));
  };

  const handleClearAll = () => {
    setSelectedBacktests([]);
  };

  const handleExportData = (format: 'csv' | 'json') => {
    if (!results) return;
    
    const selectedResults = results.filter(result => selectedBacktests.includes(result.id));
    
    if (selectedResults.length === 0) return;
    
    let content = '';
    let filename = '';
    
    if (format === 'csv') {
      // Create CSV content
      const headers = 'Strategy,Symbol,Timeframe,Start Date,End Date,Total Returns,Sharpe Ratio,Max Drawdown,Win Rate,Profit Factor,Trades Count,Date\n';
      const rows = selectedResults.map(result => 
        `${result.strategyName},${result.symbol},${result.timeframe},${result.startDate},${result.endDate},${result.totalReturn || 0},${result.sharpeRatio},${result.maxDrawdown || 0},${result.winRate},${result.profitFactor || 0},${result.trades},${result.createdAt || ''}`
      ).join('\n');
      
      content = headers + rows;
      filename = `backtest-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      // Create JSON content
      content = JSON.stringify(selectedResults, null, 2);
      filename = `backtest-comparison-${new Date().toISOString().slice(0, 10)}.json`;
    }
    
    // Create download link
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Map the results to the format expected by the BacktestComparison component
  const mapToComparisonData = (backtests: BacktestResult[]) => {
    return backtests.map(backtest => ({
      id: backtest.id,
      strategyName: backtest.strategyName,
      symbol: backtest.symbol,
      timeframe: backtest.timeframe,
      startDate: backtest.startDate,
      endDate: backtest.endDate,
      totalReturns: backtest.totalReturn || 0,
      sharpeRatio: backtest.sharpeRatio,
      maxDrawdown: backtest.maxDrawdown || 0,
      winRate: backtest.winRate,
      profitFactor: backtest.profitFactor || 0,
      tradesCount: backtest.trades,
      date: backtest.createdAt || new Date().toISOString()
    }));
  };

  // Filter results for the selected backtests
  const comparisonData = results 
    ? mapToComparisonData(results.filter(result => selectedBacktests.includes(result.id)))
    : [];

  // All available backtests to select from
  const availableBacktests = results || [];
  
  return (
    <AppLayout>
      <div className="container max-w-lg">
        <div className="p-3 mt-3 border rounded-lg shadow-dashboard hover:shadow-card-hover transition-shadow duration-200">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
              </svg>
              <h1 className="text-2xl font-bold">
                Backtest Comparison
              </h1>
            </div>
            <div>
              <button 
                className="mr-1 bg-white text-sm text-slate-900 border border-border focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                onClick={() => navigate('/backtesting')}
              >
                New Backtest
              </button>
              <button 
                className="bg-white text-sm text-slate-900 border border-border focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                onClick={() => navigate('/backtesting')}
              >
                Backtest History
              </button>
            </div>
          </div>
          <div className="h-px my-3 bg-gray-200"></div>

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-3">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline">{error}</span>
              </div>
            </div>
          )}

          {/* Main content when loaded */}
          {!loading && !error && (
            <>
              <div className="border-b border-border/50">
                <div className="flex justify-center">
                  <div className="flex space-x-2">
                    <button
                      className="px-4 py-2 bg-white text-sm font-medium text-slate-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      onClick={() => handleTabChange(0)}
                    >
                      Compare Backtests
                    </button>
                    <button
                      className="px-4 py-2 bg-white text-sm font-medium text-slate-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-300"
                      onClick={() => handleTabChange(1)}
                    >
                      Select Backtests
                    </button>
                  </div>
                </div>
              </div>

              {/* Tab 1: Comparison view */}
              {tabValue === 0 && (
                <>
                  {selectedBacktests.length === 0 ? (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
                      Please select backtests to compare from the "Select Backtests" tab.
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">
                          Comparing {selectedBacktests.length} backtests
                        </span>
                        <div className="flex space-x-2">
                          <button 
                            className="text-sm text-red-500 hover:text-red-700"
                            onClick={handleClearAll}
                          >
                            Clear All
                          </button>
                          <button 
                            className="text-sm text-blue-500 hover:text-blue-700"
                            onClick={() => handleExportData('csv')}
                          >
                            Export CSV
                          </button>
                        </div>
                      </div>

                      <BacktestComparison 
                        backtests={comparisonData}
                        onRemoveBacktest={handleRemoveBacktest}
                        onViewDetails={(id) => navigate(`/backtesting/${id}`)}
                        onExportData={handleExportData}
                      />
                    </>
                  )}
                </>
              )}

              {/* Tab 2: Selection view */}
              {tabValue === 1 && (
                <>
                  {availableBacktests.length === 0 ? (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
                      No backtests found. Run some backtests first to compare them.
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <span className="text-base font-medium text-slate-900">
                          Select up to 5 backtests to compare (selected: {selectedBacktests.length}/5)
                        </span>
                        {selectedBacktests.length > 0 && (
                          <button 
                            className="mt-1 bg-blue-500 text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            onClick={() => handleTabChange(0)}
                          >
                            Compare Selected
                          </button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {availableBacktests.map((backtest) => {
                          const isSelected = selectedBacktests.includes(backtest.id);
                          return (
                            <div 
                              key={backtest.id}
                              className={`p-2 w-32 ${isSelected ? 'border-2 border-blue-500 shadow-card-hover' : 'border border-border/50 shadow-dashboard'} ${isSelected ? 'bg-blue-50' : ''} hover:shadow-card-hover transition-shadow duration-200 rounded-lg`}
                              onClick={() => handleSelectBacktest(backtest.id)}
                            >
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{backtest.strategyName}</span>
                                {isSelected && (
                                  <span className="text-sm text-blue-500">Selected</span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {backtest.symbol} • {backtest.timeframe}
                              </span>
                              <div className="flex justify-between mt-2">
                                <span className="text-sm">
                                  Returns: <span className={`font-bold ${backtest.totalReturn && backtest.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {(backtest.totalReturn || 0).toFixed(2)}%
                                  </span>
                                </span>
                                <span className="text-sm">
                                  Date: {new Date(backtest.createdAt || '').toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default BacktestComparisonPage; 