import React, { useState, useEffect } from 'react';
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
  Alert,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CompareArrows as CompareIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import BacktestParameters from '../components/backtesting/BacktestParameters';
import BacktestResults from '../components/backtesting/BacktestResults';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { runBacktest } from '../store/slices/backtestingSlice';
import AppLayout from '../layouts/AppLayoutNew';
import { toggleSidebar } from '../store/slices/uiSlice';

// Using the type from the store's slice
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

const steps = ['Configure Backtest Parameters', 'Review Results'];

const BacktestingPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  
  const { currentBacktest, loading, error } = useSelector((state: RootState) => state.backtesting);
  const dispatch = useDispatch<AppDispatch>();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  useEffect(() => {
    if (isMobile) {
      dispatch(toggleSidebar());
    }
  }, [dispatch, isMobile]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const handleRunBacktest = async (config: BacktestConfig) => {
    dispatch(runBacktest(config));
  };

  useEffect(() => {
    if (currentBacktest) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  }, [currentBacktest]);

  return (
    <AppLayout>
      <Container maxWidth="lg">
        <Paper variant="outlined" sx={{ p: 3, mt: 3, mb: 4, borderRadius: theme.shape.borderRadius }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Backtesting
            </Typography>
            <Button 
              variant="outlined" 
              startIcon={<CompareIcon />}
              onClick={() => navigate('/backtesting/compare')}
            >
              Compare Backtests
            </Button>
          </Box>
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
                onSubmit={handleRunBacktest}
                loading={loading}
              />
            ) : (
              <BacktestResults 
                results={currentBacktest!}
                config={null}
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
    </AppLayout>
  );
};

export default BacktestingPage;