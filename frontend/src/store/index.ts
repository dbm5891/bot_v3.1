import { configureStore } from '@reduxjs/toolkit';
import backtestingReducer from './slices/backtestingSlice';
import strategyReducer from './slices/strategySlice';
import dataReducer from './slices/dataSlice';
import uiReducer from './slices/uiSlice';
import portfolioReducer from './slices/portfolioSlice';
import marketDataReducer from './slices/marketDataSlice';
import tradingCalendarReducer from './slices/tradingCalendarSlice';

export const store = configureStore({
  reducer: {
    backtesting: backtestingReducer,
    strategy: strategyReducer,
    data: dataReducer,
    ui: uiReducer,
    portfolio: portfolioReducer,
    marketData: marketDataReducer,
    tradingCalendar: tradingCalendarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;