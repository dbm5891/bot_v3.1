import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface BacktestResult {
  id: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  drawdown: number;
  winRate: number;
  tradesCount: number;
  trades: {
    entryDate: string;
    exitDate: string;
    entryPrice: number;
    exitPrice: number;
    direction: 'long' | 'short';
    profit: number;
    profitPercent: number;
  }[];
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
      const response = await axios.get('/api/backtest/history');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch backtest history');
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