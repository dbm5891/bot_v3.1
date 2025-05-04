import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

import { AppDispatch, RootState } from '../store';
import { fetchAvailableData, fetchAvailableSymbols, importMarketData, preprocessData } from '../store/slices/dataSlice';
import { addNotification } from '../store/slices/uiSlice';
import DataPreprocessingDialog from '../components/data/DataPreprocessingDialog';
import DataUploadDialog from '../components/data/DataUploadDialog';

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
      id={`data-tabpanel-${index}`}
      aria-labelledby={`data-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const DataManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { availableData, symbols, loading, error } = useSelector((state: RootState) => state.data);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [preprocessingDialogOpen, setPreprocessingDialogOpen] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data when component mounts
    dispatch(fetchAvailableData());
    dispatch(fetchAvailableSymbols());
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleUploadDialogOpen = () => {
    setUploadDialogOpen(true);
  };

  const handleUploadDialogClose = () => {
    setUploadDialogOpen(false);
  };

  const handlePreprocessingDialogOpen = (dataId: string) => {
    setSelectedDataset(dataId);
    setPreprocessingDialogOpen(true);
  };

  const handlePreprocessingDialogClose = () => {
    setPreprocessingDialogOpen(false);
    setSelectedDataset(null);
  };

  const handleRefreshData = () => {
    dispatch(fetchAvailableData());
    dispatch(addNotification({
      type: 'info',
      message: 'Data refreshed successfully'
    }));
  };

  const handleImportData = async (formData: FormData) => {
    try {
      await dispatch(importMarketData(formData)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Market data imported successfully'
      }));
      handleUploadDialogClose();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to import market data'
      }));
    }
  };

  const handlePreprocessData = async (dataId: string, indicators: string[]) => {
    try {
      await dispatch(preprocessData({ dataId, indicators })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Data preprocessing completed successfully'
      }));
      handlePreprocessingDialogClose();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to preprocess data'
      }));
    }
  };

  // Calculate statistics from the data
  const totalDatasets = availableData.length;
  const datasetsWithIndicators = availableData.filter(d => d.hasIndicators).length;
  const uniqueSymbols = [...new Set(availableData.map(d => d.symbol))].length;
  const totalRecords = availableData.reduce((sum, d) => sum + d.recordCount, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Data Management</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefreshData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleUploadDialogOpen}
          >
            Import Data
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Total Datasets</Typography>
              <Typography variant="h3">{totalDatasets}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Datasets with Indicators</Typography>
              <Typography variant="h3">{datasetsWithIndicators}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Unique Symbols</Typography>
              <Typography variant="h3">{uniqueSymbols}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>Total Records</Typography>
              <Typography variant="h3">{totalRecords.toLocaleString()}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for different data views */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="data management tabs">
            <Tab label="Available Data" />
            <Tab label="Data Sources" />
            <Tab label="Preprocessing" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          {loading ? (
            <Box sx={{ width: '100%' }}>
              <LinearProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Symbol</TableCell>
                    <TableCell>Timeframe</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell>Records</TableCell>
                    <TableCell>Source</TableCell>
                    <TableCell>Indicators</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Last Updated</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {availableData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          No data available. Import data to get started.
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleUploadDialogOpen}
                          sx={{ mt: 1 }}
                        >
                          Import Data
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableData.map((data) => (
                      <TableRow key={data.id} hover>
                        <TableCell>{data.symbol}</TableCell>
                        <TableCell>{data.timeframe}</TableCell>
                        <TableCell>
                          {new Date(data.startDate).toLocaleDateString()} - {new Date(data.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{data.recordCount.toLocaleString()}</TableCell>
                        <TableCell>{data.source}</TableCell>
                        <TableCell>
                          {data.hasIndicators ? (
                            <Chip 
                              icon={<CheckCircleIcon />} 
                              label="Available" 
                              color="success" 
                              size="small" 
                            />
                          ) : (
                            <Chip 
                              icon={<WarningIcon />} 
                              label="Not Added" 
                              color="warning" 
                              size="small" 
                            />
                          )}
                        </TableCell>
                        <TableCell>{data.fileSize}</TableCell>
                        <TableCell>{new Date(data.lastUpdated).toLocaleDateString()}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="primary" 
                            onClick={() => handlePreprocessingDialogOpen(data.id)}
                            title="Add Indicators"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            color="secondary" 
                            title="Download Data"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Data Sources</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Connect to external data providers or import your own data files. The system supports multiple data sources:
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>CSV Files</Typography>
                    <Typography variant="body2" paragraph>
                      Upload your own CSV files with OHLCV data. The system expects columns for date, open, high, low, close, and volume.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      startIcon={<CloudUploadIcon />}
                      onClick={handleUploadDialogOpen}
                    >
                      Import CSV
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>TD Ameritrade API</Typography>
                    <Typography variant="body2" paragraph>
                      Connect to TD Ameritrade API to fetch real-time and historical data for stocks, options, and futures.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      disabled
                    >
                      Configure API
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Polygon.io</Typography>
                    <Typography variant="body2" paragraph>
                      Access historical and real-time market data across multiple asset classes with Polygon.io integration.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      disabled
                    >
                      Configure API
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Data Preprocessing</Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body1" paragraph>
              Preprocess your data by adding technical indicators, cleaning missing values, or resampling to different timeframes.
            </Typography>
            
            <Grid container spacing={2}>
              {availableData.map(data => (
                <Grid item xs={12} sm={6} md={4} key={data.id}>
                  <Card variant={data.hasIndicators ? 'outlined' : 'elevation'}>
                    <CardContent>
                      <Typography variant="h6">{data.symbol} ({data.timeframe})</Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {data.recordCount.toLocaleString()} records
                        </Typography>
                        {data.hasIndicators ? (
                          <Chip 
                            label="Indicators Added" 
                            color="success" 
                            size="small" 
                            icon={<CheckCircleIcon />}
                          />
                        ) : (
                          <Chip 
                            label="Raw Data" 
                            color="default" 
                            size="small" 
                          />
                        )}
                      </Box>
                      <Button 
                        variant="text" 
                        fullWidth 
                        onClick={() => handlePreprocessingDialogOpen(data.id)}
                        sx={{ mt: 2 }}
                      >
                        {data.hasIndicators ? 'Edit Indicators' : 'Add Indicators'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Import Data Dialog */}
      <DataUploadDialog
        open={uploadDialogOpen}
        onClose={handleUploadDialogClose}
        onUpload={handleImportData}
      />
      
      {/* Preprocessing Dialog */}
      <DataPreprocessingDialog
        open={preprocessingDialogOpen}
        onClose={handlePreprocessingDialogClose}
        onPreprocess={(indicators) => {
          if (selectedDataset) {
            handlePreprocessData(selectedDataset, indicators);
          }
        }}
        dataId={selectedDataset}
        dataset={availableData.find(d => d.id === selectedDataset)}
      />
    </Box>
  );
};

export default DataManagementPage;