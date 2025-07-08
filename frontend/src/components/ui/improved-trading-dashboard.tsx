import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Target,
  Settings,
  Bell,
  RefreshCw,
  Play,
  Pause,
  Download,
  Filter,
  Search,
  MoreVertical,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Progress } from "./progress";
import { Switch } from "./switch";
import { useNavigate } from 'react-router-dom';
import { useDashboardData } from '../../hooks/useDashboardData';

// Enhanced Sparkline Chart Component
const SparklineChart = ({ 
  data, 
  color, 
  width = 100, 
  height = 30,
  showGradient = true 
}: { 
  data: number[], 
  color: string, 
  width?: number, 
  height?: number,
  showGradient?: boolean 
}) => {
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal;
  
  const points = data.map((value, index) => {
    const x = (data.length > 1 ? (index / (data.length - 1)) : 0.5) * width;
    const y = height - (range !== 0 ? ((value - minVal) / range) * height : height / 2);
    return `${x},${y}`;
  }).join(' ');
  
  const gradientId = `gradient-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      {showGradient && (
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showGradient && (
        <polygon 
          points={`0,${height} ${points} ${width},${height}`}
          fill={`url(#${gradientId})`}
        />
      )}
    </svg>
  );
};

// Enhanced Metrics Card Component
const MetricsCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend,
  subtitle,
  onClick 
}: {
  title: string;
  value: string;
  change?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  onClick?: () => void;
}) => (
  <Card className="bg-card border-border hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={onClick}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-500' : 
            trend === 'down' ? 'text-red-500' : 
            'text-muted-foreground'
          }`}>
            {trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
            {trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
            {change}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// Main Improved Trading Dashboard Component
const ImprovedTradingDashboard = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Use the real dashboard data hook
  const {
    loading,
    strategies,
    availableData,
    results: recentBacktests,
    metrics,
    refreshData,
    formatLastRefreshed,
  } = useDashboardData('ALL');

  // Real-time clock update
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  // Mock data for demonstration
  const mockSparklineData = [120000, 122000, 118000, 125000, 127000, 124000, 126000, 125847];
  const portfolioValue = 125847.32;
  const dailyPnL = 2847.56;

  // Create enhanced metrics from real data
  const dashboardMetrics = [
    {
      title: 'Portfolio Value',
      value: formatCurrency(portfolioValue),
      change: `${dailyPnL >= 0 ? '+' : ''}${formatCurrency(dailyPnL)}`,
      trend: dailyPnL >= 0 ? 'up' as const : 'down' as const,
      icon: DollarSign,
      subtitle: 'Total Balance',
      onClick: () => navigate('/analytics')
    },
    {
      title: 'Active Strategies',
      value: strategies?.length?.toString() || '0',
      change: '+12.5%',
      trend: 'up' as const,
      icon: Target,
      subtitle: 'Running algorithms',
      onClick: () => navigate('/strategies')
    },
    {
      title: 'Recent Backtests',
      value: recentBacktests?.length?.toString() || '0',
      change: metrics?.monthlyReturn ? `${metrics.monthlyReturn > 0 ? '+' : ''}${metrics.monthlyReturn.toFixed(1)}%` : '0%',
      trend: (metrics?.monthlyReturn || 0) >= 0 ? 'up' as const : 'down' as const,
      icon: BarChart2,
      subtitle: 'This month',
      onClick: () => navigate('/backtesting')
    },
    {
      title: 'Win Rate',
      value: '68.5%',
      change: '+2.3%',
      trend: 'up' as const,
      icon: TrendingUp,
      subtitle: 'Last 30 days',
      onClick: () => navigate('/analytics')
    }
  ];

  if (loading.global) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-background text-foreground p-6 space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-background text-foreground p-6 space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Activity className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AlgoTrader Pro
              </h1>
              <p className="text-sm text-muted-foreground">Advanced Trading Dashboard • Last updated: {formatLastRefreshed()}</p>
            </div>
          </div>
          
          <Badge variant="default" className="gap-2 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Trading
          </Badge>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
            <Clock className="h-4 w-4" />
            {currentTime.toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardMetrics.map((metric, index) => (
          <MetricsCard key={metric.title} {...metric} />
        ))}
      </div>

      {/* Enhanced Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-muted/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-background">Overview</TabsTrigger>
          <TabsTrigger value="positions" className="data-[state=active]:bg-background">Positions</TabsTrigger>
          <TabsTrigger value="strategies" className="data-[state=active]:bg-background">Strategies</TabsTrigger>
          <TabsTrigger value="markets" className="data-[state=active]:bg-background">Markets</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-background">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Enhanced Performance Chart */}
            <div className="xl:col-span-2">
              <Card className="bg-card border-border shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BarChart2 className="h-5 w-5 text-primary" />
                    </div>
                    Portfolio Performance
                    <Badge variant="secondary">
                      +25.84%
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl font-bold text-foreground">
                        {formatCurrency(portfolioValue)}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">24h Change</div>
                        <div className={`font-medium ${dailyPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {dailyPnL >= 0 ? '+' : ''}{formatCurrency(dailyPnL)} ({((dailyPnL / portfolioValue) * 100).toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                    
                    <div className="h-64 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl border border-border/50 flex items-center justify-center">
                      <SparklineChart
                        data={mockSparklineData}
                        color="#3B82F6"
                        width={600}
                        height={200}
                        showGradient={true}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Total Return</div>
                        <div className="font-medium text-green-500">+25.84%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                        <div className="font-medium">2.14</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Max Drawdown</div>
                        <div className="font-medium text-red-500">-8.2%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Win Rate</div>
                        <div className="font-medium">68.5%</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Side Panel */}
            <div className="space-y-6">
              {/* Recent Backtests */}
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Recent Backtests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentBacktests && recentBacktests.length > 0 ? (
                      recentBacktests.slice(0, 4).map((backtest, index) => (
                        <div
                          key={backtest.id || index}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer border border-border/50"
                          onClick={() => navigate(`/backtest/${backtest.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                            <div>
                              <p className="text-sm font-medium">
                                {backtest.strategyName || 'Strategy'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {backtest.symbol || 'Multiple'} • {backtest.createdAt || 'Recent'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              (backtest.totalReturn || 0) >= 0 ? "text-green-500" : "text-red-500"
                            }`}>
                              {backtest.totalReturn ? `${backtest.totalReturn > 0 ? '+' : ''}${backtest.totalReturn.toFixed(2)}%` : 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BarChart2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No recent backtests</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => navigate('/backtesting')}
                        >
                          Start Backtest
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card className="bg-card border-border shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 hover:bg-primary/5"
                      onClick={() => navigate('/strategies')}
                    >
                      <Target className="h-6 w-6" />
                      <span className="text-xs">Strategies</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 hover:bg-primary/5"
                      onClick={() => navigate('/backtesting')}
                    >
                      <Play className="h-6 w-6" />
                      <span className="text-xs">Backtest</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 hover:bg-primary/5"
                      onClick={() => navigate('/data')}
                    >
                      <BarChart2 className="h-6 w-6" />
                      <span className="text-xs">Data</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2 hover:bg-primary/5"
                      onClick={() => navigate('/analytics')}
                    >
                      <Activity className="h-6 w-6" />
                      <span className="text-xs">Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Trading Strategies</h3>
            <Button onClick={() => navigate('/strategies')}>
              <Briefcase className="h-4 w-4 mr-2" />
              Manage Strategies
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {strategies && strategies.length > 0 ? (
              strategies.map((strategy, index) => (
                <Card key={strategy.id || index} className="bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-medium">{strategy.name || `Strategy ${index + 1}`}</CardTitle>
                    <Badge variant="default">Active</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Performance</div>
                        <div className="font-medium text-green-500">+12.5%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Win Rate</div>
                        <div className="font-medium">68.5%</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Risk Level</span>
                        <Badge variant="secondary" className="text-xs">Medium</Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="h-3 w-3 mr-1" />
                        Config
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">No strategies configured</p>
                <p className="text-sm mb-4">Create your first trading strategy to get started</p>
                <Button onClick={() => navigate('/strategies')}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Create Strategy
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Performance Analytics</h3>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Portfolio Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-48 bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-border/50 flex items-center justify-center">
                    <SparklineChart
                      data={mockSparklineData}
                      color="#10B981"
                      width={400}
                      height={160}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Return</div>
                      <div className="text-lg font-bold text-green-500">+25.84%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Sharpe Ratio</div>
                      <div className="text-lg font-bold">2.14</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Risk Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Max Drawdown</span>
                      <span className="text-red-500">-8.2%</span>
                    </div>
                    <Progress value={18} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Volatility</span>
                      <span>12.4%</span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Beta</span>
                      <span>1.23</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Placeholder for other tabs */}
        <TabsContent value="positions" className="space-y-6 mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No open positions</p>
            <p className="text-sm">Your trading positions will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="markets" className="space-y-6 mt-6">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">Market data coming soon</p>
            <p className="text-sm">Real-time market information will be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImprovedTradingDashboard; 