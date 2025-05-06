import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Tabs, 
  Tab, 
  TextField, 
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  Stack
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import { RootState, AppDispatch } from '../store';
import { fetchStrategy, updateStrategy, Strategy } from '../store/slices/strategySlice';

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
      id={`strategy-tabpanel-${index}`}
      aria-labelledby={`strategy-tab-${index}`}
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

const StrategyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Get the strategy from Redux store
  const { currentStrategy, loading, error } = useSelector((state: RootState) => state.strategy);
  
  // Local state for form data
  const [formData, setFormData] = useState<Strategy | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Fetch strategy when component mounts or ID changes
  useEffect(() => {
    if (id) {
      dispatch(fetchStrategy(id));
    }
  }, [dispatch, id]);
  
  // Set form data when strategy is loaded
  useEffect(() => {
    if (currentStrategy) {
      setFormData({ ...currentStrategy });
    }
  }, [currentStrategy]);
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle form field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  // Handle parameter value change
  const handleParameterChange = (index: number, value: any) => {
    if (!formData) return;
    
    const updatedParams = [...formData.parameters];
    updatedParams[index] = { ...updatedParams[index], value };
    
    setFormData({ ...formData, parameters: updatedParams });
  };
  
  // Handle save
  const handleSave = async () => {
    if (!formData || !id) return;
    
    try {
      await dispatch(updateStrategy({ id, data: formData })).unwrap();
      setSaveSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to update strategy:", err);
    }
  };
  
  // Handle run backtest
  const handleRunBacktest = () => {
    navigate(`/backtesting?strategyId=${id}`);
  };
  
  // Handle go back
  const handleGoBack = () => {
    navigate('/strategies');
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          Back to Strategies
        </Button>
      </Box>
    );
  }
  
  if (!formData) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Strategy not found
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          Back to Strategies
        </Button>
      </Box>
    );
  }
  
  // Render parameter input based on type
  interface Parameter {
    name: string;
    type: 'number' | 'boolean' | 'select' | 'string';
    value: any;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
  }

  const renderParameterInput = (param: Parameter, index: number) => {
    switch (param.type) {
      case 'number':
        return (
          <Box sx={{ width: '100%' }}>
            <Typography gutterBottom>
              {param.value}
            </Typography>
            <Slider
              value={param.value}
              min={param.min ?? 1}
              max={param.max ?? 100}
              step={param.step || 1}
              onChange={(_, newValue) => handleParameterChange(index, newValue)}
              valueLabelDisplay="auto"
            />
          </Box>
        );
        
      case 'boolean':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={param.value}
                onChange={(e) => handleParameterChange(index, e.target.checked)}
              />
            }
            label={param.name}
          />
        );
        
      case 'select':
        return (
          <FormControl fullWidth>
            <InputLabel>{param.name}</InputLabel>
            <Select
              value={param.value}
              onChange={(e) => handleParameterChange(index, e.target.value)}
              label={param.name}
            >
              {param.options?.map((option: string) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        );
        
      default:
        return (
          <TextField
            fullWidth
            label={param.name}
            value={param.value}
            onChange={(e) => handleParameterChange(index, e.target.value)}
          />
        );
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Strategy Details</Typography>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleRunBacktest}
            sx={{ mr: 1 }}
          >
            Run Backtest
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      
      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Strategy updated successfully!
        </Alert>
      )}
      
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="strategy tabs">
            <Tab label="Basic Info" />
            <Tab label="Parameters" />
            <Tab label="Performance" />
          </Tabs>
        </Box>
        
        {/* Basic Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Strategy Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Strategy Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  label="Strategy Type"
                >
                  <MenuItem value="custom">Custom</MenuItem>
                  <MenuItem value="template">Template</MenuItem>
                  <MenuItem value="imported">Imported</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Indicators
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.indicators.map((indicator) => (
                  <Chip 
                    key={indicator} 
                    label={indicator} 
                    onDelete={() => {
                      const updatedIndicators = formData.indicators.filter((ind) => ind !== indicator);
                      setFormData({ ...formData, indicators: updatedIndicators });
                    }}
                  />
                ))}
                {/* Option to add more indicators could be implemented here */}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Parameters Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {formData.parameters.length === 0 ? (
              <Grid item xs={12}>
                <Alert severity="info">
                  This strategy has no configurable parameters.
                </Alert>
              </Grid>
            ) : (
              formData.parameters.map((param, index) => (
                <Grid item xs={12} md={6} lg={4} key={param.name}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {param.name}
                      </Typography>
                      {renderParameterInput(param, index)}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </TabPanel>
        
        {/* Performance Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Alert severity="info">
                Run a backtest to see performance metrics for this strategy.
              </Alert>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleRunBacktest}
                >
                  Run Backtest
                </Button>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          Back to Strategies
        </Button>
        <Button 
          color="error" 
          startIcon={<DeleteIcon />}
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this strategy?')) {
              // Implement deletion logic here
              console.log('Strategy deleted');
              navigate('/strategies');
            }
          }}
        >
          Delete Strategy
        </Button>
      </Box>
    </Box>
  );
};

export default StrategyDetailPage;