import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { mockAvailableData, mockSymbols, isDevelopment } from '../../utils/mockData';

export interface MarketData {
  id: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  recordCount: number;
  source: 'csv' | 'tdameritrade' | 'polygon' | 'other';
  hasIndicators: boolean;
  fileSize: string;
  lastUpdated: string;
}

interface DataState {
  availableData: MarketData[];
  currentData: MarketData | null;
  symbols: string[];
  timeframes: string[];
  loading: boolean;
  error: string | null;
}

const initialState: DataState = {
  availableData: [],
  currentData: null,
  symbols: [],
  timeframes: ['1m', '5m', '15m', '1h', '1d'],
  loading: false,
  error: null,
};

// Async thunk for fetching available market data
export const fetchAvailableData = createAsyncThunk(
  'data/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      // In development, immediately return mock data if needed
      if (isDevelopment) {
        console.log("Using mock available data");
        return mockAvailableData;
      }
      
      const response = await axios.get('/api/data/available');
      return response.data;
    } catch (error: any) {
      console.warn('Failed to fetch available data from API, using mock data', error);
      return isDevelopment ? mockAvailableData : 
        rejectWithValue(error.response?.data?.message || 'Failed to fetch available data');
    }
  }
);

// Async thunk for fetching available symbols
export const fetchAvailableSymbols = createAsyncThunk(
  'data/fetchSymbols',
  async (_, { rejectWithValue }) => {
    try {
      // In development, immediately return mock data if needed
      if (isDevelopment) {
        console.log("Using mock symbols");
        return mockSymbols;
      }
      
      const response = await axios.get('/api/data/symbols');
      return response.data;
    } catch (error: any) {
      console.warn('Failed to fetch symbols from API, using mock data', error);
      return isDevelopment ? mockSymbols : 
        rejectWithValue(error.response?.data?.message || 'Failed to fetch symbols');
    }
  }
);

// Async thunk for importing new market data
export const importMarketData = createAsyncThunk(
  'data/import',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/data/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to import market data');
    }
  }
);

// Async thunk for preprocessing data (adding indicators)
export const preprocessData = createAsyncThunk(
  'data/preprocess',
  async (
    { dataId, indicators }: { dataId: string; indicators: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(`/api/data/${dataId}/preprocess`, { indicators });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to preprocess data');
    }
  }
);

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    setCurrentData: (state, action: PayloadAction<MarketData | null>) => {
      state.currentData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAvailableData
      .addCase(fetchAvailableData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableData.fulfilled, (state, action) => {
        state.loading = false;
        state.availableData = action.payload;
      })
      .addCase(fetchAvailableData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetchAvailableSymbols
      .addCase(fetchAvailableSymbols.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSymbols.fulfilled, (state, action) => {
        state.loading = false;
        state.symbols = action.payload;
      })
      .addCase(fetchAvailableSymbols.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle importMarketData
      .addCase(importMarketData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(importMarketData.fulfilled, (state, action) => {
        state.loading = false;
        state.availableData = [...state.availableData, action.payload];
      })
      .addCase(importMarketData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle preprocessData
      .addCase(preprocessData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(preprocessData.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.availableData.findIndex(
          (d) => d.id === action.payload.id
        );
        if (index !== -1) {
          state.availableData[index] = action.payload;
        }
        if (state.currentData?.id === action.payload.id) {
          state.currentData = action.payload;
        }
      })
      .addCase(preprocessData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentData } = dataSlice.actions;
export default dataSlice.reducer;