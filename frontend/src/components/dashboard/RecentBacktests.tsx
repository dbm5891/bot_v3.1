import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Alert,
  Stack,
  Tooltip,
  Skeleton,
  alpha,
  useTheme
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  CompareArrows as CompareIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AddCircleOutline as AddCircleOutlineIcon
} from '@mui/icons-material';

const formatDateString = (dateStr: string | undefined, locale: string = 'en-US'): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffDays = Math.round(diffSeconds / (24 * 60 * 60));

    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.round(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.round(diffSeconds / 3600)}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays <= 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

interface BacktestResult {
  id: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  totalReturn?: string | number;
  createdAt?: string;
}

interface RecentBacktestsProps {
  backtests: BacktestResult[];
  loading?: boolean;
  error?: string | null;
  onViewDetails: (id: string) => void;
}

const RecentBacktests: React.FC<RecentBacktestsProps> = ({ 
  backtests, 
  loading, 
  error,
  onViewDetails,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  if (loading) {
    return <Skeleton variant="rectangular" width="100%" height={150} animation="wave" />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!backtests || backtests.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          No recent backtests found.
        </Typography>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/backtesting')}
          startIcon={<AddCircleOutlineIcon />}
          sx={{ mt: 1 }}
        >
          Run a New Backtest
        </Button>
      </Box>
    );
  }

  const getReturnValue = (value: string | number | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value.replace('%','')) || 0;
    return 0;
  };

  const topBacktests = backtests.slice(0, 4);

  return (
    <List disablePadding>
      {topBacktests.map((backtest, index) => {
        const returnValue = getReturnValue(backtest.totalReturn);
        const isPositive = returnValue >= 0;
        
        return (
          <React.Fragment key={backtest.id}>
            {index > 0 && <Divider component="li" variant="inset" />}
            <ListItem 
              button
              onClick={() => onViewDetails(backtest.id)}
              alignItems="flex-start"
              sx={{ 
                px: 2, py: 1.5, 
                transition: 'background-color 0.2s ease',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mr: 1, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {backtest.strategyName}
                    </Typography>
                    <Chip 
                      label={backtest.symbol}
                      size="small" 
                      variant="outlined" 
                      sx={{ borderColor: theme.palette.primary.light, color: theme.palette.primary.dark, flexShrink: 0 }}
                    />
                  </Box>
                }
                secondaryTypographyProps={{ component: 'div'}}
                secondary={
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
                    <Tooltip title={`Total Return: ${returnValue.toFixed(2)}%`}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: isPositive ? theme.palette.success.main : theme.palette.error.main }}>
                        {isPositive ? <TrendingUpIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />}
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'medium' }}
                        >
                          {`${isPositive ? '+' : ''}${returnValue.toFixed(2)}%`}
                        </Typography>
                      </Box>
                    </Tooltip>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateString(backtest.createdAt)}
                    </Typography>
                  </Stack>
                }
              />
            </ListItem>
          </React.Fragment>
        );
      })}
    </List>
  );
};

export default RecentBacktests;