import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  Button,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import { 
  Compare as CompareIcon,
  Add as AddIcon,
  DeleteSweep as DeleteSweepIcon,
  GetApp as DownloadIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import BacktestComparison from '../components/backtesting/BacktestComparison';
import { fetchBacktestHistory, BacktestResult } from '../store/slices/backtestingSlice';
import AppLayout from '../layouts/AppLayoutNew';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`backtest-tabpanel-${index}`}
      aria-labelledby={`backtest-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `backtest-tab-${index}`,
    'aria-controls': `backtest-tabpanel-${index}`,
  };
}

const BacktestComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [selectedBacktests, setSelectedBacktests] = useState<string[]>([]);
  
  const { results, loading, error } = useSelector((state: RootState) => state.backtesting);

  useEffect(() => {
    dispatch(fetchBacktestHistory());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSelectBacktest = (id: string) => {
    if (selectedBacktests.includes(id)) {
      setSelectedBacktests(selectedBacktests.filter(item => item !== id));
    } else {
      // Limit to 5 backtests for comparison to keep the UI clean
      if (selectedBacktests.length < 5) {
        setSelectedBacktests([...selectedBacktests, id]);
      }
    }
  };

  const handleRemoveBacktest = (id: string) => {
    setSelectedBacktests(selectedBacktests.filter(item => item !== id));
  };

  const handleClearAll = () => {
    setSelectedBacktests([]);
  };

  const handleExportData = (format: 'csv' | 'json') => {
    if (!results) return;
    
    const selectedResults = results.filter(result => selectedBacktests.includes(result.id));
    
    if (selectedResults.length === 0) return;
    
    let content = '';
    let filename = '';
    
    if (format === 'csv') {
      // Create CSV content
      const headers = 'Strategy,Symbol,Timeframe,Start Date,End Date,Total Returns,Sharpe Ratio,Max Drawdown,Win Rate,Profit Factor,Trades Count,Date\n';
      const rows = selectedResults.map(result => 
        `${result.strategyName},${result.symbol},${result.timeframe},${result.startDate},${result.endDate},${result.totalReturn || 0},${result.sharpeRatio},${result.maxDrawdown || 0},${result.winRate},${result.profitFactor || 0},${result.trades},${result.createdAt || ''}`
      ).join('\n');
      
      content = headers + rows;
      filename = `backtest-comparison-${new Date().toISOString().slice(0, 10)}.csv`;
    } else {
      // Create JSON content
      content = JSON.stringify(selectedResults, null, 2);
      filename = `backtest-comparison-${new Date().toISOString().slice(0, 10)}.json`;
    }
    
    // Create download link
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Map the results to the format expected by the BacktestComparison component
  const mapToComparisonData = (backtests: BacktestResult[]) => {
    return backtests.map(backtest => ({
      id: backtest.id,
      strategyName: backtest.strategyName,
      symbol: backtest.symbol,
      timeframe: backtest.timeframe,
      startDate: backtest.startDate,
      endDate: backtest.endDate,
      totalReturns: backtest.totalReturn || 0,
      sharpeRatio: backtest.sharpeRatio,
      maxDrawdown: backtest.maxDrawdown || 0,
      winRate: backtest.winRate,
      profitFactor: backtest.profitFactor || 0,
      tradesCount: backtest.trades,
      date: backtest.createdAt || new Date().toISOString()
    }));
  };

  // Filter results for the selected backtests
  const comparisonData = results 
    ? mapToComparisonData(results.filter(result => selectedBacktests.includes(result.id)))
    : [];

  // All available backtests to select from
  const availableBacktests = results || [];
  
  return (
    <AppLayout>
      <Container maxWidth="lg">
        <Paper variant="outlined" sx={{ p: 3, mt: 3, borderRadius: theme.shape.borderRadius }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CompareIcon color="primary" />
              <Typography variant="h5" component="h1">
                Backtest Comparison
              </Typography>
            </Box>
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/backtesting')}
                size="small"
                sx={{ mr: 1 }}
              >
                New Backtest
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/backtesting')}
                size="small"
              >
                Backtest History
              </Button>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />

          {/* Loading indicator */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Main content when loaded */}
          {!loading && !error && (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tabValue} 
                  onChange={handleTabChange} 
                  aria-label="backtest comparison tabs"
                >
                  <Tab label="Compare Backtests" {...a11yProps(0)} />
                  <Tab label="Select Backtests" {...a11yProps(1)} />
                </Tabs>
              </Box>

              {/* Tab 1: Comparison view */}
              <TabPanel value={tabValue} index={0}>
                {selectedBacktests.length === 0 ? (
                  <Alert severity="info">
                    Please select backtests to compare from the "Select Backtests" tab.
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">
                        Comparing {selectedBacktests.length} backtests
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Clear all selected backtests">
                          <Button 
                            size="small" 
                            startIcon={<DeleteSweepIcon />}
                            onClick={handleClearAll}
                            variant="outlined"
                            color="error"
                          >
                            Clear All
                          </Button>
                        </Tooltip>
                        <Tooltip title="Export comparison data as CSV">
                          <Button 
                            size="small" 
                            startIcon={<DownloadIcon />}
                            onClick={() => handleExportData('csv')}
                            variant="outlined"
                          >
                            Export CSV
                          </Button>
                        </Tooltip>
                      </Stack>
                    </Box>

                    <BacktestComparison 
                      backtests={comparisonData}
                      onRemoveBacktest={handleRemoveBacktest}
                      onViewDetails={(id) => navigate(`/backtesting/${id}`)}
                      onExportData={handleExportData}
                    />
                  </>
                )}
              </TabPanel>

              {/* Tab 2: Selection view */}
              <TabPanel value={tabValue} index={1}>
                {availableBacktests.length === 0 ? (
                  <Alert severity="info">
                    No backtests found. Run some backtests first to compare them.
                  </Alert>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" gutterBottom>
                        Select up to 5 backtests to compare (selected: {selectedBacktests.length}/5)
                      </Typography>
                      {selectedBacktests.length > 0 && (
                        <Button 
                          variant="contained" 
                          color="primary"
                          onClick={() => setTabValue(0)}
                          sx={{ mt: 1 }}
                        >
                          Compare Selected
                        </Button>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      {availableBacktests.map((backtest) => {
                        const isSelected = selectedBacktests.includes(backtest.id);
                        return (
                          <Paper 
                            key={backtest.id}
                            variant="outlined"
                            sx={{ 
                              p: 2, 
                              width: 300,
                              cursor: 'pointer',
                              borderRadius: theme.shape.borderRadius,
                              border: isSelected 
                                ? `2px solid ${theme.palette.primary.main}` 
                                : `1px solid ${theme.palette.divider}`,
                              bgcolor: isSelected 
                                ? alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity || 0.12)
                                : theme.palette.background.paper,
                              boxShadow: isSelected ? theme.shadows[2] : 'none',
                            }}
                            onClick={() => handleSelectBacktest(backtest.id)}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="subtitle1" noWrap>{backtest.strategyName}</Typography>
                              {isSelected && (
                                <Chip size="small" label="Selected" color="primary" />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {backtest.symbol} • {backtest.timeframe}
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                              <Typography variant="body2">
                                Returns: <span style={{ 
                                  color: (backtest.totalReturn || 0) >= 0 
                                          ? theme.palette.success.main
                                          : theme.palette.error.main,
                                  fontWeight: 'bold'
                                }}>
                                  {(backtest.totalReturn || 0).toFixed(2)}%
                                </span>
                              </Typography>
                              <Typography variant="body2">
                                Date: {new Date(backtest.createdAt || '').toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Paper>
                        );
                      })}
                    </Box>
                  </>
                )}
              </TabPanel>
            </>
          )}
        </Paper>
      </Container>
    </AppLayout>
  );
};

export default BacktestComparisonPage; 