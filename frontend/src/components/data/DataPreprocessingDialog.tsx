import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  LinearProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
  Tooltip,
  IconButton,
  useTheme,
} from '@mui/material';
import AppIcon from '../icons/AppIcon';

interface TechnicalIndicator {
  name: string;
  category: string;
  description: string;
  parameters?: {
    name: string;
    defaultValue: number;
    min?: number;
    max?: number;
  }[];
}

interface DatasetInfo {
  id: string;
  symbol: string;
  timeframe: string;
  recordCount: number;
  hasIndicators: boolean;
  appliedIndicators?: string[];
}

interface DataPreprocessingDialogProps {
  open: boolean;
  onClose: () => void;
  onPreprocess: (indicators: string[]) => void;
  dataId: string | null;
  dataset: DatasetInfo | undefined;
}

const DataPreprocessingDialog: React.FC<DataPreprocessingDialogProps> = ({
  open,
  onClose,
  onPreprocess,
  dataId,
  dataset,
}) => {
  const theme = useTheme();
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [indicatorSettings, setIndicatorSettings] = useState<Record<string, Record<string, number>>>({});
  const [openSettings, setOpenSettings] = useState<string | null>(null);

  // Indicator categories and their indicators
  const indicatorCategories = {
    trend: [
      { name: 'SMA', description: 'Simple Moving Average', parameters: [{ name: 'length', defaultValue: 20, min: 2, max: 200 }] },
      { name: 'EMA', description: 'Exponential Moving Average', parameters: [{ name: 'length', defaultValue: 20, min: 2, max: 200 }] },
      { name: 'MACD', description: 'Moving Average Convergence Divergence', parameters: [
        { name: 'fast', defaultValue: 12, min: 2, max: 50 },
        { name: 'slow', defaultValue: 26, min: 2, max: 50 },
        { name: 'signal', defaultValue: 9, min: 2, max: 50 }
      ]},
      { name: 'SuperTrend', description: 'Trend following indicator that uses ATR', parameters: [
        { name: 'period', defaultValue: 10, min: 1, max: 50 },
        { name: 'multiplier', defaultValue: 3, min: 1, max: 10 }
      ]},
    ],
    momentum: [
      { name: 'RSI', description: 'Relative Strength Index', parameters: [{ name: 'length', defaultValue: 14, min: 2, max: 50 }] },
      { name: 'Stochastic', description: 'Stochastic Oscillator', parameters: [
        { name: 'k', defaultValue: 14, min: 1, max: 50 },
        { name: 'slowing', defaultValue: 3, min: 1, max: 20 },
        { name: 'd', defaultValue: 3, min: 1, max: 20 }
      ]},
      { name: 'CCI', description: 'Commodity Channel Index', parameters: [{ name: 'length', defaultValue: 20, min: 5, max: 100 }] },
      { name: 'MFI', description: 'Money Flow Index', parameters: [{ name: 'length', defaultValue: 14, min: 2, max: 50 }] },
    ],
    volatility: [
      { name: 'Bollinger', description: 'Bollinger Bands', parameters: [
        { name: 'length', defaultValue: 20, min: 2, max: 100 },
        { name: 'stdev', defaultValue: 2, min: 0.5, max: 5 }
      ]},
      { name: 'ATR', description: 'Average True Range', parameters: [{ name: 'length', defaultValue: 14, min: 1, max: 50 }] },
      { name: 'Keltner', description: 'Keltner Channels', parameters: [
        { name: 'length', defaultValue: 20, min: 5, max: 100 },
        { name: 'multiplier', defaultValue: 2, min: 0.5, max: 5 }
      ]},
    ],
    volume: [
      { name: 'OBV', description: 'On-Balance Volume', parameters: [] },
      { name: 'ADL', description: 'Accumulation/Distribution Line', parameters: [] },
      { name: 'VWAP', description: 'Volume-Weighted Average Price', parameters: [] },
    ],
    custom: [
      { name: 'TrueRange', description: 'True Range calculation', parameters: [] },
      { name: 'DrawdownPct', description: 'Percentage drawdown from high', parameters: [] },
    ],
  };

  // Flatten indicators for easier lookup
  const allIndicators: TechnicalIndicator[] = Object.keys(indicatorCategories).flatMap(category => 
    indicatorCategories[category as keyof typeof indicatorCategories].map(indicator => ({
      ...indicator,
      category
    }))
  );

  useEffect(() => {
    if (dataset && dataset.appliedIndicators) {
      setSelectedIndicators(dataset.appliedIndicators);
      
      // Initialize settings for applied indicators
      const settings: Record<string, Record<string, number>> = {};
      
      dataset.appliedIndicators.forEach(indName => {
        const indicator = allIndicators.find(i => i.name === indName);
        if (indicator && indicator.parameters) {
          settings[indName] = {};
          indicator.parameters.forEach(param => {
            settings[indName][param.name] = param.defaultValue;
          });
        }
      });
      
      setIndicatorSettings(settings);
    } else {
      setSelectedIndicators([]);
      setIndicatorSettings({});
    }
  }, [dataset]);

  const handleToggleIndicator = (indicator: string) => {
    setSelectedIndicators(prev => {
      if (prev.includes(indicator)) {
        // Remove indicator
        const filtered = prev.filter(i => i !== indicator);
        
        // Remove settings
        const newSettings = { ...indicatorSettings };
        delete newSettings[indicator];
        setIndicatorSettings(newSettings);
        
        return filtered;
      } else {
        // Add indicator
        const newSelection = [...prev, indicator];
        
        // Initialize settings with default values
        const indicatorObj = allIndicators.find(i => i.name === indicator);
        if (indicatorObj && indicatorObj.parameters) {
          const newSettings = { ...indicatorSettings };
          newSettings[indicator] = {};
          
          indicatorObj.parameters.forEach(param => {
            newSettings[indicator][param.name] = param.defaultValue;
          });
          
          setIndicatorSettings(newSettings);
        }
        
        return newSelection;
      }
    });
  };

  const handleParameterChange = (indicator: string, param: string, value: number) => {
    setIndicatorSettings(prev => ({
      ...prev,
      [indicator]: {
        ...prev[indicator],
        [param]: value
      }
    }));
  };

  const handleOpenSettings = (indicator: string) => {
    setOpenSettings(indicator);
  };

  const handleCloseSettings = () => {
    setOpenSettings(null);
  };

  const handleSubmit = async () => {
    if (selectedIndicators.length === 0) {
      setError('Please select at least one indicator');
      return;
    }
    
    setProcessing(true);
    setError(null);
    
    try {
      // Add indicator settings to the indicator names
      const indicatorsWithParams = selectedIndicators.map(indName => {
        const settings = indicatorSettings[indName];
        if (settings && Object.keys(settings).length > 0) {
          const paramString = Object.entries(settings)
            .map(([key, value]) => `${key}=${value}`)
            .join(',');
          return `${indName}(${paramString})`;
        }
        return indName;
      });
      
      await onPreprocess(indicatorsWithParams);
    } catch (err) {
      setError('Failed to process data');
    } finally {
      setProcessing(false);
    }
  };

  const renderIndicatorSettings = (indicator: string) => {
    const indicatorObj = allIndicators.find(i => i.name === indicator);
    if (!indicatorObj || !indicatorObj.parameters || indicatorObj.parameters.length === 0) {
      return (
        <Typography variant="body2">
          No configurable parameters
        </Typography>
      );
    }
    
    return (
      <Box sx={{ pt: 1 }}>
        <Typography variant="subtitle2" gutterBottom>Parameters</Typography>
        {indicatorObj.parameters.map(param => (
          <Box key={param.name} sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between'}}>
              <span>{param.name}</span> 
              <span style={{ color: theme.palette.text.secondary }}>{indicatorSettings[indicator]?.[param.name]}</span>
            </Typography>
            <TextField
              type="number"
              inputProps={{
                min: param.min || 1,
                max: param.max || 200,
                step: 1
              }}
              value={indicatorSettings[indicator]?.[param.name] || param.defaultValue}
              onChange={(e) => handleParameterChange(
                indicator, 
                param.name, 
                Number(e.target.value)
              )}
              fullWidth
              size="small"
              sx={{ borderRadius: theme.shape.borderRadius }}
            />
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: theme.shape.borderRadius } }}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Data Preprocessing</Typography>
          {dataset && (
            <Chip 
              label={`${dataset.symbol} - ${dataset.timeframe}`} 
              size="small" 
              sx={{ ml: 2, borderRadius: theme.shape.borderRadius }}
            />
          )}
        </Box>
        {dataId && <Typography variant="caption">Dataset ID: {dataId}</Typography>}
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: theme.shape.borderRadius }}>{error}</Alert>}
        
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 1 }}>
          Available Technical Indicators
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select indicators to apply to your dataset. Click the settings icon to adjust parameters.
        </Typography>

        {dataset && dataset.hasIndicators && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: theme.shape.borderRadius }}>
            This dataset already has the following indicators applied: {dataset.appliedIndicators?.join(', ') || 'None'}.
            Re-processing will overwrite existing indicators.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.entries(indicatorCategories).map(([category, indicators]) => (
            <Accordion 
              key={category} 
              defaultExpanded={category === 'trend'}
              sx={{ 
                borderRadius: theme.shape.borderRadius,
                '&:before': { display: 'none' },
                '&.Mui-expanded': { 
                  margin: '8px 0',
                },
                 boxShadow: theme.shadows[1],
                 border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <AccordionSummary 
                expandIcon={<AppIcon name="ChevronDown" />}
                sx={{ 
                  borderRadius: theme.shape.borderRadius,
                  '&.Mui-expanded': {
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  },
                  '& .MuiAccordionSummary-content': {
                     alignItems: 'center',
                  }
                }}
              >
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize', flexGrow: 1 }}>
                  {category}
                </Typography>
                {selectedIndicators.filter(ind => indicators.some(i => i.name === ind)).length > 0 && (
                  <Chip 
                    label={`${selectedIndicators.filter(ind => indicators.some(i => i.name === ind)).length} selected`} 
                    size="small" 
                    color="primary"
                    sx={{ ml: 1, borderRadius: theme.shape.borderRadius }} 
                  />
                )}
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                <FormGroup>
                  {indicators.map(indicator => (
                    <Box key={indicator.name} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, py: 0.5, '&:hover': { backgroundColor: theme.palette.action.hover, borderRadius: theme.shape.borderRadius } }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedIndicators.includes(indicator.name)}
                            onChange={() => handleToggleIndicator(indicator.name)}
                            size="small"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body1">{indicator.name}</Typography>
                            <Tooltip title={indicator.description} placement="top-start">
                              <span>
                                <AppIcon name="Info" size={16} style={{ marginLeft: 4, color: theme.palette.text.secondary, verticalAlign: 'middle' }} />
                              </span>
                            </Tooltip>
                          </Box>
                        }
                        sx={{ flexGrow: 1 }}
                      />
                      {indicator.parameters && indicator.parameters.length > 0 && (
                        <Tooltip title="Configure parameters">
                          <IconButton size="small" onClick={() => handleOpenSettings(indicator.name)} color={openSettings === indicator.name ? "primary" : "default"}>
                            <AppIcon name="Settings" size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {openSettings && (
          <Dialog 
            open={!!openSettings} 
            onClose={handleCloseSettings} 
            maxWidth="xs" 
            fullWidth
            PaperProps={{ sx: { borderRadius: theme.shape.borderRadius, p:1 } }}
          >
            <DialogTitle sx={{ pb:1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">{openSettings} Parameters</Typography>
                <IconButton onClick={handleCloseSettings} size="small">
                    <AppIcon name="X" />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{pt: '8px !important' }}>
              {renderIndicatorSettings(openSettings)}
            </DialogContent>
            <DialogActions sx={{ pt:1, pb:1, pr:1 }}>
              <Button onClick={handleCloseSettings} variant="outlined" size="small">Done</Button>
            </DialogActions>
          </Dialog>
        )}

      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" variant="text">Cancel</Button>
        <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary" 
            disabled={processing || selectedIndicators.length === 0}
        >
          {processing ? 'Processing...' : 'Apply Indicators'}
        </Button>
      </DialogActions>
      {processing && <LinearProgress sx={{ width: '100%'}} />}
    </Dialog>
  );
};

export default DataPreprocessingDialog;