import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Paper,
  Grid,
  useTheme
} from '@mui/material';
import AppIcon from '../icons/AppIcon';

interface DataUploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (formData: FormData) => void;
}

const DataUploadDialog: React.FC<DataUploadDialogProps> = ({ open, onClose, onUpload }) => {
  const [file, setFile] = useState<File | null>(null);
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [source, setSource] = useState('csv');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string[]>([]);
  const theme = useTheme();

  const timeframeOptions = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      
      // Try to extract symbol from filename (optional)
      const fileName = selectedFile.name.toLowerCase();
      const symbolMatch = fileName.match(/^([a-z]+)_/);
      if (symbolMatch && !symbol) {
        setSymbol(symbolMatch[1].toUpperCase());
      }
      
      // Try to extract timeframe from filename (optional)
      const timeframeMatch = fileName.match(/_(1m|5m|15m|30m|1h|4h|1d|1w)_/);
      if (timeframeMatch && !timeframe) {
        setTimeframe(timeframeMatch[1]);
      }
      
      // Preview file contents
      previewFile(selectedFile);
    }
  };
  
  const previewFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && typeof e.target.result === 'string') {
        // Get first few lines of the file
        const lines = e.target.result.split('\n').slice(0, 5);
        setFilePreview(lines);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!file || !symbol || !timeframe) {
      setError('Please fill in all required fields');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('symbol', symbol);
      formData.append('timeframe', timeframe);
      formData.append('source', source);
      
      await onUpload(formData);
      handleReset();
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setSymbol('');
    setTimeframe('');
    setSource('csv');
    setError(null);
    setFilePreview([]);
  };
  
  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: theme.shape.borderRadius } }}>
      <DialogTitle sx={{ pb: 1 }}>
        Import Market Data
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: theme.shape.borderRadius }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Upload a CSV file with market data
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The CSV file should contain columns for date, open, high, low, close, and volume.
            Date format should be in YYYY-MM-DD format or YYYY-MM-DD HH:MM:SS for intraday data.
          </Typography>
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<AppIcon name="UploadCloud" />}
            sx={{ mb: 2, borderRadius: theme.shape.borderRadius }}
            fullWidth
          >
            Select File
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleFileChange}
            />
          </Button>
          
          {file && (
            <Typography variant="body2">
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          )}
        </Box>
        
        {filePreview.length > 0 && (
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 3, 
              maxHeight: 200, 
              overflow: 'auto', 
              borderRadius: theme.shape.borderRadius
            }}
          >
            <Typography variant="subtitle2" gutterBottom>File Preview:</Typography>
            {filePreview.map((line, i) => (
              <Box key={i} sx={{ 
                fontFamily: 'monospace', 
                fontSize: '0.8rem',
                whiteSpace: 'pre',
                overflowX: 'auto'
              }}>
                {line}
              </Box>
            ))}
          </Paper>
        )}
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              fullWidth
              required
              helperText="E.g. AAPL, MSFT, SPY"
              sx={{ borderRadius: theme.shape.borderRadius }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as string)}
                label="Timeframe"
                sx={{ borderRadius: theme.shape.borderRadius }}
              >
                {timeframeOptions.map((tf) => (
                  <MenuItem key={tf} value={tf}>{tf}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={source}
                onChange={(e) => setSource(e.target.value as string)}
                label="Source"
                sx={{ borderRadius: theme.shape.borderRadius }}
              >
                <MenuItem value="csv">CSV Import</MenuItem>
                <MenuItem value="yahoo">Yahoo Finance</MenuItem>
                <MenuItem value="tdameritrade">TD Ameritrade</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        {uploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={uploading} color="inherit" variant="text">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          color="primary"
          disabled={!file || !symbol || !timeframe || uploading}
        >
          {uploading ? 'Uploading...' : 'Import Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataUploadDialog;