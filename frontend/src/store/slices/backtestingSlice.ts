import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { mockBacktestResults, isDevelopment } from '../../utils/mockData';

export interface TradeDetail {
  id?: number;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  direction: 'long' | 'short';
  profit: number;
  profitPercent: number;
  size?: number;
  type?: 'buy' | 'sell';
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
  trades: number;
  tradesCount?: number; // Alias for trades for compatibility
  tradesDetails?: TradeDetail[];
  createdAt?: string;
}

interface BacktestingState {
  results: BacktestResult[];
  currentBacktest: BacktestResult | null;
  loading: boolean;
  error: string | null;
}

const initialState: BacktestingState = {
  results: [],
  currentBacktest: null,
  loading: false,
  error: null,
};

// Async thunk for running a backtest
export const runBacktest = createAsyncThunk(
  'backtesting/runBacktest',
  async (backTestParams: {
    strategyId: string;
    symbol: string;
    timeframe: string;
    startDate: string;
    endDate: string;
    initialCapital: number;
  }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/backtest/run', backTestParams);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to run backtest');
    }
  }
);

// Async thunk for fetching backtest history
export const fetchBacktestHistory = createAsyncThunk(
  'backtesting/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      // In development, immediately return mock data if needed
      if (isDevelopment) {
        console.log("Using mock backtest results");
        return mockBacktestResults;
      }
      
      const response = await axios.get('/api/backtest/history');
      return response.data;
    } catch (error: any) {
      console.warn('Failed to fetch backtest history from API, using mock data', error);
      return isDevelopment ? mockBacktestResults : 
        rejectWithValue(error.response?.data?.message || 'Failed to fetch backtest history');
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