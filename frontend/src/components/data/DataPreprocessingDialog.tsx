import React, { useState, useEffect } from 'react';
import AppIcon from '../icons/AppIcon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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

  const allIndicators: TechnicalIndicator[] = Object.keys(indicatorCategories).flatMap(category => 
    indicatorCategories[category as keyof typeof indicatorCategories].map(indicator => ({
      ...indicator,
      category
    }))
  );

  useEffect(() => {
    if (dataset && dataset.appliedIndicators) {
      setSelectedIndicators(dataset.appliedIndicators);
      
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
        const filtered = prev.filter(i => i !== indicator);
        
        const newSettings = { ...indicatorSettings };
        delete newSettings[indicator];
        setIndicatorSettings(newSettings);
        
        return filtered;
      } else {
        const newSelection = [...prev, indicator];
        
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
        <div>
          No configurable parameters
        </div>
      );
    }
    
    return (
      <div>
        <div>Parameters</div>
        {indicatorObj.parameters.map(param => (
          <div key={param.name} className="mb-2">
            <div className="flex justify-between">
              <span>{param.name}</span> 
              <span>{indicatorSettings[indicator]?.[param.name]}</span>
            </div>
            <input
              type="number"
              id={`${indicator}-${param.name}`}
              name={`${indicator}-${param.name}`}
              className="w-full p-2 border rounded-md"
              value={indicatorSettings[indicator]?.[param.name] || param.defaultValue}
              onChange={(e) => handleParameterChange(
                indicator, 
                param.name, 
                Number(e.target.value)
              )}
              min={param.min}
              max={param.max}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Data Preprocessing</DialogTitle>
          <DialogDescription>
            Select indicators to apply to your dataset. Click the settings icon to adjust parameters.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 max-h-[60vh] overflow-y-auto">
          {Object.entries(indicatorCategories).map(([category, indicators]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-semibold capitalize">{category}</h4>
              {indicators.map((indicator) => (
                <div key={indicator.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={indicator.name}
                      checked={selectedIndicators.includes(indicator.name)}
                      onCheckedChange={() => handleToggleIndicator(indicator.name)}
                    />
                    <Label htmlFor={indicator.name} className="cursor-pointer">
                      {indicator.description}
                    </Label>
                  </div>
                  {indicator.parameters && indicator.parameters.length > 0 && (
                    <Button variant="ghost" size="icon" onClick={() => handleOpenSettings(indicator.name)}>
                      <AppIcon name="Settings" className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={processing}>
            {processing ? 'Processing...' : 'Apply Indicators'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataPreprocessingDialog; 