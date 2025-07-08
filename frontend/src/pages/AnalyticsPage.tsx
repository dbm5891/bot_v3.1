import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ChartType, ChartOptions } from 'chart.js';
import { colors } from '../theme';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardAction,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Alert } from '../components/ui/alert';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import {
  Settings as SettingsIcon,
  RefreshCw as RefreshIcon,
  Download as DownloadIcon,
  Maximize2 as FullscreenIcon,
  MoreHorizontal as MoreVertIcon,
  LineChart as ShowChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Move as NeutralIcon,
  PieChart as PieChartIcon,
} from 'lucide-react';
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
import { RootState } from '../store';
import { createChartConfig } from '../utils/chartConfig';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';

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
  index: string;
  value: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="py-2 border-t border-border/50">
          {children}
        </div>
      )}
    </div>
  );
}

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
  const trendColor = trend === 'up' ? 'text-green-500' :
                   trend === 'down' ? 'text-red-500' :
                   'text-slate-600';

  return (
    <Card className={`h-full flex flex-col justify-between border-border/50 bg-white/70 backdrop-blur-sm transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:border-primary/20 ${variant === 'outlined' ? 'border' : ''}`}>
      <CardContent className="flex flex-grow flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
          </div>
          {icon && React.cloneElement(icon, { className: 'h-7 w-7 text-slate-500' })}
        </div>
        <div className="text-2xl font-bold my-1 text-slate-900">
          {value}
        </div>
        <div className="flex items-center text-slate-600">
          {trend === 'up' && <TrendingUpIcon className="mr-1 h-4 w-4 text-green-600" />}
          {trend === 'down' && <TrendingDownIcon className="mr-1 h-4 w-4 text-red-600" />}
          {trend === 'neutral' && <NeutralIcon className="mr-1 h-4 w-4 text-slate-500" />}
          <p className="text-sm">
            {period}
          </p>
        </div>
      </CardContent>
      {onSettingsClick && (
        <div className="p-2 text-right">
          <Button 
            size="sm" 
            onClick={onSettingsClick}
            className="text-sm text-slate-600 border border-border/50 rounded-md px-4 py-2 font-medium bg-slate-50 hover:bg-gray-100"
          >
            Settings
          </Button>
        </div>
      )}
    </Card>
  );
};

interface HeaderFilterBarProps {
  selectedStrategies: string[];
  handleStrategyChange: (id: string) => void;
  timeRange: string;
  handleTimeRangeChange: (value: string) => void;
  onRefresh: () => void;
}

