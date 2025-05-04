import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
  FormControlLabel
} from '@mui/material';
import {
  ShowChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Launch as LaunchIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  CompareArrows as CompareIcon
} from '@mui/icons-material';

import { RootState } from '../store';
import StatCard from '../components/dashboard/StatCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import RecentBacktests from '../components/dashboard/RecentBacktests';
import StatusCard from '../components/dashboard/StatusCard';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { strategies } = useSelector((state: RootState) => state.strategy);
  const { availableData } = useSelector((state: RootState) => state.data);
  const { results } = useSelector((state: RootState) => state.backtesting);

  // Performance data state
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  
  // Benchmark comparison data
  const [benchmarkData, setBenchmarkData] = useState<any[]>([]);
  
  // Toggle for showing/hiding benchmark comparison
  const [showBenchmark, setShowBenchmark] = useState(false);

  useEffect(() => {
    // In a real implementation, this would fetch actual data from your API
    setPerformanceData([
      { date: '2023-01-01', value: 10000 },
      { date: '2023-02-01', value: 10500 },
      { date: '2023-03-01', value: 10300 },
      { date: '2023-04-01', value: 10800 },
      { date: '2023-05-01', value: 11200 },
      { date: '2023-06-01', value: 11500 },
      { date: '2023-07-01', value: 11300 },
      { date: '2023-08-01', value: 12000 },
      { date: '2023-09-01', value: 12500 },
      { date: '2023-10-01', value: 12200 },
      { date: '2023-11-01', value: 12800 },
      { date: '2023-12-01', value: 13500 },
      { date: '2024-01-01', value: 13200 },
      { date: '2024-02-01', value: 14000 },
      { date: '2024-03-01', value: 14500 },
      { date: '2024-04-01', value: 15000 },
    ]);
    
    // Sample benchmark data (e.g., S&P 500)
    setBenchmarkData([
      { date: '2023-01-01', value: 10000 },
      { date: '2023-02-01', value: 10300 },
      { date: '2023-03-01', value: 10100 },
      { date: '2023-04-01', value: 10400 },
      { date: '2023-05-01', value: 10800 },
      { date: '2023-06-01', value: 11000 },
      { date: '2023-07-01', value: 11200 },
      { date: '2023-08-01', value: 11100 },
      { date: '2023-09-01', value: 11500 },
      { date: '2023-10-01', value: 11300 },
      { date: '2023-11-01', value: 11700 },
      { date: '2023-12-01', value: 12200 },
      { date: '2024-01-01', value: 12400 },
      { date: '2024-02-01', value: 12700 },
      { date: '2024-03-01', value: 13000 },
      { date: '2024-04-01', value: 13200 },
    ]);
  }, []);

  // Calculate latest performance metrics
  const getPerformanceMetrics = () => {
    if (performanceData.length < 2) return { 
      total: '0%', 
      monthly: '0%',
      isPositive: {
        total: false,
        monthly: false 
      }
    };
    
    const latest = performanceData[performanceData.length - 1].value;
    const initial = performanceData[0].value;
    const oneMonthAgo = performanceData[performanceData.length - 2].value;
    
    const totalReturn = ((latest - initial) / initial) * 100;
    const monthlyReturn = ((latest - oneMonthAgo) / oneMonthAgo) * 100;
    
    return {
      total: `${totalReturn.toFixed(2)}%`,
      monthly: `${monthlyReturn.toFixed(2)}%`,
      isPositive: {
        total: totalReturn >= 0,
        monthly: monthlyReturn >= 0
      }
    };
  };

  const performanceMetrics = getPerformanceMetrics();
  const recentBacktests = results?.slice(0, 5) || []; // Get most recent 5 backtests with safety check
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<ChartIcon />}
          onClick={() => navigate('/backtesting')}
        >
          Run New Backtest
        </Button>
      </Box>
      
      <Grid container spacing={3}>
        {/* Key stats */}
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total Strategies" 
            value={strategies?.length || 0}
            icon={<ChartIcon />}
            color="#3f51b5"
            onClick={() => navigate('/strategies')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Available Datasets" 
            value={availableData?.length || 0}
            icon={<ChartIcon />}
            color="#f50057"
            onClick={() => navigate('/data')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Total Return" 
            value={performanceMetrics.total}
            icon={performanceMetrics.isPositive?.total ? <TrendingUpIcon /> : <TrendingDownIcon />}
            color={performanceMetrics.isPositive?.total ? "#4caf50" : "#f44336"}
            onClick={() => navigate('/analytics')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Monthly Return" 
            value={performanceMetrics.monthly}
            icon={performanceMetrics.isPositive?.monthly ? <TrendingUpIcon /> : <TrendingDownIcon />}
            color={performanceMetrics.isPositive?.monthly ? "#4caf50" : "#f44336"}
            onClick={() => navigate('/analytics')}
          />
        </Grid>

        {/* Main performance chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader 
              title="Portfolio Performance" 
              action={
                <FormControlLabel
                  control={
                    <Switch
                      checked={showBenchmark}
                      onChange={(e) => setShowBenchmark(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CompareIcon fontSize="small" />
                      <Typography variant="body2">Benchmark</Typography>
                    </Box>
                  }
                />
              }
            />
            <Divider />
            <CardContent sx={{ height: 350, pt: 0, position: 'relative' }}>
              <PerformanceChart 
                data={performanceData} 
                compareData={showBenchmark ? benchmarkData : undefined}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* System status */}
        <Grid item xs={12} md={4}>
          <StatusCard />
        </Grid>

        {/* Recent backtests */}
        <Grid item xs={12} md={6}>
          <RecentBacktests 
            backtests={recentBacktests} 
            onViewAll={() => navigate('/backtesting')} 
          />
        </Grid>

        {/* Quick actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Quick Actions" 
              action={
                <IconButton>
                  <ArrowForwardIcon />
                </IconButton>
              }
            />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                <Button 
                  variant="outlined" 
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/strategies')}
                  fullWidth
                >
                  Create New Strategy
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/data')}
                  fullWidth
                >
                  Import Market Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ChartIcon />}
                  onClick={() => navigate('/analytics')}
                  fullWidth
                >
                  View Analytics
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;