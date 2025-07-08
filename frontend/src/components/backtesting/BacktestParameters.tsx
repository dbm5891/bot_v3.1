import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchStrategies, Strategy } from '../../store/slices/strategySlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCw, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

// Interface for the backtest configuration
interface BacktestConfig {
  strategyId: string;
  symbol: string;
  timeframe: string;
  strategy: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  positionSize: number;
  stopLoss?: number;
  takeProfit?: number;
  parameters: Record<string, any>;
}

const BacktestParameters = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { strategies: availableStrategiesFromStore, loading: strategiesLoading } = useSelector((state: RootState) => state.strategy);

  const [symbol, setSymbol] = useState<string>('AAPL');
  const [timeframe, setTimeframe] = useState<string>('1d');
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('2022-05-01');
  const [endDate, setEndDate] = useState<string>('2022-05-15');
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [commission, setCommission] = useState<number>(0.1);
  const [positionSize, setPositionSize] = useState<number>(10);
  const [stopLoss, setStopLoss] = useState<number | undefined>(5);
  const [parameters, setParameters] = useState<Record<string, any>>({
    fastPeriod: 10,
    slowPeriod: 30,
    signalPeriod: 9,
  });

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
  const availableSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'FB', 'NFLX'];

  useEffect(() => {
    dispatch(fetchStrategies());
  }, [dispatch]);

  useEffect(() => {
    if (availableStrategiesFromStore.length > 0 && !selectedStrategyId) {
      setSelectedStrategyId(availableStrategiesFromStore[0].id);
    }
  }, [availableStrategiesFromStore, selectedStrategyId]);

  const handleParameterChange = (name: string, value: any) => {
    setParameters(prevParams => ({
      ...prevParams,
      [name]: value
    }));
  };

  // Add a handler for refresh
  const handleRefreshStrategies = () => {
    dispatch(fetchStrategies());
  };

  // Find the selected strategy object
  const selectedStrategyObject = availableStrategiesFromStore.find(s => s.id === selectedStrategyId);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Market Data Settings
      </h1>
      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm mb-4">
        <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="symbol-select" className="block text-sm font-medium">
              Symbol
            </Label>
            <Select value={symbol} onValueChange={setSymbol}>
              <SelectTrigger id="symbol-select" className="mt-1 h-10">
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                {availableSymbols.map((sym) => (
                  <SelectItem key={sym} value={sym}>
                    {sym}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="timeframe-select" className="block text-sm font-medium">
              Timeframe
            </Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger id="timeframe-select" className="mt-1 h-10">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                {timeframes.map((tf) => (
                  <SelectItem key={tf} value={tf}>
                    {tf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="strategy-select" className="block text-sm font-medium">
              Strategy
            </Label>
            <div className="flex items-center gap-2 mt-1">
              <Select 
                value={selectedStrategyId} 
                onValueChange={setSelectedStrategyId}
                disabled={strategiesLoading || availableStrategiesFromStore.length === 0}
              >
                <SelectTrigger id="strategy-select" className="h-10 flex-1">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  {availableStrategiesFromStore.map((strat: Strategy) => (
                    <SelectItem key={strat.id} value={strat.id}>
                      {strat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefreshStrategies}
                disabled={strategiesLoading}
                className="h-10 w-10 shrink-0"
                aria-label="Refresh strategies"
              >
                <RefreshCw className={cn("h-4 w-4", strategiesLoading && "animate-spin")} />
              </Button>
            </div>
            {/* Show strategy description */}
            {selectedStrategyObject && selectedStrategyObject.description && (
              <p className="text-sm text-gray-500 mt-1">
                {selectedStrategyObject.description}
              </p>
            )}
          </div>
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="initialCapital" className="block text-sm font-medium">
              Initial Capital ($)
            </Label>
            <Input
              type="number"
              min={100}
              id="initialCapital"
              name="initialCapital"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="mt-1 h-10"
              placeholder="Enter initial capital"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="startDate" className="block text-sm font-medium">
              Start Date
            </Label>
            <Input
              type="date"
              id="startDate"
              name="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 h-10"
            />
          </div>
          <div className="col-span-12 md:col-span-6">
            <Label htmlFor="endDate" className="block text-sm font-medium">
              End Date
            </Label>
            <Input
              type="date"
              id="endDate"
              name="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 h-10"
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Label htmlFor="commission" className="block text-sm font-medium">
              Commission (%)
            </Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              id="commission"
              name="commission"
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              className="mt-1 h-10"
              placeholder="0.1"
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <Label htmlFor="positionSize" className="block text-sm font-medium">
              Position Size (%)
            </Label>
            <Input
              type="number"
              min={1}
              max={100}
              id="positionSize"
              name="positionSize"
              value={positionSize}
              onChange={(e) => setPositionSize(Number(e.target.value))}
              className="mt-1 h-10"
              placeholder="10"
            />
          </div>
          <div className="col-span-12 md:col-span-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="useStopLoss"
                  checked={stopLoss !== undefined}
                  onCheckedChange={(checked: boolean) => setStopLoss(checked ? 5 : undefined)}
                />
                <Label htmlFor="useStopLoss" className="text-sm font-medium">
                  Use Stop Loss
                </Label>
              </div>
              {stopLoss !== undefined && (
                <div className="space-y-2">
                  <Label htmlFor="stopLoss" className="text-sm font-medium">
                    Stop Loss (%)
                  </Label>
                  <Input
                    type="number"
                    min={0.1}
                    step={0.1}
                    id="stopLoss"
                    name="stopLoss"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(Number(e.target.value))}
                    className="h-10"
                    placeholder="5"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        </CardContent>
      </Card>

      <Card className="border border-border/50 bg-card/50 backdrop-blur-sm mb-3">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Strategy Parameters</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
        <div className="grid grid-cols-12 gap-4">
          {selectedStrategyId && availableStrategiesFromStore.find(s => s.id === selectedStrategyId)?.name === 'MovingAverageCrossover' && (
            <>
              <div className="col-span-12 md:col-span-4">
                <div className="w-full space-y-3">
                  <Label htmlFor="fast-period" className="text-sm font-medium">
                    Fast Period: {parameters.fastPeriod}
                  </Label>
                  <input
                    id="fast-period"
                    name="fastPeriod"
                    type="range"
                    value={parameters.fastPeriod || 10}
                    onChange={(e) => handleParameterChange('fastPeriod', Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    min={2}
                    max={50}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>2</span>
                    <span>50</span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="w-full space-y-3">
                  <Label htmlFor="slow-period" className="text-sm font-medium">
                    Slow Period: {parameters.slowPeriod}
                  </Label>
                  <input
                    id="slow-period"
                    name="slowPeriod"
                    type="range"
                    value={parameters.slowPeriod || 30}
                    onChange={(e) => handleParameterChange('slowPeriod', Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    min={5}
                    max={200}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5</span>
                    <span>200</span>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4">
                <div className="w-full space-y-3">
                  <Label htmlFor="signal-period" className="text-sm font-medium">
                    Signal Period: {parameters.signalPeriod}
                  </Label>
                  <input
                    id="signal-period"
                    name="signalPeriod"
                    type="range"
                    value={parameters.signalPeriod || 9}
                    onChange={(e) => handleParameterChange('signalPeriod', Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    min={1}
                    max={50}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>50</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-3">
        <Button
          type="submit"
          size="lg"
          disabled={strategiesLoading}
          className="h-12 px-8 flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          {strategiesLoading ? 'Running Backtest...' : 'Run Backtest'}
        </Button>
      </div>
    </div>
  );
};

export default BacktestParameters;