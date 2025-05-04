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
  Divider
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  Assessment as AssessmentIcon,
  LocalAtm as LocalAtmIcon,
  SwapVert as SwapVertIcon
} from '@mui/icons-material';

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

interface BacktestResult {
  totalReturns: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: number;
  winRate: number;
  profitFactor: number;
  averageTrade: number;
  equity: {
    date: string;
    value: number;
  }[];
  trades: {
    id: number;
    date: string;
    type: 'buy' | 'sell';
    price: number;
    size: number;
    profit: number;
    profitPct: number;
  }[];
}

interface BacktestResultsProps {
  results: BacktestResult;
  config: BacktestConfig;
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Backtest Results: {config.strategy} on {config.symbol}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {config.timeframe} | {config.startDate} to {config.endDate}
      </Typography>

      {/* Performance Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalAtmIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Return</Typography>
              <Typography variant="h4">{results.totalReturns.toFixed(2)}%</Typography>
              <Typography variant="body2" color="text.secondary">
                Initial: ${config.initialCapital.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SwapVertIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Win Rate</Typography>
              <Typography variant="h4">{results.winRate.toFixed(1)}%</Typography>
              <Typography variant="body2" color="text.secondary">
                {results.trades} total trades
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ShowChartIcon sx={{ fontSize: 40, mb: 1, color: 'primary.main' }} />
              <Typography variant="h6" gutterBottom>Profit Factor</Typography>
              <Typography variant="h4">{results.profitFactor.toFixed(2)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Avg trade: {results.averageTrade.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDownIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>Max Drawdown</Typography>
              <Typography variant="h4">{results.maxDrawdown.toFixed(2)}%</Typography>
              <Typography variant="body2" color="text.secondary">
                Sharpe: {results.sharpeRatio.toFixed(2)}
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
        <Paper sx={{ p: 2, height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="subtitle1" color="text.secondary">
            Equity curve chart would be displayed here
          </Typography>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Paper>
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
                {results.trades.map((trade) => (
                  <TableRow key={trade.id} hover sx={{ 
                    bgcolor: trade.profit > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'
                  }}>
                    <TableCell>{trade.id}</TableCell>
                    <TableCell>{trade.type}</TableCell>
                    <TableCell>{trade.date}</TableCell>
                    <TableCell>${trade.price.toFixed(2)}</TableCell>
                    <TableCell>{trade.size}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {trade.profit > 0 ? 
                          <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 0.5 }} /> : 
                          <TrendingDownIcon fontSize="small" color="error" sx={{ mr: 0.5 }} />
                        }
                        ${Math.abs(trade.profit).toFixed(2)}
                      </Box>
                    </TableCell>
                    <TableCell align="right">{trade.profitPct.toFixed(2)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
              <Divider sx={{ mb: 2 }} />
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Total Return</TableCell>
                    <TableCell align="right">{results.totalReturns.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sharpe Ratio</TableCell>
                    <TableCell align="right">{results.sharpeRatio.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Maximum Drawdown</TableCell>
                    <TableCell align="right">{results.maxDrawdown.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Win Rate</TableCell>
                    <TableCell align="right">{results.winRate.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Profit Factor</TableCell>
                    <TableCell align="right">{results.profitFactor.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Strategy Parameters</Typography>
              <Divider sx={{ mb: 2 }} />
              <Table size="small">
                <TableBody>
                  {Object.entries(config.parameters).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>{key}</TableCell>
                      <TableCell align="right">{value}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell>Initial Capital</TableCell>
                    <TableCell align="right">${config.initialCapital.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Position Size</TableCell>
                    <TableCell align="right">{config.positionSize}%</TableCell>
                  </TableRow>
                  {config.stopLoss !== undefined && (
                    <TableRow>
                      <TableCell>Stop Loss</TableCell>
                      <TableCell align="right">{config.stopLoss}%</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default BacktestResults;