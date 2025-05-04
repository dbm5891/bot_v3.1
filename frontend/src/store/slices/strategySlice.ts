import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { mockStrategies, isDevelopment } from '../../utils/mockData';

export interface Strategy {
  id: string;
  name: string;
  description: string;
  type: 'custom' | 'template' | 'imported';
  parameters: {
    name: string;
    type: 'number' | 'string' | 'boolean' | 'select';
    value: any;
    min?: number;
    max?: number;
    step?: number;
    options?: string[];
  }[];
  indicators: string[];
  createdAt: string;
  updatedAt: string;
}

interface StrategyState {
  strategies: Strategy[];
  currentStrategy: Strategy | null;
  loading: boolean;
  error: string | null;
}

const initialState: StrategyState = {
  strategies: [],
  currentStrategy: null,
  loading: false,
  error: null,
};

// Async thunk for fetching strategies
export const fetchStrategies = createAsyncThunk(
  'strategy/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // In development, immediately return mock data if needed
      if (isDevelopment) {
        logger.debug("Using mock strategies");
        return mockStrategies;
      }
      
      const response = await axios.get('/api/strategies');
      return response.data;
    } catch (error: any) {
      console.warn('Failed to fetch strategies from API, using mock data', error);
      return isDevelopment ? mockStrategies : 
        rejectWithValue(error.response?.data?.message || 'Failed to fetch strategies');
    }
  }
);

// Async thunk for fetching a single strategy
export const fetchStrategy = createAsyncThunk(
  'strategy/fetchOne',
  async (strategyId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/strategies/${strategyId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch strategy');
    }
  }
);

// Async thunk for creating a new strategy
export const createStrategy = createAsyncThunk(
  'strategy/create',
  async (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/strategies', strategyData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create strategy');
    }
  }
);

// Async thunk for updating a strategy
export const updateStrategy = createAsyncThunk(
  'strategy/update',
  async ({ id, data }: { id: string; data: Partial<Strategy> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`/api/strategies/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update strategy');
    }
  }
);

// Async thunk for deleting a strategy
export const deleteStrategy = createAsyncThunk(
  'strategy/delete',
  async (strategyId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/strategies/${strategyId}`);
      return strategyId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete strategy');
    }
  }
);

const strategySlice = createSlice({
  name: 'strategy',
  initialState,
  reducers: {
    setCurrentStrategy: (state, action: PayloadAction<Strategy | null>) => {
      state.currentStrategy = action.payload;
    },
    updateStrategyParameter: (state, action: PayloadAction<{ index: number; value: any }>) => {
      if (state.currentStrategy) {
        const { index, value } = action.payload;
        state.currentStrategy.parameters[index].value = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchStrategies
      .addCase(fetchStrategies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStrategies.fulfilled, (state, action) => {
        state.loading = false;
        state.strategies = action.payload;
      })
      .addCase(fetchStrategies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle fetchStrategy
      .addCase(fetchStrategy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStrategy.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStrategy = action.payload;
      })
      .addCase(fetchStrategy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle createStrategy
      .addCase(createStrategy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStrategy.fulfilled, (state, action) => {
        state.loading = false;
        state.strategies.push(action.payload);
        state.currentStrategy = action.payload;
      })
      .addCase(createStrategy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle updateStrategy
      .addCase(updateStrategy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStrategy.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.strategies.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.strategies[index] = action.payload;
        }
        if (state.currentStrategy?.id === action.payload.id) {
          state.currentStrategy = action.payload;
        }
      })
      .addCase(updateStrategy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Handle deleteStrategy
      .addCase(deleteStrategy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteStrategy.fulfilled, (state, action) => {
        state.loading = false;
        state.strategies = state.strategies.filter((s) => s.id !== action.payload);
        if (state.currentStrategy?.id === action.payload) {
          state.currentStrategy = null;
        }
      })
      .addCase(deleteStrategy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setCurrentStrategy, updateStrategyParameter } = strategySlice.actions;
export default strategySlice.reducer;