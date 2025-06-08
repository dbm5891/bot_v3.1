import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define the structure of an index quote
export interface IndexQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number | null;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number | null;
  pe: number | null;
  earningsAnnouncement: string | null;
  sharesOutstanding: number | null;
  timestamp: number;
}

// Define the state structure for market data
interface MarketDataState {
  indices: IndexQuote[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

// Initial state
const initialState: MarketDataState = {
  indices: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchIndexQuotes = createAsyncThunk<IndexQuote[], void, { rejectValue: string }>(
  'marketData/fetchIndexQuotes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/market/indices');
      return response.data as IndexQuote[];
    } catch (error) {
      let errorMessage = 'Failed to fetch index quotes';
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
          errorMessage = 'Network error: No response received';
        } else {
          errorMessage = `Request setup error: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Create the slice
const marketDataSlice = createSlice({
  name: 'marketData',
  initialState,
  reducers: {
    // Could add manual refresh action or other reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIndexQuotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndexQuotes.fulfilled, (state, action: PayloadAction<IndexQuote[]>) => {
        state.indices = action.payload;
        state.loading = false;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchIndexQuotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error occurred';
      });
  },
});

export default marketDataSlice.reducer; 