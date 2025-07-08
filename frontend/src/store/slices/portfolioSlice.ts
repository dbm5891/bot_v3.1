import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { generatePerformanceData } from '../../utils/generatePerformanceData';
import { fetchPortfolioPerformance as fetchPortfolioPerformanceService, PortfolioPerformanceData } from '../../services/portfolioPerformanceService';

interface PerformanceDataPoint {
  date: string;
  value: number;
}

interface PortfolioState {
  performanceData: PerformanceDataPoint[];
  benchmarkData: PerformanceDataPoint[];
  loading: boolean;
  error: string | null;
  metrics?: {
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    winRate?: number;
    profitFactor?: number;
  };
}

const initialState: PortfolioState = {
  performanceData: [],
  benchmarkData: [],
  loading: false,
  error: null,
};

// Async thunk to fetch portfolio performance data
export const fetchPortfolioPerformance = createAsyncThunk(
  'portfolio/fetchPerformance',
  async (timeRange: string, { rejectWithValue }) => {
    try {
      // Only use the production fetchPortfolioPerformanceService for fetching data
      const data = await fetchPortfolioPerformanceService(timeRange);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch portfolio performance data');
    }
  }
);

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolioPerformance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolioPerformance.fulfilled, (state, action: PayloadAction<PortfolioPerformanceData>) => {
        state.loading = false;
        state.performanceData = action.payload.performanceData;
        state.benchmarkData = action.payload.benchmarkData || []; // Handle optional benchmark data
        state.metrics = action.payload.metrics;
      })
      .addCase(fetchPortfolioPerformance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default portfolioSlice.reducer; 