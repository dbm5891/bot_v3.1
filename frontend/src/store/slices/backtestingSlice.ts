import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { mockBacktestResults, isDevelopment } from '../../utils/mockData';
import BacktestingService, { BacktestConfig as ServiceBacktestConfig } from '../../services/backtestingService';

export interface TradeDetail {
  id?: number;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  direction: string;
  profit: number;
  profitPercent: number;
  size?: number;
  type?: string;
  profitPct?: number; // Alias for profitPercent for compatibility
}

export interface BacktestResult {
  id: string;
  strategyId?: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance?: number;
  finalBalance?: number;
  initialCapital?: number;
  finalCapital?: number;
  totalReturn?: number;
  roi?: number;
  annualizedReturn?: number;
  maxDrawdown?: number;
  sharpeRatio: number;
  drawdown?: number;
  winRate: number;
  profitFactor?: number;
  trades: number;
  tradesCount?: number; // Alias for trades for compatibility
  tradesDetails?: TradeDetail[];
  createdAt?: string;
}

// Interface for the backtest configuration (copied from BacktestingPage.tsx)
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

interface BacktestingState {
  results: BacktestResult[];
  currentBacktest: BacktestResult | null;
  currentBacktestConfig: BacktestConfig | null; // Add field for current backtest config
  loading: boolean;
  error: string | null;
}

const initialState: BacktestingState = {
  results: [],
  currentBacktest: null,
  currentBacktestConfig: null,
  loading: false,
  error: null,
};

// Async thunk for running a backtest
export const runBacktest = createAsyncThunk(
  'backtesting/runBacktest',
  async (config: BacktestConfig, { rejectWithValue }) => {
    try {
      const result = await BacktestingService.runBacktest(config);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to run backtest');
    }
  }
);

// Async thunk for fetching backtest history
export const fetchBacktestHistory = createAsyncThunk(
  'backtesting/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      // In development, try API first but fallback to mock data if needed
      if (isDevelopment) {
        try {
          const results = await BacktestingService.getBacktestHistory();
          return results;
        } catch (error) {
          console.log("Using mock backtest results");
          return mockBacktestResults;
        }
      }
      
      const results = await BacktestingService.getBacktestHistory();
      return results;
    } catch (error: any) {
      console.warn('Failed to fetch backtest history from API', error);
      return isDevelopment ? mockBacktestResults : 
        rejectWithValue(error.message || 'Failed to fetch backtest history');
    }
  }
);

const backtestingSlice = createSlice({
  name: 'backtesting',
  initialState,
  reducers: {
    setCurrentBacktest: (state, action: PayloadAction<BacktestResult | null>) => {
      state.currentBacktest = action.payload;
    },
    clearBacktestResults: (state) => {
      state.results = [];
      state.currentBacktest = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle runBacktest
      .addCase(runBacktest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runBacktest.fulfilled, (state, action) => {
        state.loading = false;
        state.results = [...state.results, action.payload];
        state.currentBacktest = action.payload;
        state.currentBacktestConfig = action.meta.arg;
      })
      .addCase(runBacktest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetchBacktestHistory
      .addCase(fetchBacktestHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBacktestHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })
      .addCase(fetchBacktestHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentBacktest, clearBacktestResults } = backtestingSlice.actions;
export default backtestingSlice.reducer;