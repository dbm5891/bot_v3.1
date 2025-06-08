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
  CardHeader,
  Divider,
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
  PieChart as PieChartIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler,
  TimeScale,
  TimeSeriesScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import CryptoJS from 'crypto-js';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { colors } from '../theme';
import { createChartConfig } from '../utils/chartConfig';
import { SelectChangeEvent } from '@mui/material/Select';
import AppLayout from '../layouts/AppLayoutNew';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
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
  const theme = useTheme();

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other }
    >
      {value === index && (
        <Box sx={{ py: 2, borderRadius: theme.shape.borderRadius }}>
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

interface StatCardProps {
  title: string;
  value: string;
  trend: 'up' | 'down' | 'neutral';
  icon?: React.ReactElement;
  period: string;
  onSettingsClick?: () => void;
  variant?: 'outlined' | 'elevation';
}

const StatCard = ({ title, value, trend, icon, period, onSettingsClick, variant }: StatCardProps) => {
  const theme = useTheme();
  const trendColor = trend === 'up' ? theme.palette.success.main :
                   trend === 'down' ? theme.palette.error.main :
                   theme.palette.text.secondary;

  return (
    <Card
      variant={variant}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: theme.shape.borderRadius,
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `${theme.shadows[6]}, 0 0 15px ${alpha(theme.palette.primary.main, 0.3)}`,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {icon && React.cloneElement(icon, { sx: { fontSize: 28, color: theme.palette.primary.main } })}
        </Box>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', my: 1 }}>
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
              borderRadius: theme.shape.borderRadius,
              padding: '4px 8px',
              fontWeight: 500,
              backgroundColor: alpha(theme.palette.action.hover, 0.05),
              boxShadow: theme.shadows[1],
              transition: 'background-color 0.2s, box-shadow 0.2s',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                boxShadow: `${theme.shadows[3]}, 0 0 8px ${alpha(theme.palette.primary.main, 0.2)}`,
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

interface HeaderFilterBarProps {
  selectedStrategies: string[];
  handleStrategyChange: (event: SelectChangeEvent<string[]>) => void;
  timeRange: string;
  handleTimeRangeChange: (event: SelectChangeEvent<string>) => void;
  onRefresh: () => void;
}

const HeaderFilterBar = ({ selectedStrategies, handleStrategyChange, timeRange, handleTimeRangeChange, onRefresh }: HeaderFilterBarProps) => {
  const theme = useTheme();
  const strategiesList = [
    { id: 'strategy1', name: 'Momentum Strategy' },
    { id: 'strategy2', name: 'Mean Reversion Strategy' },
    { id: 'strategy3', name: 'Arbitrage Strategy' },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: theme.shape.borderRadius,
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
      borderBottom: `1px solid ${theme.palette.divider}`
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
              borderColor: theme.palette.divider,
              color: theme.palette.text.secondary,
              transition: theme.transitions.create(['background-color', 'color', 'border-color'], {duration: theme.transitions.duration.short}),
              borderRadius: theme.shape.borderRadius / 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
                color: theme.palette.text.primary,
              },
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
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

  const [tabValue, setTabValue] = useState(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1Y');
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
  
  const fetchStrategies = () => ({ type: 'FETCH_STRATEGIES' });
  const fetchBacktestHistory = () => ({ type: 'FETCH_BACKTEST_HISTORY' });
  const generatePerformanceData = (_timeRange: string) => {
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

  useEffect(() => {
    dispatch(fetchStrategies());
    dispatch(fetchBacktestHistory());
  }, [dispatch]);
  
  useEffect(() => {
    if (strategies.length > 0 && selectedStrategies.length === 0) {
      setSelectedStrategies([strategies[0]?.id || '']);
    }
  }, [strategies, selectedStrategies]);

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
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleTimeRangeChange = (event: SelectChangeEvent<string>) => {
    setSelectedTimeRange(event.target.value as string);
  };
  
  const handleStrategyChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedStrategies(event.target.value as string[]);
  };
  
  const handleChartTypeChange = (_event: React.MouseEvent<HTMLElement>, newChartType: string | null) => {
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
        borderColor: theme.palette.primary.main,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, alpha(theme.palette.primary.main, 0.2));
          gradient.addColorStop(1, alpha(theme.palette.primary.main, 0));
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
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
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
    <AppLayout>
      <Box sx={{ p: 3, backgroundColor: theme.palette.background.paper, minHeight: '100vh' }}>
        <HeaderFilterBar 
          selectedStrategies={selectedStrategies}
          handleStrategyChange={handleStrategyChange}
          timeRange={selectedTimeRange}
          handleTimeRangeChange={handleTimeRangeChange}
          onRefresh={handleRefreshData}
        />

        <Paper variant="outlined" sx={{ mb: 3, borderRadius: theme.shape.borderRadius }}>
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
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Tab label="Performance Overview" />
            <Tab label="Strategy Comparison" />
            <Tab label="Detailed Statistics" />
          </Tabs>
        </Paper>
        
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatCard 
                title="Total Return"
                value={`${formatNumber(performanceMetrics.totalReturn)}%`}
                trend={performanceMetrics.totalReturn > 0 ? 'up' : performanceMetrics.totalReturn < 0 ? 'down' : 'neutral'}
                period={`vs. Prev. ${selectedTimeRange}`}
                icon={<BarChartIcon />}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard 
                title="Sharpe Ratio"
                value={formatNumber(performanceMetrics.sharpeRatio)}
                trend={performanceMetrics.sharpeRatio > 1 ? 'up' : performanceMetrics.sharpeRatio < 0.5 ? 'down' : 'neutral'} 
                period="Annualized"
                icon={<TrendingUpIcon />}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard 
                title="Max Drawdown"
                value={`${formatNumber(performanceMetrics.maxDrawdown)}%`}
                trend={performanceMetrics.maxDrawdown < -10 ? 'down' : performanceMetrics.maxDrawdown < -5 ? 'neutral' : 'up'} 
                period="Peak to Trough"
                icon={<TrendingDownIcon />}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <ChartToolbar
                  title="Portfolio Performance Over Time"
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
              <Card variant="outlined">
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
              <Card variant="outlined">
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
                      <Typography variant="h6" fontWeight={600}>
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <ChartToolbar 
                  title="Value at Risk (VaR)"
                  onRefresh={handleRefreshData}
                  chartType="bar"
                  onChartTypeChange={() => {}}
                  showBenchmark={false}
                  onShowBenchmarkChange={() => {}}
                />
                <CardContent sx={{ p: 0, height: 300 }}>
                  <Box sx={{ height: '100%', p: 2 }}>
                    <Bar 
                      data={{
                        labels: ['10%', '5%', '1%'],
                        datasets: [
                          {
                            label: 'Portfolio',
                            data: [performanceMetrics.totalReturn, performanceMetrics.maxDrawdown, performanceMetrics.sharpeRatio],
                            backgroundColor: [theme.palette.primary.main, colors.chart.red, colors.chart.green],
                            borderWidth: 0,
                          }
                        ]
                      }}
                      options={createChartConfig('bar')}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <ChartToolbar 
                  title="Volatility Analysis"
                  onRefresh={handleRefreshData}
                  chartType="bar"
                  onChartTypeChange={() => {}}
                  showBenchmark={false}
                  onShowBenchmarkChange={() => {}}
                />
                <CardContent sx={{ p: 0, height: 300 }}>
                  <Box sx={{ height: '100%', p: 2 }}>
                    <Bar 
                      data={{
                        labels: ['Annualized Volatility', 'Max Drawdown', 'Sharpe Ratio'],
                        datasets: [
                          {
                            label: 'Portfolio',
                            data: [performanceMetrics.sharpeRatio, performanceMetrics.maxDrawdown, performanceMetrics.sharpeRatio],
                            backgroundColor: [theme.palette.primary.main, colors.chart.red, colors.chart.green],
                            borderWidth: 0,
                          }
                        ]
                      }}
                      options={createChartConfig('bar')}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Risk Metrics Summary" titleTypographyProps={{ variant: 'h6' }} />
                <Divider />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <StatCard 
                        title="Total Return"
                        value={`${formatNumber(performanceMetrics.totalReturn)}%`}
                        trend={performanceMetrics.totalReturn > 0 ? 'up' : performanceMetrics.totalReturn < 0 ? 'down' : 'neutral'}
                        period={`vs. Prev. ${selectedTimeRange}`}
                        icon={<BarChartIcon />}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StatCard 
                        title="Sharpe Ratio"
                        value={formatNumber(performanceMetrics.sharpeRatio)}
                        trend={performanceMetrics.sharpeRatio > 1 ? 'up' : performanceMetrics.sharpeRatio < 0.5 ? 'down' : 'neutral'} 
                        period="Annualized"
                        icon={<TrendingUpIcon />}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StatCard 
                        title="Max Drawdown"
                        value={`${formatNumber(performanceMetrics.maxDrawdown)}%`}
                        trend={performanceMetrics.maxDrawdown < -10 ? 'down' : performanceMetrics.maxDrawdown < -5 ? 'neutral' : 'up'} 
                        period="Peak to Trough"
                        icon={<TrendingDownIcon />}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StatCard 
                        title="Win Rate"
                        value={`${formatNumber(performanceMetrics.winRate)}%`}
                        trend={performanceMetrics.winRate > 50 ? 'up' : performanceMetrics.winRate < 50 ? 'down' : 'neutral'} 
                        period="Avg. Last 30 Trades"
                        icon={<PieChartIcon />}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StatCard 
                        title="Profit Factor"
                        value={formatNumber(performanceMetrics.profitFactor)}
                        trend={performanceMetrics.profitFactor > 1 ? 'up' : performanceMetrics.profitFactor < 1 ? 'down' : 'neutral'} 
                        period="Rolling 90-Day"
                        icon={<TrendingUpIcon />}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StatCard 
                        title="Average Win"
                        value={`${formatNumber(performanceMetrics.avgWin)}`}
                        trend={performanceMetrics.avgWin > 0 ? 'up' : performanceMetrics.avgWin < 0 ? 'down' : 'neutral'} 
                        period="Rolling 90-Day"
                        icon={<TrendingUpIcon />}
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StatCard 
                        title="Average Loss"
                        value={`${formatNumber(performanceMetrics.avgLoss)}`}
                        trend={performanceMetrics.avgLoss < 0 ? 'down' : performanceMetrics.avgLoss > 0 ? 'up' : 'neutral'} 
                        period="Rolling 90-Day"
                        icon={<TrendingDownIcon />}
                        variant="outlined"
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <ChartToolbar 
                  title="Trade Distribution (Win/Loss)"
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
                      <Typography variant="h6" fontWeight={600}>
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
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <ChartToolbar 
                  title="Average Win/Loss Size"
                  onRefresh={handleRefreshData}
                  chartType="bar"
                  onChartTypeChange={() => {}}
                  showBenchmark={false}
                  onShowBenchmarkChange={() => {}}
                />
                <CardContent sx={{ p: 0, height: 300 }}>
                  <Box sx={{ height: '100%', p: 2 }}>
                    <Bar 
                      data={{
                        labels: ['Average Win', 'Average Loss'],
                        datasets: [
                          {
                            label: 'Portfolio',
                            data: [performanceMetrics.avgWin, performanceMetrics.avgLoss],
                            backgroundColor: [colors.chart.green, colors.chart.red],
                            borderWidth: 0,
                          }
                        ]
                      }}
                      options={createChartConfig('bar')}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <ChartToolbar 
                  title="Profit Factor Over Time"
                  onRefresh={handleRefreshData}
                  chartType="bar"
                  onChartTypeChange={() => {}}
                  showBenchmark={false}
                  onShowBenchmarkChange={() => {}}
                />
                <CardContent sx={{ p: 0, height: 300 }}>
                  <Box sx={{ height: '100%', p: 2 }}>
                    <Bar 
                      data={{
                        labels: ['1 Month', '3 Months', '6 Months', '1 Year', 'YTD', 'ALL'],
                        datasets: [
                          {
                            label: 'Portfolio',
                            data: [performanceMetrics.profitFactor, performanceMetrics.profitFactor, performanceMetrics.profitFactor, performanceMetrics.profitFactor, performanceMetrics.profitFactor, performanceMetrics.profitFactor],
                            backgroundColor: theme.palette.primary.main,
                            borderWidth: 0,
                          }
                        ]
                      }}
                      options={createChartConfig('bar')}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Detailed Trade Log" titleTypographyProps={{ variant: 'h6' }} />
                <Divider />
                <CardContent>
                  {/* Add detailed trade log content here */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <ChartToolbar 
                  title="Asset Allocation by Class"
                  onRefresh={handleRefreshData}
                  chartType="bar"
                  onChartTypeChange={() => {}}
                  showBenchmark={false}
                  onShowBenchmarkChange={() => {}}
                />
                <CardContent sx={{ p: 0, height: 300 }}>
                  {/* Add asset allocation by class chart content here */}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <ChartToolbar 
                  title="Sector Exposure"
                  onRefresh={handleRefreshData}
                  chartType="bar"
                  onChartTypeChange={() => {}}
                  showBenchmark={false}
                  onShowBenchmarkChange={() => {}}
                />
                <CardContent sx={{ p: 0, height: 300 }}>
                  {/* Add sector exposure chart content here */}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardHeader title="Top Holdings" titleTypographyProps={{ variant: 'h6' }} />
                <Divider />
                <CardContent>
                  {/* Add top holdings content here */}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Card variant="outlined">
            <CardHeader title="Custom Analytics & Reporting" titleTypographyProps={{ variant: 'h6' }} />
            <Divider />
            <CardContent>
              {/* Add custom analytics and reporting content here */}
            </CardContent>
          </Card>
        </TabPanel>
      </Box>
    </AppLayout>
  );
};

export default AnalyticsPage;