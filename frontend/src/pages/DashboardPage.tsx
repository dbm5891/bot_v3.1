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
  Stack
} from '@mui/material';
import {
  ShowChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Launch as LaunchIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
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

  // Sample performance data (this would come from your actual backtests)
  const [performanceData, setPerformanceData] = useState<any[]>([]);

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
    ]);
  }, []);

  const recentBacktests = results.slice(0, 5); // Get most recent 5 backtests
  
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
            value={strategies.length}
            icon={<ChartIcon />}
            color="#3f51b5"
            onClick={() => navigate('/strategies')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Available Datasets" 
            value={availableData.length}
            icon={<ChartIcon />}
            color="#f50057"
            onClick={() => navigate('/data')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Backtest Runs" 
            value={results.length}
            icon={<ChartIcon />}
            color="#00bcd4"
            onClick={() => navigate('/backtesting')}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard 
            title="Best Performance" 
            value={"+23.5%"}
            icon={<TrendingUpIcon />}
            color="#4caf50"
            onClick={() => navigate('/analytics')}
          />
        </Grid>

        {/* Main performance chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader title="Portfolio Performance" />
            <Divider />
            <CardContent sx={{ height: 300, pt: 0, position: 'relative' }}>
              <PerformanceChart data={performanceData} />
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