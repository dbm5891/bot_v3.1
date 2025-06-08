import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { isDevelopment, mockPortfolioPerformance } from '../../utils/mockData';
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
      // In development, use mock data generated for the selected time range
      if (isDevelopment) {
        console.log(`Using mock portfolio performance data for time range: ${timeRange}`);
        // Simulate a small delay
        await new Promise(resolve => setTimeout(resolve, 500));
        // Use the utility function to generate mock data based on time range
        const mockData = generatePerformanceData(timeRange);
        // For development, return a simplified structure that matches the expected API response
        return {
          performanceData: mockData.data,
          benchmarkData: mockData.benchmarkData,
          metrics: mockData.metrics,
        } as PortfolioPerformanceData; // Cast to PortfolioPerformanceData
      }

      // In production, fetch data from the API using the service function
      const data = await fetchPortfolioPerformanceService(timeRange);
      return data; // Service function already returns the expected data structure

    } catch (error: any) {
      console.warn('Failed to fetch portfolio performance data', error);
      // In case of API error in development, still return mock data
      if (isDevelopment) {
         console.warn('Falling back to mock data due to API error', error);
         const mockData = generatePerformanceData(timeRange);
         return {
            performanceData: mockData.data,
            benchmarkData: mockData.benchmarkData,
            metrics: mockData.metrics,
         } as PortfolioPerformanceData; // Cast to PortfolioPerformanceData
      }
      // In production, reject with error
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