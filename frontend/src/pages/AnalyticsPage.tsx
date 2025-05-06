import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  CardHeader,
  Divider,
  FormControl, 
  InputLabel, 
  Select, 
  SelectChangeEvent,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  ShowChart as ShowChartIcon,
  CompareArrows as CompareIcon,
  DateRange as DateRangeIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';

import { RootState, AppDispatch } from '../store';
import { fetchStrategies } from '../store/slices/strategySlice';
import { fetchBacktestHistory } from '../store/slices/backtestingSlice';

// Import a chart component - assuming you have react-chartjs-2 installed
// If not, you'll need to install it: npm install chart.js react-chartjs-2
import {
  Line,
  Bar,
  Pie
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

import CryptoJS from 'crypto-js';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other }
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AnalyticsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { strategies } = useSelector((state: RootState) => state.strategy);
  const { results: backtestResults, loading: backtestLoading } = useSelector((state: RootState) => state.backtesting);

  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for chart filters
  const [selectedTimeRange, setSelectedTimeRange] = useState('1y');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [chartType, setChartType] = useState('line');
  const [showBenchmark, setShowBenchmark] = useState(true);

  // State for comparison settings
  const [baseStrategy, setBaseStrategy] = useState<string>('');
  const [comparisonStrategies, setComparisonStrategies] = useState<string[]>([]);

  // Performance metrics
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

  // Synthetic performance data
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<any[]>([]);
  
  // Fetch strategies and backtest results on component mount
  useEffect(() => {
    dispatch(fetchStrategies());
    dispatch(fetchBacktestHistory());
  }, [dispatch]);
  
  // Set default selected strategy when strategies load
  useEffect(() => {
    if (strategies.length > 0 && selectedStrategies.length === 0) {
      setSelectedStrategies([strategies[0].id]);
      setBaseStrategy(strategies[0].id);
      
      if (strategies.length > 1) {
        setComparisonStrategies([strategies[1].id]);
      }
    }
  }, [strategies, selectedStrategies]);

  // Generate sample performance data based on time range
  import { generatePerformanceData } from '../utils/generatePerformanceData';
  
  const performanceDataMemo = useMemo(() => generatePerformanceData(selectedTimeRange), [selectedTimeRange]);

  useEffect(() => {
    setPerformanceData(performanceDataMemo.data);
    setBenchmarkData(performanceDataMemo.benchmarkData);
    setPerformanceMetrics(performanceDataMemo.metrics);
  }, [performanceDataMemo]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle time range change
  const handleTimeRangeChange = (event: SelectChangeEvent) => {
    setSelectedTimeRange(event.target.value as string);
  };
  
  // Handle strategy selection change
  const handleStrategyChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedStrategies(event.target.value as string[]);
  };
  
  // Handle chart type change
  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newChartType: string | null) => {
    if (newChartType !== null) {
      setChartType(newChartType);
    }
  };
  
  // Handle base strategy change
  const handleBaseStrategyChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setBaseStrategy(event.target.value as string);
  };
  
  // Handle comparison strategies change
  const handleComparisonStrategiesChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setComparisonStrategies(event.target.value as string[]);
  };
  
  // Helper function to get strategy name by ID
  const getStrategyName = (id: string) => {
    const strategy = strategies.find(s => s.id === id);
    return strategy ? strategy.name : 'Unknown Strategy';
  };
  
  // Prepare performance chart data
  const performanceChartData = {
    labels: performanceData.map(d => d.date),
    datasets: [
      // Selected strategy dataset
      {
        label: 'Portfolio',
        data: performanceData.map(d => d.value),
        borderColor: 'rgba(63, 81, 181, 1)',
        backgroundColor: 'rgba(63, 81, 181, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      // Benchmark dataset (conditional)
      ...(showBenchmark ? [{
        label: 'Benchmark (S&P 500)',
        data: benchmarkData.map(d => d.value),
        borderColor: 'rgba(180, 180, 180, 1)',
        backgroundColor: 'rgba(180, 180, 180, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      }] : [])
    ]
  };
  
  // Prepare monthly returns chart data
  const monthlyReturnsData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Monthly Returns (%)',
        data: [3.2, 1.5, -2.1, 4.3, -1.1, 2.8, 1.9, 3.5, -0.8, 2.2, 3.1, 1.7],
        backgroundColor: [
          'rgba(63, 81, 181, 0.8)',
          'rgba(63, 81, 181, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(63, 81, 181, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(63, 81, 181, 0.8)',
          'rgba(63, 81, 181, 0.8)',
          'rgba(63, 81, 181, 0.8)',
          'rgba(244, 67, 54, 0.8)',
          'rgba(63, 81, 181, 0.8)',
          'rgba(63, 81, 181, 0.8)',
          'rgba(63, 81, 181, 0.8)'
        ],
      }
    ]
  };
  
  // Prepare distribution chart data
  const distributionData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        label: 'Trade Distribution',
        data: [performanceMetrics.winRate, 100 - performanceMetrics.winRate],
        backgroundColor: [
          'rgba(76, 175, 80, 0.8)',
          'rgba(244, 67, 54, 0.8)',
        ],
        borderColor: [
          'rgba(76, 175, 80, 1)',
          'rgba(244, 67, 54, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare comparison data based on actual strategies
  const prepareComparisonData = () => {
    if (!strategies.length) return [];
    
    // Create comparison data from actual strategies
    return strategies.map(strategy => {
      // Generate realistic performance metrics for each strategy
      // We're using the strategy's ID to create deterministic but varied metrics
      // Removed import statement from here as it is moved to the top of the file.

      // Removed duplicate hashCode function definition
      const seed = hashCode(strategy.id);
      const multiplier = (seed % 10) / 10 + 0.8; // Value between 0.8 and 1.8
      
      return {
        id: strategy.id,
        strategy: strategy.name,
        return: 15 + ((seed * 7) % 15) * multiplier,
        drawdown: 8 + (seed * 5) % 7 * multiplier,
        sharpeRatio: 1.2 + (seed * 3) % 8 / 10,
        winRate: 52 + (seed * 9) % 12,
      };
    });
  };
  
  // Get comparison data from actual strategies
  const comparisonData = prepareComparisonData();
  
  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          maxTicksLimit: 8,
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Portfolio Value ($)'
        }
      }
    },
  };
  
  // Bar chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Analytics</Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Time Range</InputLabel>
            <Select
              value={selectedTimeRange}
              onChange={(event: SelectChangeEvent) => handleTimeRangeChange(event)}
              label="Time Range"
              startAdornment={<CalendarIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />}
            >
              <MenuItem value="1m">1 Month</MenuItem>
              <MenuItem value="3m">3 Months</MenuItem>
              <MenuItem value="6m">6 Months</MenuItem>
              <MenuItem value="1y">1 Year</MenuItem>
              <MenuItem value="all">All Time</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="analytics tabs"
      // The hashCode function generates a deterministic numeric value from a string (strategy ID).
      // It uses the SHA256 hash of the string, extracts the first 8 hexadecimal digits, 
      // and converts them to a number. This ensures consistent and unique values for each strategy ID.
      const hashCode = (str: string) => {
        const hash = CryptoJS.SHA256(str).toString(CryptoJS.enc.Hex);
        return parseInt(hash.slice(0, 8), 16); // Use first 8 hex digits as a number
      };
          <Tab label="Strategy Comparison" />
          <Tab label="Detailed Statistics" />
        </Tabs>
      </Box>
      
      {/* Performance Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Performance metrics cards */}
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Total Return
                </Typography>
                <Typography variant="h5" component="div" color={performanceMetrics.totalReturn >= 0 ? 'success.main' : 'error.main'}>
                  {performanceMetrics.totalReturn.toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Max Drawdown
                </Typography>
                <Typography variant="h5" component="div" color="error.main">
                  {performanceMetrics.maxDrawdown.toFixed(2)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Sharpe Ratio
                </Typography>
                <Typography variant="h5" component="div">
                  {performanceMetrics.sharpeRatio.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Win Rate
                </Typography>
                <Typography variant="h5" component="div">
                  {performanceMetrics.winRate.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Profit Factor
                </Typography>
                <Typography variant="h5" component="div">
                  {performanceMetrics.profitFactor.toFixed(2)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Avg Win/Loss
                </Typography>
                <Typography variant="h5" component="div">
                  {performanceMetrics.avgWin.toFixed(1)}% / {performanceMetrics.avgLoss.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Performance chart */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Portfolio Performance" 
                action={
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showBenchmark}
                          onChange={(e) => setShowBenchmark(e.target.checked)}
                          color="primary"
                          size="small"
                        />
                      }
                      label="Benchmark"
                    />
                    <ToggleButtonGroup
                      value={chartType}
                      exclusive
                      onChange={handleChartTypeChange}
                      aria-label="chart type"
                      size="small"
                    >
                      <ToggleButton value="line" aria-label="line chart">
                        <ShowChartIcon fontSize="small" />
                      </ToggleButton>
                      <ToggleButton value="bar" aria-label="bar chart">
                        <BarChartIcon fontSize="small" />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                }
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  {chartType === 'line' ? (
                    <Line data={performanceChartData} options={chartOptions} />
                  ) : (
                    <Bar data={performanceChartData} options={barChartOptions} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Monthly returns */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Monthly Returns" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300 }}>
                  <Bar data={monthlyReturnsData} options={barChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Trade Distribution" />
              <Divider />
              <CardContent>
                <Box sx={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Pie data={distributionData} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Strategy Comparison Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Strategy Comparison" 
                subheader="Compare performance metrics across different strategies"
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Strategy</TableCell>
                        <TableCell align="right">Total Return (%)</TableCell>
                        <TableCell align="right">Max Drawdown (%)</TableCell>
                        <TableCell align="right">Sharpe Ratio</TableCell>
                        <TableCell align="right">Win Rate (%)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonData.map((row) => (
                        <TableRow
                          key={row.strategy}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row">
                            {row.strategy}
                          </TableCell>
                          <TableCell align="right" sx={{ color: row.return >= 0 ? 'success.main' : 'error.main' }}>
                            {row.return.toFixed(1)}%
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'error.main' }}>
                            {row.drawdown.toFixed(1)}%
                          </TableCell>
                          <TableCell align="right">
                            {row.sharpeRatio.toFixed(2)}
                          </TableCell>
                          <TableCell align="right">
                            {row.winRate.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Side-by-Side Performance" 
                subheader="Visual comparison of strategy performance"
              />
              <Divider />
              <CardContent>
                <Box sx={{ height: 400 }}>
                  <Bar 
                    data={{
                      labels: comparisonData.map(d => d.strategy),
                      datasets: [
                        {
                          label: 'Total Return (%)',
                          data: comparisonData.map(d => d.return),
                          backgroundColor: 'rgba(63, 81, 181, 0.8)',
                        },
                        {
                          label: 'Max Drawdown (%)',
                          data: comparisonData.map(d => d.drawdown),
                          backgroundColor: 'rgba(244, 67, 54, 0.8)',
                        }
                      ]
                    }}
                    options={barChartOptions}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
      
      {/* Detailed Statistics Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="Performance Statistics" 
                subheader="Detailed metrics for your trading strategies"
              />
              <Divider />
              <CardContent>
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
                        <TableCell>Total Return</TableCell>
                        <TableCell align="right" sx={{ color: performanceMetrics.totalReturn >= 0 ? 'success.main' : 'error.main' }}>
                          {performanceMetrics.totalReturn.toFixed(2)}%
                        </TableCell>
                        <TableCell>The percentage gain or loss of the portfolio over the selected time period.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Annualized Return</TableCell>
                        <TableCell align="right" sx={{ color: performanceMetrics.totalReturn >= 0 ? 'success.main' : 'error.main' }}>
                          {(performanceMetrics.totalReturn * 0.85).toFixed(2)}%
                        </TableCell>
                        <TableCell>The return expressed as an annual percentage.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Max Drawdown</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {performanceMetrics.maxDrawdown.toFixed(2)}%
                        </TableCell>
                        <TableCell>The maximum peak-to-trough decline during the investment period.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Sharpe Ratio</TableCell>
                        <TableCell align="right">
                          {performanceMetrics.sharpeRatio.toFixed(2)}
                        </TableCell>
                        <TableCell>A measure of risk-adjusted performance. Higher is better.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Sortino Ratio</TableCell>
                        <TableCell align="right">
                          {(performanceMetrics.sharpeRatio * 1.2).toFixed(2)}
                        </TableCell>
                        <TableCell>Similar to Sharpe but only penalizes downside volatility.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Win Rate</TableCell>
                        <TableCell align="right">
                          {performanceMetrics.winRate.toFixed(1)}%
                        </TableCell>
                        <TableCell>Percentage of trades that were profitable.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Average Win</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {performanceMetrics.avgWin.toFixed(1)}%
                        </TableCell>
                        <TableCell>Average percentage gain of winning trades.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Average Loss</TableCell>
                        <TableCell align="right" sx={{ color: 'error.main' }}>
                          {performanceMetrics.avgLoss.toFixed(1)}%
                        </TableCell>
                        <TableCell>Average percentage loss of losing trades.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Profit Factor</TableCell>
                        <TableCell align="right">
                          {performanceMetrics.profitFactor.toFixed(2)}
                        </TableCell>
                        <TableCell>Total gross profit divided by total gross loss.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Recovery Factor</TableCell>
                        <TableCell align="right">
                          {(Math.abs(performanceMetrics.totalReturn / performanceMetrics.maxDrawdown)).toFixed(2)}
                        </TableCell>
                        <TableCell>Absolute value of total return divided by max drawdown.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Beta</TableCell>
                        <TableCell align="right">
                          {(0.85 + Math.random() * 0.3).toFixed(2)}
                        </TableCell>
                        <TableCell>Measure of volatility compared to the overall market.</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Alpha</TableCell>
                        <TableCell align="right" sx={{ color: 'success.main' }}>
                          {(2 + Math.random() * 3).toFixed(2)}%
                        </TableCell>
                        <TableCell>Excess return compared to the benchmark after adjusting for risk.</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default AnalyticsPage;