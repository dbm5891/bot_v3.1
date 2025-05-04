import React, { useState } from 'react';
import { 
  Box, 
  Stepper, 
  Step, 
  StepLabel, 
  Button, 
  Typography, 
  Paper, 
  Divider,
  Container,
  Alert
} from '@mui/material';
import BacktestParameters from '../components/backtesting/BacktestParameters';
import BacktestResults from '../components/backtesting/BacktestResults';

// Mock types for demonstration
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

interface BacktestResult {
  totalReturns: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: number;
  winRate: number;
  profitFactor: number;
  averageTrade: number;
  equity: {
    date: string;
    value: number;
  }[];
  trades: {
    id: number;
    date: string;
    type: 'buy' | 'sell';
    price: number;
    size: number;
    profit: number;
    profitPct: number;
  }[];
}

const steps = ['Configure Backtest Parameters', 'Review Results'];

const BacktestingPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backtestConfig, setBacktestConfig] = useState<BacktestConfig | null>(null);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setBacktestResult(null);
  };

  const runBacktest = async (config: BacktestConfig) => {
    setLoading(true);
    setError(null);
    setBacktestConfig(config);

    try {
      // This would be replaced with an actual API call in a real implementation
      console.log('Running backtest with config:', config);
      
      // Mock API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock result data
      const result: BacktestResult = {
        totalReturns: 25.8,
        maxDrawdown: 12.3,
        sharpeRatio: 1.7,
        trades: 42,
        winRate: 65.2,
        profitFactor: 2.3,
        averageTrade: 0.62,
        equity: Array.from({ length: 100 }, (_, i) => ({
          date: new Date(new Date(config.startDate).getTime() + i * 86400000).toISOString().split('T')[0],
          value: 10000 * (1 + (Math.sin(i / 10) / 10) + (i / 500)),
        })),
        trades: Array.from({ length: 42 }, (_, i) => ({
          id: i + 1,
          date: new Date(new Date(config.startDate).getTime() + (i + 5) * 86400000).toISOString().split('T')[0],
          type: Math.random() > 0.5 ? 'buy' : 'sell',
          price: 100 + Math.random() * 50,
          size: Math.floor(Math.random() * 10) + 1,
          profit: (Math.random() * 2 - 0.5) * 100,
          profitPct: (Math.random() * 2 - 0.5) * 5,
        })),
      };

      setBacktestResult(result);
      handleNext();
      
    } catch (err) {
      console.error('Error running backtest:', err);
      setError('Failed to run backtest. Please try again or check your parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper elevation={2} sx={{ p: 3, mt: 3, mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Backtesting
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box>
          {activeStep === 0 ? (
            <BacktestParameters 
              onSubmit={runBacktest} 
              loading={loading} 
            />
          ) : (
            <BacktestResults 
              results={backtestResult!} 
              config={backtestConfig!}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0 || loading}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Box sx={{ flex: '1 1 auto' }} />
          {activeStep === steps.length - 1 && (
            <Button onClick={handleReset} variant="outlined">
              Run New Backtest
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default BacktestingPage;