import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Launch as LaunchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { BacktestResult } from '../../store/slices/backtestingSlice';

interface RecentBacktestsProps {
  backtests: BacktestResult[];
  onViewAll: () => void;
}

const RecentBacktests: React.FC<RecentBacktestsProps> = ({ backtests, onViewAll }) => {
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader 
        title="Recent Backtests" 
        action={
          <Button size="small" onClick={onViewAll}>View All</Button>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {backtests.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No recent backtests</Typography>
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 2 }}
              onClick={onViewAll}
            >
              Run a Backtest
            </Button>
          </Box>
        ) : (
          <List disablePadding>
            {backtests.map((backtest, index) => {
              const isPositive = backtest.totalReturn > 0;
              return (
                <React.Fragment key={backtest.id}>
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="view">
                        <LaunchIcon fontSize="small" />
                      </IconButton>
                    }
                    sx={{ px: 2, py: 1.5 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body1" component="span">
                            {backtest.strategyName}
                          </Typography>
                          <Chip 
                            size="small" 
                            label={backtest.symbol} 
                            sx={{ ml: 1, fontSize: '0.75rem' }} 
                          />
                        </Box>
                      }
                      secondary={
                        <Box component="span" sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary" component="span">
                            {`${backtest.timeframe} | ${new Date(backtest.endDate).toLocaleDateString()}`}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            component="span"
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              color: isPositive ? 'success.main' : 'error.main',
                              fontWeight: 'medium'
                            }}
                          >
                            {isPositive ? <TrendingUpIcon fontSize="small" sx={{ mr: 0.5 }} /> : <TrendingDownIcon fontSize="small" sx={{ mr: 0.5 }} />}
                            {`${isPositive ? '+' : ''}${(backtest.totalReturn * 100).toFixed(2)}%`}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < backtests.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentBacktests;