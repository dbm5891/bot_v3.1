import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// ---- Configuration ----
// const API_KEY = import.meta.env.VITE_FINANCIAL_MODELING_PREP_API_KEY || 'YOUR_DEMO_API_KEY'; 
const POLYGON_API_KEY = 'c4OQX3FEjNRN_GahOukEu4kR8rzMxOVp';

// ---- Interfaces ----
export interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: 'holiday';
  impact?: 'medium';
  country?: string;
}

// ---- State ----
interface TradingCalendarState {
  events: CalendarEvent[];
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: TradingCalendarState = {
  events: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// ---- Helper Functions ----

// ---- Async Thunks ----
export const fetchCalendarEvents = createAsyncThunk<CalendarEvent[], { from: Date; to: Date }, { rejectValue: string }>(
  'tradingCalendar/fetchCalendarEvents',
  async ({ from, to }, { rejectWithValue }) => {
    const fromDateStr = from.toISOString().split('T')[0];
    const toDateStr = to.toISOString().split('T')[0];
    let allEvents: CalendarEvent[] = [];
    try {
      // Fetch holidays only using Polygon.io
      const holidaysPromise = axios.get('https://api.polygon.io/v1/marketstatus/upcoming', {
        params: {
          apiKey: POLYGON_API_KEY,
        },
      });
      const holidaysResponse = await holidaysPromise;
      if (holidaysResponse.data && Array.isArray(holidaysResponse.data)) {
        const fromTime = new Date(fromDateStr).getTime();
        const toTime = new Date(toDateStr).getTime();
        holidaysResponse.data.forEach((holiday: any) => {
          const holidayDate = new Date(holiday.date);
          if (holidayDate.getTime() >= fromTime && holidayDate.getTime() <= toTime) {
            allEvents.push({
              id: `holiday-${holiday.date}-${holiday.name.replace(/\s+/g, '-')}`,
              date: holiday.date,
              title: holiday.name,
              type: 'holiday',
              impact: 'medium',
              country: holiday.exchange ?? 'US',
            });
          }
        });
      }
      allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      return allEvents;
    } catch (error) {
      let errorMessage = 'Failed to fetch calendar events';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// ---- Slice ----
const tradingCalendarSlice = createSlice({
  name: 'tradingCalendar',
  initialState,
  reducers: {
    clearCalendarError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCalendarEvents.fulfilled, (state, action: PayloadAction<CalendarEvent[]>) => {
        state.events = action.payload;
        state.loading = false;
        state.lastUpdated = Date.now();
      })
      .addCase(fetchCalendarEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Unknown error occurred while fetching calendar events';
      });
  },
});

export const { clearCalendarError } = tradingCalendarSlice.actions;
export default tradingCalendarSlice.reducer; 