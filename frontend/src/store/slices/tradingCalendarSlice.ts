import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// ---- Configuration ----
const API_KEY = import.meta.env.VITE_FINANCIAL_MODELING_PREP_API_KEY || 'YOUR_DEMO_API_KEY'; 
// It's crucial to set VITE_FINANCIAL_MODELING_PREP_API_KEY in your .env file for actual data.

const FMP_API_BASE_URL = 'https://financialmodelingprep.com/api/v3';

// ---- Interfaces ----
export interface CalendarEvent {
  id: string; // Unique ID, can be generated (e.g., `${type}-${date}-${title}`)
  date: string; // YYYY-MM-DD or ISO string
  title: string;
  description?: string;
  type: 'earnings' | 'economic' | 'holiday' | 'dividend' | 'ipo'; // Added 'ipo' as FMP has it
  impact?: 'high' | 'medium' | 'low'; // Optional as not all events might have it
  country?: string; // For economic events
  symbol?: string; // For earnings/dividends
  actual?: number | null;
  previous?: number | null;
  estimate?: number | null;
}

// FMP API Response Structures (simplified, expand as needed)
interface FmpEconomicEvent {
  date: string; // "2023-10-18 21:00:00"
  event: string;
  country: string;
  actual: number | null;
  previous: number | null;
  change: number | null;
  changePercentage: number | null;
  estimate: number | null;
  impact: 'High' | 'Medium' | 'Low' | string; // API might return capitalized or other strings
}

interface FmpEarningsEvent {
  date: string; // "2023-10-18"
  symbol: string;
  eps: number | null;
  epsEstimated: number | null;
  time: string; // "bmo", "amc", "dmh"
  revenue: number | null;
  revenueEstimated: number | null;
  // there might be more fields like fiscalDateEnding
}

interface FmpDividendEvent {
  date: string; // "2023-10-20" (likely exDividendDate)
  label: string; // "October 20, 23"
  adjDividend: number;
  symbol: string;
  dividend: number;
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
}

interface FmpMarketHoliday {
  // Structure: { "New Years Day": "2023-01-01", ... }
  [holidayName: string]: string; 
}

interface FmpMarketHolidaysResponseItem {
    year: number;
    // Holiday names are keys
    [holidayName: string]: string | number;
}

interface FmpMarketHolidaysResponse {
    stockMarketHolidays: FmpMarketHolidaysResponseItem[];
    // ... other fields like isTheStockMarketOpen
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
const formatDateForApi = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const normalizeImpact = (impact: string | undefined | null): 'high' | 'medium' | 'low' | undefined => {
  if (!impact) return undefined;
  const lowerImpact = impact.toLowerCase();
  if (lowerImpact === 'high') return 'high';
  if (lowerImpact === 'medium') return 'medium';
  if (lowerImpact === 'low') return 'low';
  return undefined; 
};

// ---- Async Thunks ----
export const fetchCalendarEvents = createAsyncThunk<CalendarEvent[], { from: Date; to: Date }, { rejectValue: string }>(
  'tradingCalendar/fetchCalendarEvents',
  async ({ from, to }, { rejectWithValue }) => {
    const fromDateStr = formatDateForApi(from);
    const toDateStr = formatDateForApi(to);
    let allEvents: CalendarEvent[] = [];

    try {
      // 1. Fetch Economic Calendar Events
      const economicPromise = axios.get<FmpEconomicEvent[]>(`${FMP_API_BASE_URL}/economic_calendar?from=${fromDateStr}&to=${toDateStr}&apikey=${API_KEY}`);
      
      // 2. Fetch Earnings Calendar Events
      const earningsPromise = axios.get<FmpEarningsEvent[]>(`${FMP_API_BASE_URL}/earning_calendar?from=${fromDateStr}&to=${toDateStr}&apikey=${API_KEY}`);

      // 3. Fetch Dividend Calendar Events
      // Note: Dividend calendar uses 'stock_dividend_calendar'
      const dividendPromise = axios.get<FmpDividendEvent[]>(`${FMP_API_BASE_URL}/stock_dividend_calendar?from=${fromDateStr}&to=${toDateStr}&apikey=${API_KEY}`);
      
      // 4. Fetch Market Holidays
      // The /is-the-market-open endpoint returns holidays for multiple years. We'll filter for relevant ones.
      // This API doesn't strictly need from/to for holidays, but we fetch it once.
      const holidaysPromise = axios.get<FmpMarketHolidaysResponse>(`${FMP_API_BASE_URL}/is-the-market-open?apikey=${API_KEY}`);

      const [
        economicResponse, 
        earningsResponse, 
        dividendResponse, 
        holidaysResponse
      ] = await Promise.allSettled([economicPromise, earningsPromise, dividendPromise, holidaysPromise]);

      // Process Economic Events
      if (economicResponse.status === 'fulfilled' && economicResponse.value.data) {
        const economicEvents = economicResponse.value.data.map((event, index) => ({
          id: `economic-${event.date}-${index}`,
          date: event.date.split(' ')[0], // Keep only YYYY-MM-DD
          title: event.event,
          type: 'economic' as const,
          impact: normalizeImpact(event.impact),
          country: event.country,
          actual: event.actual,
          previous: event.previous,
          estimate: event.estimate,
        }));
        allEvents = allEvents.concat(economicEvents);
      } else if (economicResponse.status === 'rejected') {
        console.error('Failed to fetch economic events:', economicResponse.reason);
        // Optionally, accumulate errors to return a partial failure message
      }

      // Process Earnings Events
      if (earningsResponse.status === 'fulfilled' && earningsResponse.value.data) {
        const earningsEvents = earningsResponse.value.data.map((event, index) => ({
          id: `earnings-${event.symbol}-${event.date}-${index}`,
          date: event.date,
          title: `${event.symbol} Earnings (${event.time.toUpperCase()})`,
          description: `Est. EPS: ${event.epsEstimated ?? 'N/A'}, Act. EPS: ${event.eps ?? 'N/A'}`,
          type: 'earnings' as const,
          impact: 'high' as const, // Earnings usually high impact - Explicitly type literal
          symbol: event.symbol,
          estimate: event.epsEstimated,
          actual: event.eps,
        }));
        allEvents = allEvents.concat(earningsEvents);
      } else if (earningsResponse.status === 'rejected') {
        console.error('Failed to fetch earnings events:', earningsResponse.reason);
      }
      
      // Process Dividend Events
      if (dividendResponse.status === 'fulfilled' && dividendResponse.value.data) {
        const dividendEvents = dividendResponse.value.data.map((event, index) => ({
          id: `dividend-${event.symbol}-${event.date}-${index}`,
          date: event.date, // Assuming this is ex-date
          title: `${event.symbol} Dividend`,
          description: `Amount: ${event.adjDividend ?? event.dividend ?? 'N/A'}. Record: ${event.recordDate}, Payment: ${event.paymentDate}`,
          type: 'dividend' as const,
          impact: 'low' as const, // Default impact for dividends - Explicitly type literal
          symbol: event.symbol,
          actual: event.adjDividend ?? event.dividend,
        }));
        allEvents = allEvents.concat(dividendEvents);
      } else if (dividendResponse.status === 'rejected') {
        console.error('Failed to fetch dividend events:', dividendResponse.reason);
      }

      // Process Market Holidays
      if (holidaysResponse.status === 'fulfilled' && holidaysResponse.value.data && holidaysResponse.value.data.stockMarketHolidays) {
        const fromTime = from.getTime();
        const toTime = to.getTime();

        holidaysResponse.value.data.stockMarketHolidays.forEach(yearData => {
          Object.keys(yearData).forEach(key => {
            if (key === 'year') return;
            const holidayDateStr = yearData[key] as string;
            const holidayDate = new Date(holidayDateStr);
            // Ensure holiday falls within the requested from/to range
            if (holidayDate.getTime() >= fromTime && holidayDate.getTime() <= toTime) {
              allEvents.push({
                id: `holiday-${holidayDateStr}-${key.replace(/\s+/g, '-')}`,
                date: holidayDateStr,
                title: key, // Holiday name
                type: 'holiday' as const,
                impact: 'medium', // Default impact for holidays
                country: 'US', // Assuming US holidays from this endpoint
              });
            }
          });
        });
      } else if (holidaysResponse.status === 'rejected') {
         console.error('Failed to fetch market holidays:', holidaysResponse.reason);
      }
      
      // Sort events by date
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