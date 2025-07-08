import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import { RootState, AppDispatch } from '../store';
import { fetchStrategy, updateStrategy, Strategy } from '../store/slices/strategySlice';
import AppLayout from '../layouts/AppLayoutNew';
import { LoaderCircle, ArrowLeft, Play as PlayArrow, Save, Delete } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';

const StrategyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  // State for tabs
  const [tabValue, setTabValue] = useState('basic');
  
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
  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
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
  
  // Add a handleTextareaChange function for the textarea.
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => prev ? { ...prev, description: e.target.value } : null);
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <LoaderCircle />
      </div>
    );
  }
  
  if (error) {
    return (
      <div>
        <Alert variant="destructive" className="mb-3">
          {error}
        </Alert>
        <Button 
          onClick={handleGoBack}
        >
          Back to Strategies
        </Button>
      </div>
    );
  }
  
  if (!formData) {
    return (
      <div>
        <Alert variant="destructive" className="mb-3">
          Strategy not found
        </Alert>
        <Button 
          onClick={handleGoBack}
        >
          Back to Strategies
        </Button>
      </div>
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
          <div style={{ width: '100%' }}>
            <Label>
              {param.value}
            </Label>
            <Input
              type="range"
              id={`param-${param.name}-${index}`}
              name={`parameter_${param.name}`}
              value={param.value}
              min={param.min ?? 1}
              max={param.max ?? 100}
              step={param.step || 1}
              onChange={(e) => handleParameterChange(index, e.target.value)}
            />
          </div>
        );
        
      case 'boolean':
        return (
          <Switch
            id={`param-${param.name}-${index}`}
            name={`parameter_${param.name}`}
            checked={param.value}
            onCheckedChange={(checked) => handleParameterChange(index, checked)}
          />
        );
        
      case 'select':
        return (
          <Input
            id={`param-${param.name}-${index}`}
            name={`parameter_${param.name}`}
            value={param.value}
            onChange={(e) => handleParameterChange(index, e.target.value)}
          >
            {param.options?.map((option: string) => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </Input>
        );
        
      default:
        return (
          <Input
            id={`param-${param.name}-${index}`}
            name={`parameter_${param.name}`}
            value={param.value}
            onChange={(e) => handleParameterChange(index, e.target.value)}
          />
        );
    }
  };
  
  return (
    <AppLayout>
      <div className="overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-stretch mb-3 gap-2">
          <div className="flex items-center flex-grow overflow-hidden">
            <button onClick={handleGoBack} className="mr-1">
              <ArrowLeft />
            </button>
          </div>
        </div>
        
        {saveSuccess && (
          <Alert variant="default" className="mb-2">
            Strategy saved successfully!
          </Alert>
        )}

        <div className="mt-3">
          <Tabs value={tabValue} onValueChange={(value) => setTabValue(value)}>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="backtest-history">Backtest History</TabsTrigger>
            <TabsTrigger value="advanced-settings">Advanced Settings</TabsTrigger>
          </Tabs>
        </div>
        
        {/* Basic Info Tab */}
        <TabsContent value="basic">
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 sm:col-span-6">
              <Label>
                Strategy Name
              </Label>
              <Input
                type="text"
                id="strategy-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
            <div className="col-span-12 sm:col-span-6">
              <Label>
                Strategy Type
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger id="strategy-type" name="type">
                  <SelectValue placeholder="Select strategy type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="template">Template</SelectItem>
                  <SelectItem value="imported">Imported</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-12">
              <Label>
                Description
              </Label>
              <textarea
                id="strategy-description"
                name="description"
                value={formData.description}
                onChange={handleTextareaChange}
                className="w-full h-24 p-2 border rounded-md"
              />
            </div>
            <div className="col-span-12">
              <Label>
                Indicators
              </Label>
              <div className="flex flex-wrap gap-2">
                {formData.indicators.map((indicator) => (
                  <span
                    key={indicator}
                    className="bg-gray-200 text-sm px-2 py-1 rounded-full"
                  >
                    {indicator}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        const updatedIndicators = formData.indicators.filter((ind) => ind !== indicator);
                        setFormData({ ...formData, indicators: updatedIndicators });
                      }}
                      className="text-red-500 ml-2"
                    >
                      Remove
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Parameters Tab */}
        <TabsContent value="parameters">
          <div className="grid grid-cols-12 gap-4">
            {formData.parameters.length === 0 ? (
              <div className="col-span-12">
                <Alert>
                  This strategy has no configurable parameters.
                </Alert>
              </div>
            ) : (
              formData.parameters.map((param, index) => (
                <div key={param.name + index} className="col-span-12 sm:col-span-6 md:col-span-4">
                  <Card className="h-full p-4">
                    <Label>
                      {param.name}
                    </Label>
                    {renderParameterInput(param, index)}
                  </Card>
                </div>
              ))
            )}
          </div>
        </TabsContent>
        
        {/* Backtest History Tab */}
        <TabsContent value="backtest-history">
          <h2 className="text-xl font-semibold mb-2">Backtest History</h2>
          <p className="text-slate-600">Backtest history for this strategy will be shown here.</p>
        </TabsContent>
        
        {/* Advanced Settings Tab */}
        <TabsContent value="advanced-settings">
          <h2 className="text-xl font-semibold mb-2">Advanced Settings</h2>
          <p className="text-slate-600">Advanced configuration options for the strategy.</p>
        </TabsContent>
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-stretch gap-2">
        <Button 
          onClick={handleGoBack}
          className="w-full sm:w-auto"
        >
          Back to Strategies
        </Button>
        <Button 
          onClick={() => {
            if (window.confirm('Are you sure you want to delete this strategy?')) {
              // Implement deletion logic here
              console.log('Strategy deleted');
              navigate('/strategies');
            }
          }}
          className="w-full sm:w-auto"
        >
          Delete Strategy
        </Button>
      </div>
    </AppLayout>
  );
};

export default StrategyDetailPage;