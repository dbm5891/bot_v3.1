import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button, 
  Grid, 
  CircularProgress,
  Alert,
  Paper
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/index';
import DataTable from '../components/data/DataTable';
import DataUploadDialog from '../components/data/DataUploadDialog';
import DataPreprocessingDialog from '../components/data/DataPreprocessingDialog';
import { fetchAvailableData } from '../store/slices/dataSlice';

// Interface for market data
interface MarketData {
  id: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  recordCount: number;
  hasIndicators: boolean;
  appliedIndicators?: string[];
  lastUpdated: string;
}

// Mock data removed; all data is now handled via Redux.

const MarketDataPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get data from Redux store
  const { availableData, loading: dataLoading, error: dataError } = useSelector((state: RootState) => state.data);
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [preprocessingDialogOpen, setPreprocessingDialogOpen] = useState(false);
  const [selectedDataId, setSelectedDataId] = useState<string | null>(null);
  
  // Load market data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Dispatch the actual Redux action to fetch data
        await dispatch(fetchAvailableData());
        setError(null);
      } catch (err) {
        setError('Failed to fetch market data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);
  
  // Handle data actions
  const handleRefresh = () => {
    dispatch(fetchAvailableData());
  };
  
  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
  };
  
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };
  
  const handleUploadData = async (formData: FormData) => {
    try {
      // In a real implementation, dispatch an action to upload the data
      console.log('Uploading data...', formData);
      setUploadDialogOpen(false);
      // Refresh the data after upload
      dispatch(fetchAvailableData());
    } catch (err) {
      console.error(err);
      setError('Failed to upload market data');
    }
  };
  
  const handleOpenPreprocessingDialog = (dataId: string) => {
    setSelectedDataId(dataId);
    setPreprocessingDialogOpen(true);
  };
  
  const handleClosePreprocessingDialog = () => {
    setPreprocessingDialogOpen(false);
    setSelectedDataId(null);
  };
  
  const handlePreprocessData = async (indicators: string[]) => {
    if (!selectedDataId) return;
    
    try {
      // In a real implementation, dispatch an action to preprocess the data
      console.log('Preprocessing data...', selectedDataId, indicators);
      setPreprocessingDialogOpen(false);
      // Refresh the data after preprocessing
      dispatch(fetchAvailableData());
    } catch (err) {
      console.error(err);
      setError('Failed to preprocess data');
    }
  };
  
  const handleDeleteData = async (dataId: string) => {
    if (window.confirm('Are you sure you want to delete this data?')) {
      try {
        // In a real implementation, dispatch an action to delete the data
        // Perform deletion logic here
        // Refresh the data after deletion
        dispatch(fetchAvailableData());
      } catch (err) {
        console.error(err);
        setError('Failed to delete market data');
      }
    }
  };

  // Find the selected dataset for preprocessing
  const selectedDataset = availableData.find(d => d.id === selectedDataId);

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Market Data Management
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={handleOpenUploadDialog}
            >
              Import Data
            </Button>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={dataLoading || isLoading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
        
        {(error || dataError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || dataError}
          </Alert>
        )}
        
        <Paper elevation={2} sx={{ mb: 4, p: 0 }}>
          {(dataLoading || isLoading) ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataTable 
              data={availableData} 
              onPreprocess={handleOpenPreprocessingDialog}
              onDelete={handleDeleteData}
            />
          )}
        </Paper>
      </Box>
      
      {/* Data Upload Dialog */}
      <DataUploadDialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        onUpload={handleUploadData}
      />
      
      {/* Data Preprocessing Dialog */}
      <DataPreprocessingDialog
        open={preprocessingDialogOpen}
        onClose={handleClosePreprocessingDialog}
        onPreprocess={handlePreprocessData}
        dataId={selectedDataId}
        dataset={selectedDataset}
      />
    </Container>
  );
};

export default MarketDataPage;