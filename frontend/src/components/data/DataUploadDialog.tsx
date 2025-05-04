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
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Market Data</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
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
            startIcon={<CloudUploadIcon />}
            sx={{ mb: 2 }}
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
          <Paper variant="outlined" sx={{ p: 2, mb: 3, maxHeight: 200, overflow: 'auto' }}>
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
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as string)}
                label="Timeframe"
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
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!file || !symbol || !timeframe || uploading}
        >
          {uploading ? 'Uploading...' : 'Import Data'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Grid = ({ container, item, children, xs, sm, md, spacing }: any) => {
  if (container) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mt: -spacing, ml: -spacing }}>
        {React.Children.map(children, child => React.cloneElement(child, {
          style: { ...child.props.style, marginTop: spacing * 8, marginLeft: spacing * 8 }
        }))}
      </Box>
    );
  }
  
  if (item) {
    let width = '100%';
    
    if (sm) {
      width = `${(sm / 12) * 100}%`;
    }
    
    if (md) {
      width = `${(md / 12) * 100}%`;
    }
    
    return (
      <Box sx={{ 
        width,
        flexShrink: 0,
        boxSizing: 'border-box',
        '@media (max-width: 600px)': {
          width: `${(xs / 12) * 100}%`,
        }
      }}>
        {children}
      </Box>
    );
  }
  
  return <Box>{children}</Box>;
};

export default DataUploadDialog;