import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid, Button, Stack, useTheme } from '@mui/material';
import { useRef, useEffect } from 'react';
import { createChart, IChartApi, LineStyle, Time } from 'lightweight-charts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import DownloadIcon from '@mui/icons-material/Download';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AppLayout from '../layouts/AppLayoutNew';

// EquityCurveChart component
const EquityCurveChart = ({ data }: { data: { date: string; value: number }[] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const theme = useTheme();
  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      if (chartRef.current) chartRef.current.remove();
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 220,
        layout: { background: { color: 'transparent' }, textColor: theme.palette.text.primary },
        grid: { vertLines: { color: theme.palette.divider, style: LineStyle.Dotted }, horzLines: { color: theme.palette.divider, style: LineStyle.Dotted } },
        rightPriceScale: { borderColor: theme.palette.divider },
        timeScale: { borderColor: theme.palette.divider, timeVisible: true, secondsVisible: false },
      });
      const lineSeries = chart.addLineSeries({ color: '#1976d2', lineWidth: 2 });
      lineSeries.setData(data.map(d => ({ time: d.date as Time, value: d.value })));
      chart.timeScale().fitContent();
      chartRef.current = chart;
      return () => { chart.remove(); };
    }
  }, [data, theme]);
  return <div ref={chartContainerRef} style={{ width: '100%', maxWidth: '100%', height: 220 }} />;
};

// DrawdownCurveChart component
const DrawdownCurveChart = ({ data }: { data: { date: string; value: number }[] }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const theme = useTheme();
  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      if (chartRef.current) chartRef.current.remove();
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 180,
        layout: { background: { color: 'transparent' }, textColor: theme.palette.text.primary },
        grid: { vertLines: { color: theme.palette.divider, style: LineStyle.Dotted }, horzLines: { color: theme.palette.divider, style: LineStyle.Dotted } },
        rightPriceScale: { borderColor: theme.palette.divider },
        timeScale: { borderColor: theme.palette.divider, timeVisible: true, secondsVisible: false },
      });
      const lineSeries = chart.addLineSeries({ color: '#f44336', lineWidth: 2 });
      lineSeries.setData(data.map(d => ({ time: d.date as Time, value: d.value })));
      chart.timeScale().fitContent();
      chartRef.current = chart;
      return () => { chart.remove(); };
    }
  }, [data, theme]);
  return <div ref={chartContainerRef} style={{ width: '100%', maxWidth: '100%', height: 180 }} />;
};

// Utility: Convert trades to CSV
function tradesToCSV(trades: any[]): string {
  if (!trades || trades.length === 0) return '';
  const headers = [
    'Index', 'Type', 'Entry', 'Exit', 'Entry Price', 'Exit Price', 'Profit', 'Profit %'
  ];
  const rows = trades.map((trade, idx) => [
    idx + 1,
    trade.direction || trade.type || '',
    trade.entryDate || trade.date || '',
    trade.exitDate || '',
    trade.entryPrice ?? trade.price ?? '',
    trade.exitPrice ?? '',
    trade.profit ?? '',
    (trade.profitPercent ?? trade.profitPct ?? 0).toFixed(2) + '%'
  ]);
  return [headers, ...rows].map(r => r.join(',')).join('\n');
}

const BacktestDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { results, loading, error } = useSelector((state: RootState) => state.backtesting);
  const backtest = results.find((b) => b.id === id);
  const themeHook = useTheme();

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!backtest) {
    return <Alert severity="warning">Backtest not found.</Alert>;
  }

  const equityData = Array.isArray((backtest as any).equity)
    ? (backtest as any).equity
    : Array.isArray((backtest as any).equityCurve)
      ? (backtest as any).equityCurve
      : null;

  // Find drawdown data
  const drawdownData = Array.isArray((backtest as any).drawdownCurve)
    ? (backtest as any).drawdownCurve
    : Array.isArray((backtest as any).drawdownSeries)
      ? (backtest as any).drawdownSeries
      : Array.isArray((backtest as any).drawdowns)
        ? (backtest as any).drawdowns
        : null;

  // Find trades array for export
  const tradesArray = Array.isArray(backtest.tradesDetails)
    ? backtest.tradesDetails
    : Array.isArray(backtest.trades)
      ? backtest.trades
      : [];

  return (
    <AppLayout>
      <Box sx={{ maxWidth: { xs: '100%', md: 900 }, mx: 'auto', mt: 4, overflowX: 'hidden', p: { xs: 1, sm: 2 } }}>
        {/* Add a compare button */}
        <Box sx={{ display: 'flex', justifyContent: { xs: 'center', sm: 'flex-end' }, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<CompareArrowsIcon />}
            onClick={() => navigate('/backtesting/compare')}
            fullWidth
            sx={{ maxWidth: { xs: '100%', sm: 320 }, minHeight: 48, minWidth: 48 }}
          >
            Compare with other backtests
          </Button>
        </Box>

        {/* Performance Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                <TrendingUpIcon color={((backtest.totalReturn ?? backtest.roi ?? 0) >= 0) ? 'success' : 'error'} sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Total Return</Typography>
                <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{((backtest.totalReturn ?? backtest.roi ?? 0) * 100).toFixed(2)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                <TrendingDownIcon color="error" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Max Drawdown</Typography>
                <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{(backtest.maxDrawdown ?? backtest.drawdown ?? 0).toFixed(2)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                <ShowChartIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Sharpe Ratio</Typography>
                <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{(backtest.sharpeRatio ?? 0).toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                <SwapVertIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Win Rate</Typography>
                <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{(backtest.winRate ?? 0).toFixed(2)}%</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                <AssessmentIcon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                <Typography variant="body2" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Trades</Typography>
                <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>{backtest.trades ?? backtest.tradesCount ?? 0}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
              Backtest Detail: {backtest.strategyName} ({backtest.symbol})
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {backtest.startDate} - {backtest.endDate} | {backtest.timeframe}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Final Balance: ${backtest.finalBalance?.toLocaleString() ?? 'N/A'}<br />
              Total Return: {(backtest.totalReturn ?? backtest.roi ?? 0) * 100}%<br />
              Max Drawdown: {backtest.maxDrawdown ?? backtest.drawdown ?? 'N/A'}%<br />
              Sharpe Ratio: {backtest.sharpeRatio ?? 'N/A'}<br />
              Win Rate: {backtest.winRate ?? 'N/A'}%<br />
              Trades: {backtest.trades ?? backtest.tradesCount ?? 'N/A'}
            </Typography>
            {/* Equity Curve Chart or Placeholder */}
            {Array.isArray(equityData) && equityData.length > 0 ? (
              <Paper variant="outlined" sx={{ mt: 4, mb: 2, p: { xs: 1, sm: 2 }, borderRadius: themeHook.shape.borderRadius }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Equity Curve
                </Typography>
                <EquityCurveChart data={equityData} />
              </Paper>
            ) : (
              <Paper variant="outlined" sx={{ mt: 4, mb: 2, p: { xs: 1, sm: 2 }, textAlign: 'center', bgcolor: 'grey.100', borderRadius: themeHook.shape.borderRadius }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  [Equity Curve Chart Placeholder]
                </Typography>
              </Paper>
            )}
            {/* Drawdown Curve Chart or Placeholder */}
            {Array.isArray(drawdownData) && drawdownData.length > 0 ? (
              <Paper variant="outlined" sx={{ mt: 2, mb: 2, p: { xs: 1, sm: 2 }, borderRadius: themeHook.shape.borderRadius }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  Drawdown Curve
                </Typography>
                <DrawdownCurveChart data={drawdownData} />
              </Paper>
            ) : (
              <Paper variant="outlined" sx={{ mt: 2, mb: 2, p: { xs: 1, sm: 2 }, textAlign: 'center', bgcolor: 'grey.100', borderRadius: themeHook.shape.borderRadius }}>
                <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                  [Drawdown Curve Chart Placeholder]
                </Typography>
              </Paper>
            )}
            {/* Export Buttons above trades table */}
            {tradesArray.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: { xs: 'center', sm: 'flex-end' }, alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const csv = tradesToCSV(tradesArray);
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backtest_trades_${backtest.id}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  fullWidth
                  sx={{ minHeight: 48, minWidth: 48 }}
                >
                  Export Trades CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {
                    const json = JSON.stringify(backtest, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `backtest_result_${backtest.id}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  fullWidth
                  sx={{ minHeight: 48, minWidth: 48 }}
                >
                  Export Full Result (JSON)
                </Button>
              </Box>
            )}
            {/* Trades Table */}
            {(Array.isArray(backtest.tradesDetails) || Array.isArray(backtest.trades)) && (
              <Box sx={{ width: '100%', overflowX: 'auto' }}>
                <Typography variant="h6" sx={{ mt: 4, mb: 2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                  Trades
                </Typography>
                <TableContainer component={(props) => <Paper variant="outlined" {...props} />}>
                  <Table stickyHeader aria-label="trades table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>#</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Type</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Entry</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Exit</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Entry Price</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Exit Price</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Profit</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>Profit %</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(Array.isArray(backtest.tradesDetails)
                        ? backtest.tradesDetails
                        : Array.isArray(backtest.trades)
                          ? backtest.trades
                          : []
                      ).map((trade: any, idx: number) => (
                        <TableRow key={trade.id || idx}>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{trade.direction || trade.type}</TableCell>
                          <TableCell>{trade.entryDate || trade.date}</TableCell>
                          <TableCell>{trade.exitDate || '-'}</TableCell>
                          <TableCell>{trade.entryPrice ?? trade.price ?? '-'}</TableCell>
                          <TableCell>{trade.exitPrice ?? '-'}</TableCell>
                          <TableCell>{trade.profit ?? '-'}</TableCell>
                          <TableCell>{(trade.profitPercent ?? trade.profitPct ?? 0).toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </AppLayout>
  );
};

export default BacktestDetailPage; 