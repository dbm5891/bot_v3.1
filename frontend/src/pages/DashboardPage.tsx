import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Alert,
  Menu,
  useTheme,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';

import DashboardHeader from '../components/dashboard/DashboardHeader';
import { exportToCsv, formatPerformanceDataForExport, exportDashboardData } from '../utils/exportUtils';
import { timeRanges, getFilteredData, PerformanceDataPoint } from '../utils/chartUtils';

import { RootState, AppDispatch } from '../store';
import StatCard from '../components/dashboard/StatCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import RecentBacktests from '../components/dashboard/RecentBacktests';
import StatusCard from '../components/dashboard/StatusCard';
import PerformanceSummary from '../components/dashboard/PerformanceSummary';
import { fetchStrategies } from '../store/slices/strategySlice';
import { fetchAvailableData, fetchAvailableSymbols } from '../store/slices/dataSlice';
import { fetchBacktestHistory } from '../store/slices/backtestingSlice';
import { fetchPortfolioPerformance } from '../store/slices/portfolioSlice';
import { addNotification, toggleSidebar } from '../store/slices/uiSlice';
import { parsePercentageValue } from '../components/dashboard/PerformanceSummary';
import StrategyStatsCard from '../components/dashboard/StrategyStatsCard';
import { transformStrategyData } from '../utils/strategyUtils';
import { useDashboardData } from '../hooks/useDashboardData';
import MarketStatusCard from '../components/dashboard/MarketStatusCard';
import TradingCalendar from '../components/dashboard/TradingCalendar';
import AppIcon from '../components/icons/AppIcon';

interface PerformanceMetrics {
  total: string;
  monthly: string;
  sharpeRatio: string;
  maxDrawdown: string;
  winRate?: number;
  profitFactor?: number;
  isPositive: {
    total: boolean;
    monthly: boolean;
  };
}

const DashboardPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  useEffect(() => {
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  }, [dispatch, isMobile]);

  // Auto-refresh state
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | undefined>(undefined);
  const [countdownSeconds, setCountdownSeconds] = useState<number | undefined>(undefined);
  
  const [showBenchmark, setShowBenchmark] = useState(false);
  const [isChartFullscreen, setIsChartFullscreen] = useState(false);

  // Use our custom hook for dashboard data and refreshing
  const {
    loading,
    errors,
    strategies,
    availableData,
    results: recentBacktests,
    performanceData,
    benchmarkData,
    metrics,
    selectedTimeRange,
    lastRefreshed,
    formatLastRefreshed,
    refreshData,
    handleTimeRangeChange,
  } = useDashboardData('ALL');

  // Derive hasPerformanceData
  const hasPerformanceData = performanceData && performanceData.length > 0;

  // Effect to handle auto-refresh logic based on local autoRefreshInterval
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;
    if (autoRefreshInterval && autoRefreshInterval > 0) {
      setCountdownSeconds(autoRefreshInterval); // Initialize countdown

      timerId = setInterval(() => {
        setCountdownSeconds(prev => {
          if (prev === undefined) return undefined;
          if (prev <= 1) {
            refreshData(); // Call refreshData without arguments
            return autoRefreshInterval; // Reset countdown
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdownSeconds(undefined); // Clear countdown if interval is off
    }
    return () => clearInterval(timerId);
  }, [autoRefreshInterval, refreshData]);

  // Handler for benchmark toggle, to be passed to PerformanceChart's parent CardHeader
  const handleBenchmarkToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setShowBenchmark(event.target.checked);
  };

  // Handler for fullscreen toggle
  const handleToggleChartFullscreen = () => {
    setIsChartFullscreen(!isChartFullscreen);
  };

  // Handler for export data, to be passed to PerformanceChart's parent CardHeader
  const handleExportChartData = () => {
    if (!performanceData || performanceData.length === 0) {
      console.warn('No performance data to export.');
      return;
    }
    try {
      if (metrics && Object.keys(metrics).length > 0) { 
        exportDashboardData(performanceData, benchmarkData || [], metrics, selectedTimeRange);
        dispatch(addNotification({ message: 'Dashboard data exported successfully.', type: 'success' }));
      } else {
        const formattedData = formatPerformanceDataForExport(performanceData);
        const fileName = `portfolio-performance-${selectedTimeRange.toLowerCase()}-${new Date().toISOString().split('T')[0]}`;
        exportToCsv(formattedData, fileName);
        dispatch(addNotification({ message: `Portfolio performance exported to ${fileName}.csv`, type: 'success' }));
      }
    } catch (err) {
      console.error('Error exporting chart data:', err);
      let errorMessage = 'Error exporting data.';
      if (err instanceof Error) {
        errorMessage = `Error exporting data: ${err.message}`;
      }
      dispatch(addNotification({ message: errorMessage, type: 'error' }));
    }
  };

  // Responsive height for the chart card content
  const chartCardContentHeight = window.innerWidth < 600 ? 'auto' : 420;

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <DashboardHeader 
        onRefresh={() => refreshData()}
        lastRefreshed={formatLastRefreshed()}
        autoRefreshInterval={autoRefreshInterval} 
        onAutoRefreshIntervalChange={setAutoRefreshInterval}
        countdownSeconds={countdownSeconds}
        loading={loading.global}
        showBenchmark={showBenchmark}
        handleBenchmarkToggle={handleBenchmarkToggle}
      />

      {/* Show spinner while loading dashboard data */}
      {loading.global ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Key stats - number of strategies and datasets */}
          <Grid item xs={12} md={6}>
            <StatCard 
              title="Total Strategies"
              value={strategies?.length || 0}
              icon="BarChart"
              color={theme.palette.primary.main}
              onClick={() => navigate('/strategies')}
              loading={loading.strategies}
              error={errors.strategiesError}
              tooltip="Number of trading strategies you have created."
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatCard 
              title="Available Datasets"
              value={availableData?.length || 0}
              icon="Database"
              color={theme.palette.secondary.main}
              onClick={() => navigate('/data')}
              loading={loading.data}
              error={errors.dataError}
              tooltip="Available datasets for backtesting and analysis."
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StatCard
              title="Recent Backtests"
              value={recentBacktests?.length || 0} 
              icon="LineChart"
              color={theme.palette.info.main}
              onClick={() => navigate('/backtesting')}
              loading={loading.backtests}
              error={errors.backtestingError}
              tooltip="Number of backtests run recently."
              variant="outlined"
            />
          </Grid>

          {/* Performance Summary Card */}
          {hasPerformanceData && metrics && (
            <Grid item xs={12} md={6}>
              <Box sx={{ p: { xs: 1, sm: 2 } }}>
                <PerformanceSummary 
                  metrics={metrics}
                  selectedTimeRange={selectedTimeRange}
                  loading={loading.performance} 
                  error={errors.portfolioError} 
                  variant="outlined"
                />
              </Box>
            </Grid>
          )}

          {/* Performance Chart Card */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader
                title="Portfolio Performance"
                action={
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    <FormControlLabel
                      control={<Switch checked={showBenchmark} onChange={handleBenchmarkToggle} />}
                      label={<span style={{ fontSize: '0.95rem' }}>Benchmark</span>}
                      disabled={loading.performance || !!errors.portfolioError}
                      sx={{ mr: { xs: 0, sm: 2 }, mb: { xs: 1, sm: 0 } }}
                    />
                    <Tooltip title="Export Chart Data">
                      <span>
                        <IconButton 
                          color="primary"
                          onClick={handleExportChartData} 
                          disabled={loading.performance || !!errors.portfolioError || !hasPerformanceData} 
                          aria-label="Export data"
                          sx={{ minHeight: 48, minWidth: 48 }}
                        >
                          <AppIcon name="Download" size={24} />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Fullscreen">
                      <IconButton onClick={handleToggleChartFullscreen} aria-label="Toggle fullscreen" sx={{ minHeight: 48, minWidth: 48 }}>
                        <AppIcon name="Maximize2" size={24} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                }
                sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, px: { xs: 1, sm: 2 } }}
              />
              <CardContent sx={{
                height: { xs: 'auto', sm: chartCardContentHeight },
                p: { xs: 1, sm: 2 },
                '&:last-child': { pb: 0 }
              }}>
                {loading.performance ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : errors.portfolioError ? (
                  <Alert severity="error">Error loading performance data: {errors.portfolioError}</Alert>
                ) : hasPerformanceData ? (
                  <PerformanceChart
                    data={performanceData}
                    compareData={benchmarkData}
                    selectedRange={selectedTimeRange}
                    onTimeRangeChange={handleTimeRangeChange}
                  />
                ) : !hasPerformanceData ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                    <Box sx={{ color: 'text.secondary', mb: 2 }}>
                      <AppIcon name="TrendingUp" size={48} />
                    </Box>
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                      No performance data available for the selected range.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try selecting a different time range or running a backtest.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
                    <Box sx={{ color: 'text.secondary', mb: 2 }}>
                      <AppIcon name="TrendingUp" size={48} />
                    </Box>
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                      No performance data available for the selected range.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try selecting a different time range or running a backtest.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Strategy Stats Card */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ p: { xs: 1, sm: 2 } }}>
              <StrategyStatsCard 
                strategies={transformStrategyData(strategies || [])} 
                loading={loading.strategies}
                error={errors.strategiesError}
                onViewDetails={(id) => navigate(id === 'all' ? '/strategies' : `/strategies/${id}`)}
                variant="outlined"
              />
            </Box>
          </Grid>

          {/* Market Status & Trading Calendar in a nested Grid */}
          <Grid item xs={12} lg={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  <StatusCard 
                    strategiesStatus={{ loading: loading.strategies, error: errors.strategiesError }}
                    dataStatus={{ loading: loading.data, error: errors.dataError }}
                    backtestingStatus={{ loading: loading.backtests, error: errors.backtestingError }}
                    portfolioStatus={{ loading: loading.performance, error: errors.portfolioError }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  <MarketStatusCard 
                    onRefreshProp={refreshData}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ p: { xs: 1, sm: 2 } }}>
                  <TradingCalendar 
                    onViewAll={() => navigate('/market-data')} 
                  />
                </Box>
              </Grid>
            </Grid>
          </Grid>
          
          {/* Recent Backtests Card */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardHeader 
                title="Recent Backtests"
                action={
                  <Button 
                    endIcon={<AppIcon name="ArrowRight" size={20} />} 
                    onClick={() => navigate('/backtesting')}
                    disabled={loading.backtests}
                    fullWidth={true}
                    sx={{ width: { xs: '100%', sm: 'auto' }, minHeight: 48, minWidth: 48 }}
                  >
                    View All
                  </Button>
                }
                sx={{ borderBottom: (theme) => `1px solid ${theme.palette.divider}`, px: { xs: 1, sm: 2 } }}
              />
              <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: 2 } }}>
                {loading.backtests ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100 }}>
                    <CircularProgress />
                  </Box>
                ) : errors.backtestingError ? (
                  <Alert severity="error">Error loading backtests: {errors.backtestingError}</Alert>
                ) : (
                  <RecentBacktests 
                    backtests={recentBacktests} 
                    onViewDetails={(id) => navigate(`/backtesting/${id}`)}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Fullscreen Chart Dialog */}
      <Dialog 
        fullScreen 
        open={isChartFullscreen} 
        onClose={handleToggleChartFullscreen}
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 1, sm: 2, md: 3 }
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 1, sm: 2 }, pb: { xs: 1, sm: 2 } }}>
          {`Portfolio Performance (${selectedTimeRange})`}
          <Box>
            <FormControlLabel
              control={<Switch checked={showBenchmark} onChange={handleBenchmarkToggle} />}
              label={<span style={{ fontSize: '0.95rem' }}>Benchmark</span>}
              disabled={loading.performance || !!errors.portfolioError}
              sx={{ mr: 2 }}
            />
            <IconButton edge="end" color="inherit" onClick={handleToggleChartFullscreen} aria-label="close" sx={{ minHeight: 48, minWidth: 48 }}>
              <AppIcon name="X" size={24} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          {loading.performance ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : errors.portfolioError ? (
            <Alert severity="error" sx={{m:2}}>Error loading performance data: {errors.portfolioError}</Alert>
          ) : hasPerformanceData ? (
            <PerformanceChart
              data={performanceData}
              compareData={benchmarkData}
              selectedRange={selectedTimeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
              <Box sx={{ color: 'text.secondary', mb: 2 }}>
                <AppIcon name="TrendingUp" size={60} />
              </Box>
              <Typography variant="h5" color="text.secondary" sx={{ mt: 2 }}>
                No performance data available.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DashboardPage;