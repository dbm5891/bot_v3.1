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
  Stack,
  useTheme
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

import { RootState, AppDispatch } from '../store';
import { fetchStrategy, updateStrategy, Strategy } from '../store/slices/strategySlice';
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
  const theme = useTheme();
  
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
    <AppLayout>
      <Box sx={{ overflowX: 'hidden' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, overflow: 'hidden' }}>
            <IconButton onClick={handleGoBack} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" noWrap sx={{ textOverflow: 'ellipsis', fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>Strategy: {formData.name}</Typography>
          </Box>
          <Box sx={{ flexShrink: 0, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Button 
              variant="outlined" 
              startIcon={<PlayArrowIcon />} 
              onClick={handleRunBacktest}
              fullWidth
              sx={{ minHeight: 48, minWidth: 48, mb: { xs: 1, sm: 0 } }}
            >
              Run Backtest
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<SaveIcon />} 
              onClick={handleSave}
              disabled={loading}
              fullWidth
              sx={{ minHeight: 48, minWidth: 48 }}
            >
              Save Strategy
            </Button>
          </Box>
        </Box>
        
        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Strategy saved successfully!
          </Alert>
        )}

        <Paper variant="outlined" sx={{ width: '100%', borderRadius: theme.shape.borderRadius, p: { xs: 1, sm: 3 } }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="strategy tabs" variant="scrollable" scrollButtons="auto">
              <Tab label="Basic Info" />
              <Tab label="Parameters" />
              <Tab label="Backtest History" />
              <Tab label="Advanced Settings" />
            </Tabs>
          </Box>
          
          {/* Basic Info Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  label="Strategy Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  sx={{ mb: { xs: 2, sm: 0 } }}
                />
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                <FormControl fullWidth sx={{ mb: { xs: 2, sm: 0 } }}>
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
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
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
                      sx={{ mb: { xs: 1, sm: 0 } }}
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
                  <Grid item xs={12} sm={6} md={4} key={param.name + index}>
                    <Card variant="outlined" sx={{ height: '100%', p: { xs: 1, sm: 2 } }}>
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
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
          
          {/* Backtest History Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Backtest History</Typography>
            {/* Placeholder for backtest history list or table */}
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Backtest history for this strategy will be shown here.
            </Typography>
          </TabPanel>
          
          {/* Advanced Settings Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>Advanced Settings</Typography>
            {/* Placeholder for advanced settings */}
            <Typography color="text.secondary" sx={{ mt: 2 }}>
              Advanced configuration options for the strategy.
            </Typography>
          </TabPanel>
        </Paper>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', mt: 3, gap: 1 }}>
          <Button 
            startIcon={<ArrowBackIcon />}
            onClick={handleGoBack}
            fullWidth
            sx={{ minHeight: 48, minWidth: 48, mb: { xs: 1, sm: 0 } }}
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
            fullWidth
            sx={{ minHeight: 48, minWidth: 48 }}
          >
            Delete Strategy
          </Button>
        </Box>
      </Box>
    </AppLayout>
  );
};

export default StrategyDetailPage;