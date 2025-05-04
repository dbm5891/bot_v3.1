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
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Settings as SettingsIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

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
        if (settings) {
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
            <Typography variant="body2" gutterBottom>
              {param.name}: {indicatorSettings[indicator]?.[param.name]}
            </Typography>
            <TextField
              type="range"
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
            />
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {dataset ? `Preprocess Data: ${dataset.symbol} (${dataset.timeframe})` : 'Preprocess Data'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Add Technical Indicators
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Select the technical indicators you want to add to this dataset. These will be calculated
            and stored for use in backtesting and strategy development.
          </Typography>
        </Box>

        {dataset && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2">
              Dataset Info:
            </Typography>
            <Typography variant="body2">
              Symbol: {dataset.symbol}, Timeframe: {dataset.timeframe}, Records: {dataset.recordCount.toLocaleString()}
            </Typography>
            {dataset.hasIndicators && (
              <Alert severity="info" sx={{ mt: 1 }}>
                This dataset already has indicators. Any changes will replace the existing indicators.
              </Alert>
            )}
          </Box>
        )}
        
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ width: '100%', mb: 1 }}>
            Selected Indicators:
          </Typography>
          {selectedIndicators.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No indicators selected
            </Typography>
          ) : (
            selectedIndicators.map(indicator => (
              <Chip
                key={indicator}
                label={indicator}
                onDelete={() => handleToggleIndicator(indicator)}
                color="primary"
                variant="outlined"
                onClick={() => handleOpenSettings(indicator)}
                icon={<SettingsIcon fontSize="small" />}
              />
            ))
          )}
        </Box>
        
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {Object.entries(indicatorCategories).map(([category, indicators]) => (
            <Accordion key={category} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                  {category} Indicators
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormGroup>
                  {indicators.map(indicator => (
                    <Box 
                      key={indicator.name} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                        py: 1
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedIndicators.includes(indicator.name)}
                              onChange={() => handleToggleIndicator(indicator.name)}
                            />
                          }
                          label={indicator.name}
                        />
                        <Tooltip title={indicator.description}>
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                      
                      {selectedIndicators.includes(indicator.name) && indicator.parameters && indicator.parameters.length > 0 && (
                        <Button
                          size="small"
                          startIcon={<SettingsIcon />}
                          onClick={() => handleOpenSettings(indicator.name)}
                        >
                          Configure
                        </Button>
                      )}
                    </Box>
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
        
        {processing && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Processing data... This might take a while.
            </Typography>
            <LinearProgress />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={processing}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={selectedIndicators.length === 0 || processing}
        >
          {processing ? 'Processing...' : 'Process Data'}
        </Button>
      </DialogActions>
      
      {/* Settings Dialog */}
      <Dialog
        open={!!openSettings}
        onClose={handleCloseSettings}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {openSettings} Settings
          <IconButton onClick={handleCloseSettings} size="small">
            <ClearIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {openSettings && renderIndicatorSettings(openSettings)}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettings}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default DataPreprocessingDialog;