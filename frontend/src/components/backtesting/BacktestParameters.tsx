import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
  Button,
} from '@mui/material';

// Interface for the backtest configuration
interface BacktestConfig {
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

interface BacktestParametersProps {
  onSubmit: (config: BacktestConfig) => void;
  loading: boolean;
}

const BacktestParameters: React.FC<BacktestParametersProps> = ({ onSubmit, loading }) => {
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [timeframe, setTimeframe] = useState<string>('1d');
  const [strategy, setStrategy] = useState<string>('MovingAverageCrossover');
  const [startDate, setStartDate] = useState<string>('2023-01-01');
  const [endDate, setEndDate] = useState<string>('2023-12-31');
  const [initialCapital, setInitialCapital] = useState<number>(10000);
  const [commission, setCommission] = useState<number>(0.1);
  const [positionSize, setPositionSize] = useState<number>(10);
  const [stopLoss, setStopLoss] = useState<number | undefined>(5);
  const [takeProfit, setTakeProfit] = useState<number | undefined>(10);
  const [parameters, setParameters] = useState<Record<string, any>>({
    fastPeriod: 10,
    slowPeriod: 30,
    signalPeriod: 9,
  });

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
  const availableSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'FB', 'NFLX'];
  const availableStrategies = ['MovingAverageCrossover', 'RSI', 'MACD', 'BollingerBands'];

  const handleParameterChange = (name: string, value: any) => {
    setParameters(prevParams => ({
      ...prevParams,
      [name]: value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const config: BacktestConfig = {
      symbol,
      timeframe,
      strategy,
      startDate,
      endDate,
      initialCapital,
      commission,
      positionSize,
      stopLoss,
      takeProfit,
      parameters
    };
    
    onSubmit(config);
  };

  return (
    <Box component="form" onSubmit={handleFormSubmit} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Market Data Settings
      </Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Symbol</InputLabel>
              <Select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value as string)}
                label="Symbol"
              >
                {availableSymbols.map((sym) => (
                  <MenuItem key={sym} value={sym}>
                    {sym}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Timeframe</InputLabel>
              <Select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value as string)}
                label="Timeframe"
              >
                {timeframes.map((tf) => (
                  <MenuItem key={tf} value={tf}>
                    {tf}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Strategy</InputLabel>
              <Select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as string)}
                label="Strategy"
              >
                {availableStrategies.map((strat) => (
                  <MenuItem key={strat} value={strat}>
                    {strat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Initial Capital ($)"
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 100 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Commission (%)"
              type="number"
              value={commission}
              onChange={(e) => setCommission(Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Position Size (%)"
              type="number"
              value={positionSize}
              onChange={(e) => setPositionSize(Number(e.target.value))}
              fullWidth
              InputProps={{ inputProps: { min: 1, max: 100 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={stopLoss !== undefined}
                  onChange={(e) => setStopLoss(e.target.checked ? 5 : undefined)}
                />
              }
              label="Use Stop Loss"
            />
            {stopLoss !== undefined && (
              <TextField
                label="Stop Loss (%)"
                type="number"
                value={stopLoss}
                onChange={(e) => setStopLoss(Number(e.target.value))}
                fullWidth
                InputProps={{ inputProps: { min: 0.1, step: 0.1 } }}
                sx={{ mt: 2 }}
              />
            )}
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Strategy Parameters
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={3}>
          {strategy === 'MovingAverageCrossover' && (
            <>
              <Grid item xs={12} md={4}>
                <Box sx={{ width: '100%' }}>
                  <Typography gutterBottom>
                    Fast Period: {parameters.fastPeriod}
                  </Typography>
                  <Slider
                    value={parameters.fastPeriod || 10}
                    onChange={(_, value) => handleParameterChange('fastPeriod', value as number)}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={2}
                    max={50}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ width: '100%' }}>
                  <Typography gutterBottom>
                    Slow Period: {parameters.slowPeriod}
                  </Typography>
                  <Slider
                    value={parameters.slowPeriod || 30}
                    onChange={(_, value) => handleParameterChange('slowPeriod', value as number)}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={5}
                    max={200}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ width: '100%' }}>
                  <Typography gutterBottom>
                    Signal Period: {parameters.signalPeriod}
                  </Typography>
                  <Slider
                    value={parameters.signalPeriod || 9}
                    onChange={(_, value) => handleParameterChange('signalPeriod', value as number)}
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={1}
                    max={50}
                  />
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          disabled={loading}
        >
          {loading ? 'Running Backtest...' : 'Run Backtest'}
        </Button>
      </Box>
    </Box>
  );
};

export default BacktestParameters;