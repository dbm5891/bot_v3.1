import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  useTheme
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  Assessment as AssessmentIcon,
  LocalAtm as LocalAtmIcon,
  SwapVert as SwapVertIcon
} from '@mui/icons-material';
import { BacktestResult, TradeDetail } from '../../store/slices/backtestingSlice';

// Interfaces for the component props
interface BacktestConfig {
  symbol: string;
  timeframe: string;
  strategy: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  positionSize: number;
  stopLoss?: number;
  takeProfit?: number;
  parameters: Record<string, any>;
}

interface BacktestResultsProps {
  results: BacktestResult;
  config: BacktestConfig | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`backtest-tabpanel-${index}`}
      aria-labelledby={`backtest-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const BacktestResults: React.FC<BacktestResultsProps> = ({ results, config }) => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Use optional chaining and provide default values for metrics
  const totalReturn = results.totalReturn ?? results.roi ?? 0; // Use totalReturn or roi
  const maxDrawdown = results.maxDrawdown ?? results.drawdown ?? 0; // Use maxDrawdown or drawdown
  const sharpeRatio = results.sharpeRatio ?? 0;
  const winRate = results.winRate ?? 0;
  // Profit factor calculation might be different based on available data
  // For now, use the provided profitFactor or a basic calculation if possible
  const profitFactor = results.profitFactor ?? (results.tradesDetails && results.tradesDetails.length > 0 ? calculateProfitFactor(results.tradesDetails) : 0); // Use profitFactor or calculate from trades, safely access tradesDetails
  const totalTrades = results.trades ?? results.tradesCount ?? (results.tradesDetails?.length ?? 0); // Use trades or tradesCount or count tradesDetails
  
  // Simple fallback profit factor calculation if tradesDetails are available
  function calculateProfitFactor(trades: TradeDetail[] | undefined): number {
      if (!trades || trades.length === 0) return 0; // Handle undefined or empty trades
      let grossProfits = 0;
      let grossLosses = 0;
      trades.forEach(trade => {
          if (trade.profit > 0) {
              grossProfits += trade.profit;
          } else {
              grossLosses += Math.abs(trade.profit);
          }
      });
      return grossLosses > 0 ? grossProfits / grossLosses : grossProfits > 0 ? 1 : 0;
  }

  const isPositiveReturn = totalReturn > 0;

  return (
    <Box>
      {config && (
        <>
          <Typography variant="h5" gutterBottom>
            Backtest Results: {config.strategy} on {config.symbol}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {config.timeframe} | {config.startDate} to {config.endDate}
          </Typography>
        </>
      )}

      {/* Performance Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalAtmIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Return</Typography>
              <Typography variant="h4">{totalReturn.toFixed(2)}%</Typography>
              {config && (
                <Typography variant="body2" color="text.secondary">
                  Initial: ${config.initialCapital.toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SwapVertIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Win Rate</Typography>
              <Typography variant="h4">{winRate.toFixed(1)}%</Typography>
              <Typography variant="body2" color="text.secondary">
                {totalTrades} total trades
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShowChartIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom>Profit Factor</Typography>
              <Typography variant="h4">{profitFactor.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Avg trade: N/A
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDownIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Max Drawdown</Typography>
              <Typography variant="h4">{maxDrawdown.toFixed(2)}%</Typography>
              <Typography variant="body2" color="text.secondary">
                Sharpe: {sharpeRatio.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabbed sections for detailed results */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="backtest results tabs">
          <Tab label="Equity Curve" />
          <Tab label="Trades" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 2, 
            height: 400, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: theme.shape.borderRadius 
          }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            Equity curve chart would be displayed here
          </Typography>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: theme.shape.borderRadius }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell align="right">Profit ($)</TableCell>
                  <TableCell align="right">Profit (%)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.tradesDetails?.map((trade, index) => (
                  <TableRow key={trade.id ?? index} hover sx={{ 
                    bgcolor: trade.profit > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                  }}>
                    <TableCell>{trade.id ?? index + 1}</TableCell>
                    <TableCell>{trade.type}</TableCell>
                    <TableCell>{trade.entryDate}</TableCell>
                    <TableCell>{trade.entryPrice}</TableCell>
                    <TableCell>{trade.size}</TableCell>
                    <TableCell align="right">{trade.profit.toFixed(2)}</TableCell>
                    <TableCell align="right">{trade.profitPercent?.toFixed(2) ?? trade.profitPct?.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: theme.shape.borderRadius }}>
          <Typography variant="h6" gutterBottom>Detailed Statistics</Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell component="th" scope="row">Total Return</TableCell>
                  <TableCell>{totalReturn.toFixed(2)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Max Drawdown</TableCell>
                  <TableCell>{maxDrawdown.toFixed(2)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Sharpe Ratio</TableCell>
                  <TableCell>{sharpeRatio.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Win Rate</TableCell>
                  <TableCell>{winRate.toFixed(1)}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Profit Factor</TableCell>
                  <TableCell>{profitFactor.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell component="th" scope="row">Total Trades</TableCell>
                  <TableCell>{totalTrades}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>
    </Box>
  );
};

export default BacktestResults;