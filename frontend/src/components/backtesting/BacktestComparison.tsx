import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Typography,
  Stack,
  IconButton,
  Paper,
  Tooltip,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  BarChart as BarChartIcon,
  SwapVert as SwapVertIcon,
  Info as InfoIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Interface to match the mapped data we're providing
interface BacktestResult {
  id: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  totalReturns: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  tradesCount: number;
  date: string;
}

interface BacktestComparisonProps {
  backtests: BacktestResult[];
  loading?: boolean;
  error?: string | null;
  onRemoveBacktest?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  onExportData?: (format: 'csv' | 'json') => void;
}

// Metric definitions for tooltips
const metricDefinitions = {
  totalReturns: "Total percentage return of the backtest",
  sharpeRatio: "Measure of risk-adjusted return (higher is better)",
  maxDrawdown: "Maximum observed loss from a peak to a trough (lower is better)",
  winRate: "Percentage of winning trades",
  profitFactor: "Ratio of gross profits to gross losses (higher is better)",
  tradesCount: "Total number of trades executed"
};

// Compare options for sorting
const compareOptions = [
  { value: 'totalReturns', label: 'Total Returns' },
  { value: 'sharpeRatio', label: 'Sharpe Ratio' },
  { value: 'maxDrawdown', label: 'Max Drawdown' },
  { value: 'winRate', label: 'Win Rate' },
  { value: 'profitFactor', label: 'Profit Factor' },
  { value: 'tradesCount', label: 'Trades Count' }
];

const BacktestComparison: React.FC<BacktestComparisonProps> = ({
  backtests,
  loading = false,
  error = null,
  onRemoveBacktest,
  onViewDetails,
  onExportData
}) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<string>('totalReturns');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (metric: string) => {
    if (sortBy === metric) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(metric);
      setSortDirection('desc');
    }
  };

  const sortedBacktests = useMemo(() => {
    if (!backtests || backtests.length === 0) return [];
    
    return [...backtests].sort((a, b) => {
      const aValue = a[sortBy as keyof BacktestResult];
      const bValue = b[sortBy as keyof BacktestResult];
      
      // Handle numeric values
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // Handle string values
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
  }, [backtests, sortBy, sortDirection]);

  const formatValue = (value: number, metric: string) => {
    switch (metric) {
      case 'totalReturns':
      case 'maxDrawdown':
        return `${value.toFixed(2)}%`;
      case 'winRate':
        return `${(value * 100).toFixed(2)}%`;
      case 'sharpeRatio':
      case 'profitFactor':
        return value.toFixed(2);
      case 'tradesCount':
        return value.toString();
      default:
        return value.toString();
    }
  };

  const getBestValue = (metric: string) => {
    if (!backtests || backtests.length === 0) return null;
    
    let bestIndex = 0;
    let bestValue = backtests[0][metric as keyof BacktestResult] as number;
    
    backtests.forEach((backtest, index) => {
      const currentValue = backtest[metric as keyof BacktestResult] as number;
      
      // For most metrics, higher is better
      let isBetter = currentValue > bestValue;
      
      // For drawdown, lower is better
      if (metric === 'maxDrawdown') {
        isBetter = currentValue < bestValue;
      }
      
      if (isBetter) {
        bestIndex = index;
        bestValue = currentValue;
      }
    });
    
    return backtests[bestIndex].id;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!backtests || backtests.length === 0) {
    return (
      <Alert severity="info">
        No backtests available for comparison. Run multiple backtests to compare their results.
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader 
        title="Backtest Comparison" 
        action={
          <Stack direction="row" spacing={1}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="sort-by-label">Sort By</InputLabel>
              <Select
                labelId="sort-by-label"
                id="sort-by-select"
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                size="small"
              >
                {compareOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}>
              <SwapVertIcon />
            </IconButton>
            {onExportData && (
              <Tooltip title="Export comparison data">
                <IconButton onClick={() => onExportData('csv')}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Strategy</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Timeframe</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Total Returns
                    <Tooltip title={metricDefinitions.totalReturns}>
                      <IconButton size="small"><InfoIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Sharpe Ratio
                    <Tooltip title={metricDefinitions.sharpeRatio}>
                      <IconButton size="small"><InfoIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Max Drawdown
                    <Tooltip title={metricDefinitions.maxDrawdown}>
                      <IconButton size="small"><InfoIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Win Rate
                    <Tooltip title={metricDefinitions.winRate}>
                      <IconButton size="small"><InfoIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    Profit Factor
                    <Tooltip title={metricDefinitions.profitFactor}>
                      <IconButton size="small"><InfoIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedBacktests.map((backtest) => {
                const bestTotalReturns = getBestValue('totalReturns');
                const bestSharpe = getBestValue('sharpeRatio');
                const bestDrawdown = getBestValue('maxDrawdown');
                const bestWinRate = getBestValue('winRate');
                const bestProfitFactor = getBestValue('profitFactor');

                return (
                  <TableRow key={backtest.id} hover>
                    <TableCell>
                      <Typography variant="body2">{backtest.strategyName}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(backtest.date).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{backtest.symbol}</TableCell>
                    <TableCell>{backtest.timeframe}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          color={backtest.totalReturns >= 0 ? 'success.main' : 'error.main'}
                          fontWeight={backtest.id === bestTotalReturns ? 'bold' : 'normal'}
                        >
                          {formatValue(backtest.totalReturns, 'totalReturns')}
                        </Typography>
                        {backtest.id === bestTotalReturns && (
                          <Chip size="small" label="Best" color="primary" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          fontWeight={backtest.id === bestSharpe ? 'bold' : 'normal'}
                        >
                          {formatValue(backtest.sharpeRatio, 'sharpeRatio')}
                        </Typography>
                        {backtest.id === bestSharpe && (
                          <Chip size="small" label="Best" color="primary" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2" 
                          color="error"
                          fontWeight={backtest.id === bestDrawdown ? 'bold' : 'normal'}
                        >
                          {formatValue(backtest.maxDrawdown, 'maxDrawdown')}
                        </Typography>
                        {backtest.id === bestDrawdown && (
                          <Chip size="small" label="Best" color="primary" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2"
                          fontWeight={backtest.id === bestWinRate ? 'bold' : 'normal'}
                        >
                          {formatValue(backtest.winRate, 'winRate')}
                        </Typography>
                        {backtest.id === bestWinRate && (
                          <Chip size="small" label="Best" color="primary" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          variant="body2"
                          fontWeight={backtest.id === bestProfitFactor ? 'bold' : 'normal'}
                        >
                          {formatValue(backtest.profitFactor, 'profitFactor')}
                        </Typography>
                        {backtest.id === bestProfitFactor && (
                          <Chip size="small" label="Best" color="primary" sx={{ ml: 1, height: 16, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="View details">
                          <IconButton 
                            size="small" 
                            onClick={() => onViewDetails && onViewDetails(backtest.id)}
                          >
                            <BarChartIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {onRemoveBacktest && (
                          <Tooltip title="Remove from comparison">
                            <IconButton 
                              size="small" 
                              onClick={() => onRemoveBacktest(backtest.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default BacktestComparison; 