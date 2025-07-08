import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchStrategies } from '../store/slices/strategySlice';
import { fetchAvailableData, fetchAvailableSymbols } from '../store/slices/dataSlice';
import { fetchBacktestHistory } from '../store/slices/backtestingSlice';
import { fetchPortfolioPerformance } from '../store/slices/portfolioSlice';
import { addNotification } from '../store/slices/uiSlice';
import { generatePerformanceData } from '../utils/generatePerformanceData';

// Debounce utility function
const debounce = <T extends (...args: any[]) => void>(func: T, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Custom hook for managing dashboard data loading and refreshing
 * @param initialTimeRange - The initial time range for performance data
 * @returns Dashboard data and utility functions
 */
export const useDashboardData = (initialTimeRange: string = 'ALL') => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(initialTimeRange);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Get data from the Redux store
  const { strategies, loading: strategiesLoading, error: strategiesError } = useSelector((state: RootState) => state.strategy);
  const { availableData, loading: dataLoading, error: dataError } = useSelector((state: RootState) => state.data);
  const { results, loading: backtestingLoading, error: backtestingError } = useSelector((state: RootState) => state.backtesting);
  const { performanceData, benchmarkData, loading: portfolioLoading, error: portfolioError, metrics } = useSelector((state: RootState) => state.portfolio);

  // Generate mock data for candlestick and volume
  const { candlestickData, volumeData } = useMemo(() => {
    if (!performanceData || performanceData.length === 0) {
      return { candlestickData: [], volumeData: [] };
    }
    
    const candleData = performanceData.map((p, i) => {
        const open = p.value * (1 - (Math.random() - 0.5) * 0.1);
        const close = p.value * (1 - (Math.random() - 0.5) * 0.1);
        const high = Math.max(open, close) * (1 + Math.random() * 0.05);
        const low = Math.min(open, close) * (1 - Math.random() * 0.05);
        return { date: p.date, open, high, low, close };
    });

    const volData = performanceData.map(p => ({
        date: p.date,
        volume: Math.random() * 1000000 + 50000,
    }));

    return { candlestickData: candleData, volumeData: volData };
  }, [performanceData]);

  // Function to refresh data
  const refreshData = useCallback(() => {
    setIsRefreshing(prev => {
      if (prev) return prev; // Don't refresh if already refreshing
      
      Promise.all([
        dispatch(fetchStrategies()),
        dispatch(fetchAvailableData()),
        dispatch(fetchAvailableSymbols()),
        dispatch(fetchBacktestHistory()),
        dispatch(fetchPortfolioPerformance(selectedTimeRange))
      ]).finally(() => {
        setIsRefreshing(false);
        setLastRefreshed(new Date());
      });
      
      return true;
    });
  }, [dispatch, selectedTimeRange]);

  // Debounced refresh function - only refresh portfolio performance to avoid conflicts
  const debouncedRefresh = useCallback(
    debounce(() => {
      if (!isRefreshing) {
        setIsRefreshing(true);
        dispatch(fetchPortfolioPerformance(selectedTimeRange)).finally(() => {
          setIsRefreshing(false);
          setLastRefreshed(new Date());
        });
      }
    }, 1000),
    [dispatch, selectedTimeRange, isRefreshing]
  );

  // Handle time range changes
  const handleTimeRangeChange = useCallback((range: string) => {
    setSelectedTimeRange(range);
    dispatch(fetchPortfolioPerformance(range));
  }, [dispatch]);

  // Effect for initial data loading (only fetch portfolio performance since other data is loaded in App.tsx)
  useEffect(() => {
    if (!performanceData || performanceData.length === 0) {
      dispatch(fetchPortfolioPerformance(selectedTimeRange));
    }
  }, [dispatch, selectedTimeRange, performanceData]);

  // Effect for handling auto-refresh
  useEffect(() => {
    if (!autoRefreshInterval) {
      setCountdownSeconds(null);
      return;
    }
    
    // Set initial countdown
    setCountdownSeconds(autoRefreshInterval);
    
    // Set up interval for countdown
    const countdownTimer = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev === null || prev <= 1) {
          return autoRefreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Set up interval for refresh
    const refreshTimer = setInterval(() => {
      debouncedRefresh();
    }, autoRefreshInterval * 1000);
    
    return () => {
      clearInterval(countdownTimer);
      clearInterval(refreshTimer);
    };
  }, [autoRefreshInterval, debouncedRefresh]);

  // Show toast notifications on errors
  useEffect(() => {
    if (strategiesError) {
      dispatch(addNotification({ type: 'error', message: `Error loading strategies: ${strategiesError}` }));
    }
    if (dataError) {
      dispatch(addNotification({ type: 'error', message: `Error loading data: ${dataError}` }));
    }
    if (backtestingError) {
      dispatch(addNotification({ type: 'error', message: `Error loading backtests: ${backtestingError}` }));
    }
    if (portfolioError) {
      dispatch(addNotification({ type: 'error', message: `Error loading performance: ${portfolioError}` }));
    }
  }, [strategiesError, dataError, backtestingError, portfolioError, dispatch]);

  // Format the last refreshed time
  const formatLastRefreshed = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastRefreshed.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'just now';
    } else if (diffMins === 1) {
      return '1 minute ago';
    } else if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else {
      return lastRefreshed.toLocaleTimeString();
    }
  };

  // Filter performance data based on selected time range
  const getFilteredData = (sourceData: Array<{ date: string; value: number }> | undefined, range: string) => {
    if (!sourceData || sourceData.length === 0) return [];

    if (range === 'ALL') return sourceData;

    const now = new Date();
    let cutoffDate: Date;

    // Handle YTD (Year to Date)
    if (range === 'YTD') {
      cutoffDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
    } else {
      // Get days from the selected range
      const rangeDays = parseInt(range.replace(/[^0-9]/g, ''), 10);
      const days = !isNaN(rangeDays) ? rangeDays * 30 : 365; // Default to 365 days
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - days);
    }

    return sourceData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };

  const filteredPerformanceData = getFilteredData(performanceData, selectedTimeRange);
  const filteredBenchmarkData = getFilteredData(benchmarkData, selectedTimeRange);

  // Calculate monthly return from performance data
  const calculateMonthlyReturn = () => {
    if (!filteredPerformanceData || filteredPerformanceData.length < 2) {
      return 0;
    }
    
    const latest = filteredPerformanceData[filteredPerformanceData.length - 1].value;
    const oneMonthAgo = filteredPerformanceData[filteredPerformanceData.length - 2]?.value;
    
    return oneMonthAgo !== undefined && oneMonthAgo !== 0 
      ? ((latest - oneMonthAgo) / oneMonthAgo) * 100 
      : 0;
  };

  // Enhance metrics with calculated values if needed
  const enhancedMetrics = metrics ? {
    ...metrics,
    monthlyReturn: calculateMonthlyReturn()
  } : null;

  return {
    // Data
    strategies,
    availableData,
    results: results?.slice(0, 5) || [], // Recent backtests (top 5)
    performanceData: filteredPerformanceData,
    benchmarkData: filteredBenchmarkData,
    candlestickData,
    volumeData,
    metrics: enhancedMetrics,
    
    // State
    loading: {
      global: strategiesLoading || dataLoading || backtestingLoading || portfolioLoading,
      strategies: strategiesLoading,
      data: dataLoading,
      backtests: backtestingLoading,
      performance: portfolioLoading,
    },
    errors: {
      strategiesError,
      dataError,
      backtestingError,
      portfolioError
    },
    selectedTimeRange,
    lastRefreshed,
    formatLastRefreshed,
    countdownSeconds,
    autoRefreshInterval,
    isRefreshing,
    
    // Actions
    refreshData: debouncedRefresh,
    handleTimeRangeChange,
    setAutoRefreshInterval
  };
}; 