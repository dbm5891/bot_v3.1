import React from 'react';
import { 
  Box, 
  Card, 
  CardHeader, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  Typography, 
  Button,
  IconButton,
  Chip
} from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { BacktestResult } from '../../store/slices/backtestingSlice';

interface RecentBacktestsProps {
  backtests: BacktestResult[];
  onViewAll: () => void;
}

const RecentBacktests: React.FC<RecentBacktestsProps> = ({ backtests, onViewAll }) => {
  // No backtests available yet
  if (!backtests || backtests.length === 0) {
    return (
      <Card>
        <CardHeader 
          title="Recent Backtests" 
          action={
            <Button 
              size="small" 
              endIcon={<ArrowForwardIcon />}
              onClick={onViewAll}
            >
              View All
            </Button>
          }
        />
        <Divider />
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            No backtests have been run yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }}
            onClick={onViewAll}
          >
            Run Backtest
          </Button>
        </Box>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Recent Backtests" 
        action={
          <Button 
            size="small" 
            endIcon={<ArrowForwardIcon />}
            onClick={onViewAll}
          >
            View All
          </Button>
        }
      />
      <Divider />
      <List sx={{ padding: 0 }}>
        {backtests.map((backtest) => {
          // Handle the case where totalReturn might be undefined
          const totalReturn = backtest.totalReturn || backtest.roi || 0;
          const isPositive = totalReturn > 0;
          
          return (
            <React.Fragment key={backtest.id}>
              <ListItem>
                <ListItemText
                  primary={`${backtest.strategyName} (${backtest.symbol})`}
                  secondary={`${backtest.startDate} - ${backtest.endDate}`}
                />
                <ListItemSecondaryAction>
                  <Chip
                    icon={isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                    label={`${isPositive ? '+' : ''}${(totalReturn * 100).toFixed(2)}%`}
                    color={isPositive ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
            </React.Fragment>
          );
        })}
      </List>
    </Card>
  );
};

export default RecentBacktests;