import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  useTheme,
  alpha,
  Tooltip,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  MoreVert as MoreVertIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as NeutralIcon,
  // AccountBalanceWallet as WalletIcon, // Removed unused import
  // Assessment as AssessmentIcon, // Removed unused import
  // Timeline as TimelineIcon, // Removed unused import
  PieChart as PieChartIcon,
  CalendarToday as CalendarIcon, // Added CalendarIcon
  Info as InfoIcon // Added InfoIcon
} from '@mui/icons-material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  TimeScale,
  TimeSeriesScale,
  // ChartTypeRegistry // Removed unused import
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import CryptoJS from 'crypto-js'; // Added CryptoJS import
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { colors } from '../theme';
import { createChartConfig } from '../utils/chartConfig'; // Corrected import
import { SelectChangeEvent } from '@mui/material/Select'; // Added SelectChangeEvent

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  Filler,
  TimeScale,
  TimeSeriesScale
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const theme = useTheme(); // Added useTheme hook

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other }
    >
      {value === index && (
        <Box sx={{ py: 2, backgroundColor: alpha(theme.palette.background.default, 0.5), borderRadius: theme.shape.borderRadius }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const hashCode = (str: string) => {
  const hash = CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
  return parseInt(hash.slice(0, 8), 16);
};

interface StatCardProps { // Added StatCardProps type
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  icon?: React.ReactElement;
  period: string;
  onSettingsClick?: () => void;
}

const StatCard = ({ title, value, trend, icon, period, onSettingsClick }: StatCardProps) => { // Added StatCardProps type
  const theme = useTheme();
  const trendColor = trend === 'up' ? theme.palette.success.main :
                   trend === 'down' ? theme.palette.error.main :
                   theme.palette.text.secondary;

  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: theme.shape.borderRadius, // Consistent border radius
        boxShadow: theme.shadows[2], // Softer initial shadow
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `${theme.shadows[6]}, 0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`, // Lift and glow
          borderColor: theme.palette.primary.main,
        },
        border: `1px solid transparent`, // For hover effect
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {icon && React.cloneElement(icon, { sx: { fontSize: 28, color: theme.palette.primary.main } })}
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
          {value}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', color: trendColor }}>
          {trend === 'up' && <TrendingUpIcon sx={{ mr: 0.5 }} />}
          {trend === 'down' && <TrendingDownIcon sx={{ mr: 0.5 }} />}
          {trend === 'neutral' && <NeutralIcon sx={{ mr: 0.5 }} />}
          <Typography variant="body2">
            {period}
          </Typography>
        </Box>
      </CardContent>
      {onSettingsClick && (
        <Box sx={{ p: 1, textAlign: 'right' }}>
          <Button 
            size="small" 
            startIcon={<SettingsIcon />} 
            onClick={onSettingsClick}
            sx={{
              textTransform: 'none',
              color: theme.palette.text.secondary,
              borderRadius: theme.shape.borderRadius, // Consistent border radius
              padding: '4px 8px',
              fontWeight: 500,
              backgroundColor: alpha(theme.palette.action.hover, 0.05),
              boxShadow: theme.shadows[1],
              transition: 'background-color 0.2s, box-shadow 0.2s',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                boxShadow: `${theme.shadows[3]}, 0 0 8px ${alpha(theme.palette.primary.main, 0.2)}`, // Enhanced hover shadow
              }
            }}
          >
            Settings
          </Button>
        </Box>
      )}
    </Card>
  );
};

interface HeaderFilterBarProps { // Added HeaderFilterBarProps type
  selectedStrategies: string[];
  handleStrategyChange: (event: SelectChangeEvent<string[]>) => void;
  timeRange: string;
  handleTimeRangeChange: (event: SelectChangeEvent<string>) => void;
  onRefresh: () => void;
}

const HeaderFilterBar = ({ selectedStrategies, handleStrategyChange, timeRange, handleTimeRangeChange, onRefresh }: HeaderFilterBarProps) => {
  const theme = useTheme();
  // Assuming strategiesList is fetched or defined elsewhere
  const strategiesList = [
    { id: 'strategy1', name: 'Momentum Strategy' },
    { id: 'strategy2', name: 'Mean Reversion Strategy' },
    { id: 'strategy3', name: 'Arbitrage Strategy' },
  ];

  return (
    <Paper 
      elevation={0} 
      sx={{
        p: 2,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: theme.shape.borderRadius, // Consistent border radius
        // backgroundColor: alpha(theme.palette.background.default, 0.7), // Slightly transparent background
        // backdropFilter: 'blur(5px)', // Frosted glass effect if desired
        boxShadow: theme.shadows[1], // Subtle shadow for depth
      }}
    >
      <FormControl fullWidth sx={{ minWidth: 200 }}>
        <InputLabel id="strategy-select-label">Strategies</InputLabel>
        <Select
          labelId="strategy-select-label"
          multiple
          value={selectedStrategies}
          onChange={handleStrategyChange}
          label="Strategies"
          // renderValue={(selected) => selected.join(', ')} // Could customize display
        >
          {strategiesList.map((strategy) => (
            <MenuItem key={strategy.id} value={strategy.id}>
              {strategy.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel id="time-range-label">Time Range</InputLabel>
        <Select
          labelId="time-range-label"
          value={timeRange}
          onChange={handleTimeRangeChange}
          label="Time Range"
        >
          <MenuItem value="1M">1 Month</MenuItem>
          <MenuItem value="3M">3 Months</MenuItem>
          <MenuItem value="6M">6 Months</MenuItem>
          <MenuItem value="1Y">1 Year</MenuItem>
          <MenuItem value="YTD">Year-to-Date</MenuItem>
          <MenuItem value="ALL">All Time</MenuItem>
        </Select>
      </FormControl>

      <Tooltip title="Refresh Data">
        <IconButton 
          onClick={onRefresh} 
          sx={{
            color: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.15),
            }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Paper>
  );
};

const ChartToolbar = ({ 
  title, 
  onRefresh,
  chartType,
  onChartTypeChange,
  showBenchmark, 
  onShowBenchmarkChange 
}: {
  title: string;
  onRefresh: () => void;
  chartType: string;
  onChartTypeChange: (event: React.MouseEvent<HTMLElement>, newValue: string | null) => void;
  showBenchmark: boolean;
  onShowBenchmarkChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      p: 2,
      borderBottom: `1px solid ${colors.border}`
    }}>
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showBenchmark}
              onChange={onShowBenchmarkChange}
              color="primary"
              size="small"
            />
          }
          label="Benchmark"
          sx={{ 
            '& .MuiFormControlLabel-label': { 
              fontSize: '0.85rem',
              color: 'text.secondary'
            } 
          }}
        />
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={onChartTypeChange}
          aria-label="chart type"
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 1.25, 
              py: 0.5,
              borderColor: colors.border,
              color: theme.palette.text.secondary,
              transition: theme.transitions.create(['background-color', 'color', 'border-color'], {duration: theme.transitions.duration.short}),
              borderRadius: theme.shape.borderRadius / 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
                color: theme.palette.text.primary,
              },
              '&.Mui-selected': {
                backgroundColor: alpha(colors.primary, 0.12),
                color: colors.primary,
                borderColor: alpha(colors.primary, 0.5),
                '&:hover': {
                  backgroundColor: alpha(colors.primary, 0.2),
                },
              },
            },
          }}
        >
          <ToggleButton value="line" aria-label="line chart">
            <ShowChartIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="bar" aria-label="bar chart">
            <BarChartIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        <Tooltip title="Refresh data">
          <IconButton size="small" onClick={onRefresh} sx={{ '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.08) } }}>
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Download chart">
          <IconButton size="small" sx={{ '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.08) } }}>
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Fullscreen">
          <IconButton size="small" sx={{ '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.08) } }}>
            <FullscreenIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="More options">
          <IconButton size="small" sx={{ '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.08) } }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

const AnalyticsPage = () => {
  const theme = useTheme();
  const chartRef = useRef<any>(null);
  const dispatch = useDispatch();
  const { strategies } = useSelector((state: RootState) => state.strategy);
  // const { results: backtestResults, loading: backtestLoading } = useSelector((state: RootState) => state.backtesting); // Commented out unused variables

  const [tabValue, setTabValue] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1y');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [chartType, setChartType] = useState('line');
  const [showBenchmark, setShowBenchmark] = useState(true);

  const [performanceMetrics, setPerformanceMetrics] = useState<{
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
  }>({
    totalReturn: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    winRate: 0,
    avgWin: 0,
    avgLoss: 0,
    profitFactor: 0
  });

  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<any[]>([]);
  
  // Mock Redux actions and selectors for now
  const fetchStrategies = () => ({ type: 'FETCH_STRATEGIES' });
  const fetchBacktestHistory = () => ({ type: 'FETCH_BACKTEST_HISTORY' });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generatePerformanceData = (_timeRange: string) => { // Added type for timeRange, prefixed with _ as it's unused in mock
    // This is a placeholder. Replace with actual data generation logic.
    const data = [
      { date: '2023-01-01', value: 10000, monthlyReturn: 0 },
      { date: '2023-02-01', value: 10200, monthlyReturn: 2 },
      { date: '2023-03-01', value: 10100, monthlyReturn: -1 },
      { date: '2023-04-01', value: 10500, monthlyReturn: 4 },
    ];
    const benchmark = [
      { date: '2023-01-01', value: 9000 },
      { date: '2023-02-01', value: 9100 },
      { date: '2023-03-01', value: 9050 },
      { date: '2023-04-01', value: 9200 },
    ];
    return {
      data,
      benchmarkData: benchmark,
      metrics: {
        totalReturn: 5.0,
        maxDrawdown: -1.0,
        sharpeRatio: 1.5,
        winRate: 75.0,
        avgWin: 300,
        avgLoss: -100,
        profitFactor: 3.0
      }
    };
  };
  // End of mock Redux actions and selectors

  useEffect(() => {
    dispatch(fetchStrategies());
    dispatch(fetchBacktestHistory());
  }, [dispatch]);
  
  useEffect(() => {
    if (strategies.length > 0 && selectedStrategies.length === 0) {
      setSelectedStrategies([strategies[0]?.id || '']);
    }
  }, [strategies, selectedStrategies]);

  // Utility function to format numbers (ensure this is defined or imported)
  const formatNumber = (num: number, digits = 2) => {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[^0]*)0+$/;
    const item = lookup.slice().reverse().find(function(item) {
      return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
  };

  const performanceDataMemo = useMemo(() => generatePerformanceData(selectedTimeRange), [selectedTimeRange]);

  useEffect(() => {
    setPerformanceData(performanceDataMemo.data);
    setBenchmarkData(performanceDataMemo.benchmarkData);
    setPerformanceMetrics(performanceDataMemo.metrics);
  }, [performanceDataMemo]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => { // Mark event as unused if not needed or use it
    setTabValue(newValue);
  };
  
  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => { // Corrected type
    setSelectedTimeRange(event.target.value as string);
  };
  
  const handleStrategyChange = (event: SelectChangeEvent<string[]>) => { // Corrected type
    setSelectedStrategies(event.target.value as string[]);
  };
  
  const handleChartTypeChange = (_event: React.MouseEvent<HTMLElement>, newChartType: string | null) => { // Mark event as unused if not needed or use it
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };
  
  const handleRefreshData = () => {
    dispatch(fetchStrategies());
    dispatch(fetchBacktestHistory());
    const newPerformanceData = generatePerformanceData(selectedTimeRange);
    setPerformanceData(newPerformanceData.data);
    setBenchmarkData(newPerformanceData.benchmarkData);
    setPerformanceMetrics(newPerformanceData.metrics);
  };
  
  const getStrategyName = (id: string) => {
    const strategy = strategies.find(s => s.id === id);
    return strategy ? strategy.name : 'Unknown Strategy';
  };
  
  const performanceChartData = {
    labels: performanceData.map(d => d.date),
    datasets: [
      {
        label: 'Portfolio',
        data: performanceData.map(d => d.value),
        borderColor: colors.primary,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, alpha(colors.primary, 0.2));
          gradient.addColorStop(1, alpha(colors.primary, 0));
          return gradient;
        },
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
      ...(showBenchmark ? [{
        label: 'Benchmark (S&P 500)',
        data: benchmarkData.map(d => d.value),
        borderColor: colors.chart.ma50,
        backgroundColor: 'transparent',
      }] : [])
    ]
  };
  
  const monthlyReturnsData = {
    labels: performanceData.map(d => d.date),
    datasets: [
      {
        label: 'Monthly Returns',
        data: performanceData.map(d => d.monthlyReturn),
        backgroundColor: colors.primary,
        borderColor: colors.primary,
        borderWidth: 1,
        borderRadius: 3,
        barThickness: 20,
      }
    ]
  };
  
  const distributionData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: [performanceMetrics.winRate, 100 - performanceMetrics.winRate],
        backgroundColor: [colors.chart.green, colors.chart.red],
        borderWidth: 0,
      }
    ]
  };
  
  const comparisonData = strategies.map(strategy => ({
    strategy: getStrategyName(strategy.id),
    return: performanceMetrics.totalReturn,
    drawdown: performanceMetrics.maxDrawdown,
    sharpeRatio: performanceMetrics.sharpeRatio,
    winRate: performanceMetrics.winRate,
    id: strategy.id
  }));
  
  return (
    <Box sx={{ height: '100%' }}>
      <HeaderFilterBar 
        selectedStrategies={selectedStrategies}
        handleStrategyChange={handleStrategyChange}
        timeRange={selectedTimeRange}
        handleTimeRangeChange={handleTimeRangeChange} // Pass the corrected handler
        onRefresh={handleRefreshData}
      />
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          border: `1px solid ${colors.border}`,
          borderRadius: theme.shape.borderRadius,
          bgcolor: colors.background.alt,
          boxShadow: `0 1px 2px 0 ${alpha(theme.palette.common.black, 0.05)}`,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Analytics Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              onChange={(event: SelectChangeEvent) => handleTimeRangeChange(event)}
              label="Time Range"
              sx={{ bgcolor: colors.background.paper }}
              startAdornment={<CalendarIcon sx={{ color: 'action.active', mr: 1, my: 0.5, fontSize: '20px' }} />}
            >
              <MenuItem value="1m">1 Month</MenuItem>
              <MenuItem value="3m">3 Months</MenuItem>
              <MenuItem value="6m">6 Months</MenuItem>
              <MenuItem value="1y">1 Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
          
          {strategies.length > 0 && (
            <FormControl sx={{ minWidth: 180 }} size="small">
              <InputLabel>Strategy</InputLabel>
              <Select
                value={selectedStrategies}
                onChange={handleStrategyChange}
                label="Strategy"
                sx={{ bgcolor: colors.background.paper }}
                multiple
              >
                {strategies.map((strategy) => (
                  <MenuItem key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefreshData} sx={{ bgcolor: colors.background.paper }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<SettingsIcon />}
            sx={{
              ml: 1,
              borderRadius: theme.shape.borderRadius,
              textTransform: 'none',
              fontWeight: 500,
              px: 2.5,
              py: 0.75,
              boxShadow: `0 1px 3px ${alpha(colors.primary, 0.25)}`, 
              transition: theme.transitions.create(['background-color', 'box-shadow'], {duration: theme.transitions.duration.short}),
              '&:hover': {
                boxShadow: `0 2px 6px ${alpha(colors.primary, 0.35)}`,
              }
            }}
          >
            Settings
          </Button>
        </Box>
      </Paper>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Return" 
            value={performanceMetrics.totalReturn.toFixed(2) + '%'} 
            trend={performanceMetrics.totalReturn >= 0 ? 'up' : 'down'}
            period="vs last month"
            icon={<ShowChartIcon fontSize="small" color="primary" />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Portfolio Value" 
            value={formatNumber(performanceData.length ? performanceData[performanceData.length - 1].value : 0)} 
            trend="up"
            period="vs last month"
            icon={<TrendingUpIcon fontSize="small" sx={{ color: colors.secondary }} />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Max Drawdown" 
            value={performanceMetrics.maxDrawdown.toFixed(2) + '%'} 
            trend="down"
            period="rolling 90-day"
            icon={<TrendingDownIcon fontSize="small" sx={{ color: colors.error }} />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Win Rate" 
            value={performanceMetrics.winRate.toFixed(1) + '%'} 
            trend="neutral"
            period="avg last 30 trades"
            icon={<PieChartIcon fontSize="small" color="info" />}
          />
        </Grid>
      </Grid>
      
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: theme.shape.borderRadius,
          overflow: 'hidden',
          border: `1px solid ${colors.border}`,
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="analytics tabs"
          sx={{ 
            bgcolor: colors.background.alt,
            '& .MuiTabs-indicator': {
              height: 3,
              borderTopLeftRadius: 3,
              borderTopRightRadius: 3,
            },
            '& .MuiTab-root': {
              py: 1.5,
              px: 3,
              fontSize: '0.875rem',
              fontWeight: 500,
            },
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Tab label="Performance Overview" />
          <Tab label="Strategy Comparison" />
          <Tab label="Detailed Statistics" />
        </Tabs>
      
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card 
                elevation={0}
                sx={{ 
                  overflow: 'hidden',
                  height: '100%',
                  border: `1px solid ${colors.border}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <ChartToolbar
                  title="Portfolio Performance"
                  onRefresh={handleRefreshData}
                  chartType={chartType}
                  onChartTypeChange={handleChartTypeChange}
                  showBenchmark={showBenchmark}
                  onShowBenchmarkChange={(e) => setShowBenchmark(e.target.checked)}
                />
                <CardContent sx={{ p: 0, height: 400 }}>
                  <Box sx={{ height: '100%', p: 2 }}>
                    {chartType === 'line' ? (
                      <Line 
                        ref={chartRef}
                        data={performanceChartData} 
                        options={createChartConfig('line')} 
                      />
                    ) : (
                      <Bar 
                        ref={chartRef}
                        data={performanceChartData} 
                        options={createChartConfig('bar')} 
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card 
                elevation={0}
                sx={{ 
                  overflow: 'hidden',
                  height: '100%',
                  border: `1px solid ${colors.border}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <ChartToolbar
                  title="Monthly Returns"
                  onRefresh={handleRefreshData}
                  chartType="bar"
                  onChartTypeChange={() => {}}
                  showBenchmark={false}
                  onShowBenchmarkChange={() => {}}
                />
                <CardContent sx={{ p: 0, height: 300 }}>
                  <Box sx={{ height: '100%', p: 2 }}>
                    <Bar data={monthlyReturnsData} options={createChartConfig('bar')} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card 
                elevation={0}
                sx={{ 
                  overflow: 'hidden',
                  height: '100%',
                  border: `1px solid ${colors.border}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <ChartToolbar
                  title="Trade Distribution"
                  onRefresh={handleRefreshData}
                  chartType="pie"
                  onChartTypeChange={() => {}}
                  showBenchmark={false}
                  onShowBenchmarkChange={() => {}}
                />
                <CardContent sx={{ p: 0, height: 300 }}>
                  <Box sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    position: 'relative',
                    p: 2
                  }}>
                    <Pie data={distributionData} />
                    <Box sx={{ 
                      position: 'absolute', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center'
                    }}>
                      <Typography variant="h5" fontWeight={600}>
                        {performanceMetrics.winRate.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Win Rate
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card 
                elevation={0}
                sx={{ 
                  overflow: 'hidden', 
                  border: `1px solid ${colors.border}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: `1px solid ${colors.border}`
                }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Strategy Comparison
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Compare performance metrics across different strategies
                    </Typography>
                  </Box>
                  <Tooltip title="More information">
                    <IconButton size="small">
                      <InfoIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Strategy</TableCell>
                        <TableCell align="right">Total Return (%)</TableCell>
                        <TableCell align="right">Max Drawdown (%)</TableCell>
                        <TableCell align="right">Sharpe Ratio</TableCell>
                        <TableCell align="right">Win Rate (%)</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonData.map((row) => (
                        <TableRow
                          key={row.strategy}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            transition: theme.transitions.create('background-color', {
                              duration: theme.transitions.duration.shortest,
                            }),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.action.hover, theme.palette.mode === 'dark' ? 0.09 : 0.05),
                            },
                          }}
                        >
                          <TableCell component="th" scope="row">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box 
                                sx={{ 
                                  width: 12, 
                                  height: 12, 
                                  borderRadius: '50%', 
                                  mr: 1.5, 
                                  bgcolor: () => {
                                    const seed = hashCode(row.id);
                                    const colorIndex = seed % 5;
                                    const colors = [
                                      theme.palette.primary.main,
                                      theme.palette.secondary.main,
                                      theme.palette.info.main,
                                      theme.palette.warning.main,
                                      theme.palette.error.main,
                                    ];
                                    return colors[colorIndex];
                                  }
                                }} 
                              />
                              <Typography fontWeight={500}>{row.strategy}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell 
                            align="right" 
                            sx={{ 
                              fontWeight: 500,
                              color: row.return >= 0 ? colors.chart.green : colors.chart.red 
                            }}
                          >
                            {row.return.toFixed(2)}%
                          </TableCell>
                          <TableCell 
                            align="right"
                            sx={{ color: colors.chart.red, fontWeight: 500 }}
                          >
                            {row.drawdown.toFixed(2)}%
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {row.sharpeRatio.toFixed(2)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 500 }}>
                            {row.winRate.toFixed(1)}%
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small">
                              <ShowChartIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small">
                              <SettingsIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card 
                elevation={0}
                sx={{ 
                  overflow: 'hidden',
                  border: `1px solid ${colors.border}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <ChartToolbar
                  title="Side-by-Side Performance"
                  onRefresh={handleRefreshData}
                  chartType="bar"
                  onChartTypeChange={() => {}}
                  showBenchmark={false}
                  onShowBenchmarkChange={() => {}}
                />
                <CardContent sx={{ p: 0, height: 400 }}>
                  <Box sx={{ height: '100%', p: 2 }}>
                    <Bar 
                      data={{
                        labels: comparisonData.map(d => d.strategy),
                        datasets: [
                          {
                            label: 'Total Return (%)',
                            data: comparisonData.map(d => d.return),
                            backgroundColor: colors.primary,
                            borderRadius: 3,
                            barThickness: 20,
                          },
                          {
                            label: 'Max Drawdown (%)',
                            data: comparisonData.map(d => d.drawdown),
                            backgroundColor: colors.chart.red,
                            borderRadius: 3,
                            barThickness: 20,
                          }
                        ]
                      }}
                      options={createChartConfig('bar')}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Card 
                elevation={0}
                sx={{ 
                  overflow: 'hidden', 
                  border: `1px solid ${colors.border}`,
                  borderRadius: theme.shape.borderRadius,
                }}
              >
                <Box sx={{ 
                  p: 2, 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: `1px solid ${colors.border}`
                }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Performance Statistics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Detailed metrics for your trading strategies
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    startIcon={<DownloadIcon />}
                    size="small"
                  >
                    Export Report
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Metric</TableCell>
                        <TableCell align="right">Value</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500 }}>Total Return</TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            fontWeight: 600, 
                            color: performanceMetrics.totalReturn >= 0 ? colors.chart.green : colors.chart.red 
                          }}
                        >
                          {performanceMetrics.totalReturn.toFixed(2)}%
                        </TableCell>
                        <TableCell>The percentage gain or loss of the portfolio over the selected time period.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 500 }}>Annualized Return</TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            fontWeight: 600, 
                            color: performanceMetrics.totalReturn >= 0 ? colors.chart.green : colors.chart.red 
                          }}
                        >
                          {(performanceMetrics.totalReturn * 0.85).toFixed(2)}%
                        </TableCell>
                        <TableCell>The return expressed as an annual percentage.</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default AnalyticsPage;