const HeaderFilterBar = ({ selectedStrategies, handleStrategyChange, timeRange, handleTimeRangeChange, onRefresh }: HeaderFilterBarProps) => {
  const strategiesList = [
    { id: 'strategy1', name: 'Momentum Strategy' },
    { id: 'strategy2', name: 'Mean Reversion Strategy' },
    { id: 'strategy3', name: 'Arbitrage Strategy' },
  ];

  return (
    <div className="p-4 mb-3 border border-border/50 bg-white/70 backdrop-blur-sm rounded-md flex flex-col md:flex-row items-center gap-2">
      <div className="w-full md:w-auto">
        <Label htmlFor="strategy-select-label">Strategies</Label>
        <div className="flex flex-wrap gap-2">
          {strategiesList.map((strategy) => (
            <Button
              key={strategy.id}
              size="sm"
              onClick={() => handleStrategyChange(strategy.id)}
              className={`text-sm text-slate-600 border border-border/50 rounded-md px-4 py-2 font-medium bg-white/70 hover:bg-slate-50 transition-colors duration-200 ${selectedStrategies.includes(strategy.id) ? 'bg-primary text-white border-primary' : ''}`}
            >
              {strategy.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full md:w-auto">
        <Label>Time Range</Label>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1M">1 Month</SelectItem>
            <SelectItem value="3M">3 Months</SelectItem>
            <SelectItem value="6M">6 Months</SelectItem>
            <SelectItem value="1Y">1 Year</SelectItem>
            <SelectItem value="YTD">Year-to-Date</SelectItem>
            <SelectItem value="ALL">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            onClick={onRefresh} 
            className="text-slate-600 bg-slate-50 hover:bg-gray-100"
          >
            <RefreshIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Refresh data</TooltipContent>
      </Tooltip>
    </div>
  );
};

type ChartTypeOptions = 'line' | 'bar' | 'pie';

interface ChartToolbarProps {
  title: string;
  onRefresh: () => void;
  chartType: ChartTypeOptions;
  onChartTypeChange: (event: React.MouseEvent<HTMLElement>, newValue: ChartTypeOptions | null) => void;
  showBenchmark: boolean;
  onShowBenchmarkChange: (checked: boolean) => void;
  setChartType: React.Dispatch<React.SetStateAction<ChartTypeOptions>>;
}

const ChartToolbar: React.FC<ChartToolbarProps> = ({ 
  title, 
  onRefresh,
  chartType,
  onChartTypeChange,
  showBenchmark, 
  onShowBenchmarkChange,
  setChartType
}) => {
  const handleTypeChange = (type: ChartTypeOptions) => {
    setChartType(type);
  };

  return (
    <div className="flex justify-between items-center p-4 border-b border-border/50">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Button
            variant={chartType === 'line' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => handleTypeChange('line')}
            aria-label="line chart"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </Button>
          <Button
            variant={chartType === 'bar' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => handleTypeChange('bar')}
            aria-label="bar chart"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20V10M6 20V4M18 20v-8" />
            </svg>
          </Button>
          {chartType === 'pie' && (
            <Button
              variant={chartType === 'pie' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => handleTypeChange('pie')}
              aria-label="pie chart"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v10l8.5 8.5a10 10 0 1 1-17-7" />
              </svg>
            </Button>
          )}
        </div>
        {showBenchmark !== undefined && (
          <Switch
            checked={showBenchmark}
            onCheckedChange={onShowBenchmarkChange}
            aria-label="show benchmark"
          />
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onRefresh} aria-label="refresh data">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh data</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  const chartRef = useRef<any>(null);
  const dispatch = useDispatch();
  const { strategies } = useSelector((state: RootState) => state.strategy);

  const [tabValue, setTabValue] = useState('0');
  const [selectedTimeRange, setSelectedTimeRange] = useState('1Y');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartTypeOptions>('line');
  const [showBenchmark, setShowBenchmark] = useState(false);

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
  
  const handleTabChange = (value: string) => {
    setTabValue(value);
  };
  
  const handleTimeRangeChange = (value: string) => {
    setSelectedTimeRange(value);
  };
  
  const handleStrategyChange = (id: string) => {
    if (selectedStrategies.includes(id)) {
      setSelectedStrategies(selectedStrategies.filter(s => s !== id));
    } else {
      setSelectedStrategies([id]);
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
  
  const handleChartTypeChange = (event: React.MouseEvent<HTMLElement>, newValue: ChartTypeOptions | null) => {
    if (newValue) {
      setChartType(newValue);
    }
  };
  
  const performanceChartData = {
    labels: performanceData.map(d => d.date),
    datasets: [
      {
        label: 'Portfolio Value',
        data: performanceData.map(d => d.value),
        backgroundColor: colors.chart.line + '20',
        borderColor: colors.chart.line,
        borderWidth: 2,
        fill: true,
      }
    ]
  };
  
  const monthlyReturnsData = {
    labels: performanceData.map(d => d.date),
    datasets: [
      {
        label: 'Monthly Returns',
        data: performanceData.map(d => d.monthlyReturn),
        backgroundColor: colors.chart.green,
        borderColor: colors.chart.green,
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
  
  const lineChartOptions = createChartConfig('line') as ChartOptions<'line'>;
  const barChartOptions = createChartConfig('bar') as ChartOptions<'bar'>;
  const pieChartOptions = createChartConfig('pie') as ChartOptions<'pie'>;

  return (
    <TooltipProvider>
      <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Analytics</h1>
        </div>
      
      <HeaderFilterBar 
        selectedStrategies={selectedStrategies}
        handleStrategyChange={handleStrategyChange}
        timeRange={selectedTimeRange}
        handleTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefreshData}
      />

      <div className="mb-3 border border-border/50 bg-white/70 backdrop-blur-sm rounded-md">
        <Tabs 
          value={tabValue} 
          onValueChange={handleTabChange} 
          className="bg-transparent"
        >
          <TabsList className="bg-transparent">
            <TabsTrigger value="0">Performance Overview</TabsTrigger>
            <TabsTrigger value="1">Strategy Comparison</TabsTrigger>
            <TabsTrigger value="2">Detailed Statistics</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <TabPanel value={tabValue} index="0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1">
            <StatCard 
              title="Total Return"
              value={`${formatNumber(performanceMetrics.totalReturn)}%`}
              trend={performanceMetrics.totalReturn > 0 ? 'up' : performanceMetrics.totalReturn < 0 ? 'down' : 'neutral'}
              period={`vs. Prev. ${selectedTimeRange}`}
              icon={<BarChartIcon />}
              variant="outlined"
            />
          </div>
          <div className="col-span-1">
            <StatCard 
              title="Sharpe Ratio"
              value={formatNumber(performanceMetrics.sharpeRatio)}
              trend={performanceMetrics.sharpeRatio > 1 ? 'up' : performanceMetrics.sharpeRatio < 0.5 ? 'down' : 'neutral'} 
              period="Annualized"
              icon={<TrendingUpIcon />}
              variant="outlined"
            />
          </div>
          <div className="col-span-1">
            <StatCard 
              title="Max Drawdown"
              value={`${formatNumber(performanceMetrics.maxDrawdown)}%`}
              trend={performanceMetrics.maxDrawdown < -10 ? 'down' : performanceMetrics.maxDrawdown < -5 ? 'neutral' : 'up'} 
              period="Peak to Trough"
              icon={<TrendingDownIcon />}
              variant="outlined"
            />
          </div>
          <div className="col-span-1">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar
                title="Portfolio Performance Over Time"
                onRefresh={handleRefreshData}
                chartType={chartType}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={showBenchmark}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[400px]">
                <div className="h-full p-4">
                  {chartType === 'line' ? (
                    <Line 
                      ref={chartRef}
                      data={performanceChartData} 
                      options={lineChartOptions} 
                    />
                  ) : (
                    <Bar 
                      ref={chartRef}
                      data={performanceChartData} 
                      options={barChartOptions} 
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar
                title="Monthly Returns"
                onRefresh={handleRefreshData}
                chartType={chartType as ChartTypeOptions}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={false}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[300px]">
                <div className="h-full p-4">
                  <Bar data={monthlyReturnsData} options={barChartOptions} />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar
                title="Trade Distribution"
                onRefresh={handleRefreshData}
                chartType={chartType as ChartTypeOptions}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={false}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[300px]">
                <div className="h-full flex justify-center items-center relative p-4">
                  <Pie data={distributionData} />
                  <div className="absolute flex flex-col items-center">
                    <h6 className="text-2xl font-semibold">
                      {performanceMetrics.winRate.toFixed(1)}%
                    </h6>
                    <p className="text-sm text-slate-600">
                      Win Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabPanel>
      
      <TabPanel value={tabValue} index="1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar 
                title="Value at Risk (VaR)"
                onRefresh={handleRefreshData}
                chartType={chartType as ChartTypeOptions}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={false}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[300px]">
                <div className="h-full p-4">
                  <Bar 
                    data={{
                      labels: ['10%', '5%', '1%'],
                      datasets: [
                        {
                          label: 'Portfolio',
                          data: [performanceMetrics.totalReturn, performanceMetrics.maxDrawdown, performanceMetrics.sharpeRatio],
                          backgroundColor: ['bg-primary', 'bg-red-500', 'bg-green-500'],
                          borderWidth: 0,
                        }
                      ]
                    }}
                    options={barChartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar 
                title="Volatility Analysis"
                onRefresh={handleRefreshData}
                chartType={chartType as ChartTypeOptions}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={false}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[300px]">
                <div className="h-full p-4">
                  <Bar 
                    data={{
                      labels: ['Annualized Volatility', 'Max Drawdown', 'Sharpe Ratio'],
                      datasets: [
                        {
                          label: 'Portfolio',
                          data: [performanceMetrics.sharpeRatio, performanceMetrics.maxDrawdown, performanceMetrics.sharpeRatio],
                          backgroundColor: ['bg-primary', 'bg-red-500', 'bg-green-500'],
                          borderWidth: 0,
                        }
                      ]
                    }}
                    options={barChartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <CardHeader title="Risk Metrics Summary" />
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <StatCard 
                      title="Total Return"
                      value={`${formatNumber(performanceMetrics.totalReturn)}%`}
                      trend={performanceMetrics.totalReturn > 0 ? 'up' : performanceMetrics.totalReturn < 0 ? 'down' : 'neutral'}
                      period={`vs. Prev. ${selectedTimeRange}`}
                      icon={<BarChartIcon />}
                      variant="outlined"
                    />
                  </div>
                  <div className="col-span-1">
                    <StatCard 
                      title="Sharpe Ratio"
                      value={formatNumber(performanceMetrics.sharpeRatio)}
                      trend={performanceMetrics.sharpeRatio > 1 ? 'up' : performanceMetrics.sharpeRatio < 0.5 ? 'down' : 'neutral'} 
                      period="Annualized"
                      icon={<TrendingUpIcon />}
                      variant="outlined"
                    />
                  </div>
                  <div className="col-span-1">
                    <StatCard 
                      title="Max Drawdown"
                      value={`${formatNumber(performanceMetrics.maxDrawdown)}%`}
                      trend={performanceMetrics.maxDrawdown < -10 ? 'down' : performanceMetrics.maxDrawdown < -5 ? 'neutral' : 'up'} 
                      period="Peak to Trough"
                      icon={<TrendingDownIcon />}
                      variant="outlined"
                    />
                  </div>
                  <div className="col-span-1">
                    <StatCard 
                      title="Win Rate"
                      value={`${formatNumber(performanceMetrics.winRate)}%`}
                      trend={performanceMetrics.winRate > 50 ? 'up' : performanceMetrics.winRate < 50 ? 'down' : 'neutral'} 
                      period="Avg. Last 30 Trades"
                      icon={<PieChartIcon />}
                      variant="outlined"
                    />
                  </div>
                  <div className="col-span-1">
                    <StatCard 
                      title="Profit Factor"
                      value={formatNumber(performanceMetrics.profitFactor)}
                      trend={performanceMetrics.profitFactor > 1 ? 'up' : performanceMetrics.profitFactor < 1 ? 'down' : 'neutral'} 
                      period="Rolling 90-Day"
                      icon={<TrendingUpIcon />}
                      variant="outlined"
                    />
                  </div>
                  <div className="col-span-1">
                    <StatCard 
                      title="Average Win"
                      value={`${formatNumber(performanceMetrics.avgWin)}`}
                      trend={performanceMetrics.avgWin > 0 ? 'up' : performanceMetrics.avgWin < 0 ? 'down' : 'neutral'} 
                      period="Rolling 90-Day"
                      icon={<TrendingUpIcon />}
                      variant="outlined"
                    />
                  </div>
                  <div className="col-span-1">
                    <StatCard 
                      title="Average Loss"
                      value={`${formatNumber(performanceMetrics.avgLoss)}`}
                      trend={performanceMetrics.avgLoss < 0 ? 'down' : performanceMetrics.avgLoss > 0 ? 'up' : 'neutral'} 
                      period="Rolling 90-Day"
                      icon={<TrendingDownIcon />}
                      variant="outlined"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </TabPanel>
      
      <TabPanel value={tabValue} index="2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar 
                title="Trade Distribution (Win/Loss)"
                onRefresh={handleRefreshData}
                chartType={chartType as ChartTypeOptions}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={false}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[300px]">
                <div className="h-full flex justify-center items-center relative p-4">
                  <Pie data={distributionData} />
                  <div className="absolute flex flex-col items-center">
                    <h6 className="text-2xl font-semibold">
                      {performanceMetrics.winRate.toFixed(1)}%
                    </h6>
                    <p className="text-sm text-slate-600">
                      Win Rate
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1 md:col-span-2">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar 
                title="Average Win/Loss Size"
                onRefresh={handleRefreshData}
                chartType={chartType as ChartTypeOptions}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={false}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[300px]">
                <div className="h-full p-4">
                  <Bar 
                    data={{
                      labels: ['Average Win', 'Average Loss'],
                      datasets: [
                        {
                          label: 'Portfolio',
                          data: [performanceMetrics.avgWin, performanceMetrics.avgLoss],
                          backgroundColor: ['bg-green-500', 'bg-red-500'],
                          borderWidth: 0,
                        }
                      ]
                    }}
                    options={barChartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1 md:col-span-2">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar 
                title="Profit Factor Over Time"
                onRefresh={handleRefreshData}
                chartType={chartType as ChartTypeOptions}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={false}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[300px]">
                <div className="h-full p-4">
                  <Bar 
                    data={{
                      labels: ['1 Month', '3 Months', '6 Months', '1 Year', 'YTD', 'ALL'],
                      datasets: [
                        {
                          label: 'Portfolio',
                          data: [performanceMetrics.profitFactor, performanceMetrics.profitFactor, performanceMetrics.profitFactor, performanceMetrics.profitFactor, performanceMetrics.profitFactor, performanceMetrics.profitFactor],
                          backgroundColor: 'bg-primary',
                          borderWidth: 0,
                        }
                      ]
                    }}
                    options={barChartOptions}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <CardHeader title="Detailed Trade Log" />
              <CardContent>
                {/* Add detailed trade log content here */}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabPanel>

      <TabPanel value="3" index="3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar 
                title="Asset Allocation by Class"
                onRefresh={handleRefreshData}
                chartType={chartType as ChartTypeOptions}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={false}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[300px]">
                {/* Add asset allocation by class chart content here */}
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <ChartToolbar 
                title="Sector Exposure"
                onRefresh={handleRefreshData}
                chartType={chartType as ChartTypeOptions}
                onChartTypeChange={handleChartTypeChange}
                showBenchmark={false}
                onShowBenchmarkChange={setShowBenchmark}
                setChartType={setChartType}
              />
              <CardContent className="p-0 h-[300px]">
                {/* Add sector exposure chart content here */}
              </CardContent>
            </Card>
          </div>
          <div className="col-span-1">
            <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
              <CardHeader title="Top Holdings" />
              <CardContent>
                {/* Add top holdings content here */}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabPanel>

      <TabPanel value="4" index="4">
        <Card className="border border-border/50 bg-white/70 backdrop-blur-sm">
          <CardHeader title="Custom Analytics & Reporting" />
          <CardContent>
            {/* Add custom analytics and reporting content here */}
          </CardContent>
        </Card>
      </TabPanel>
      </div>
    </div>
    </TooltipProvider>
  );
};

export default AnalyticsPage;