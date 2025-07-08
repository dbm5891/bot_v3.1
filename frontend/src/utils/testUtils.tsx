import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { vi } from 'vitest';
import { RootState } from '../store';

// Types
interface WrapperProps {
  children: React.ReactNode;
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialState?: any;
  store?: any;
  route?: string;
}

// Deep merge function to merge state objects
function deepMerge(target: any, source: any): any {
  const output = { ...target };
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = deepMerge(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

function isObject(item: any): boolean {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Default initial state for tests
const defaultInitialState: RootState = {
  ui: {
    darkMode: false,
    currentView: 'dashboard',
    loading: false,
    notifications: [],
    sidebarOpen: true,
  },
  strategy: {
    strategies: [],
    currentStrategy: null,
    loading: false,
    error: null,
  },
  data: {
    availableData: [],
    currentData: null,
    symbols: [],
    timeframes: ['1m', '5m', '15m', '1h', '1d'],
    loading: false,
    error: null,
  },
  backtesting: {
    results: [],
    currentBacktest: null,
    currentBacktestConfig: null,
    loading: false,
    error: null,
  },
  portfolio: {
    performanceData: [],
    benchmarkData: [],
    metrics: {
      totalReturn: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
    },
    loading: false,
    error: null,
  },
  marketData: {
    indices: [
      {
        symbol: '^GSPC',
        name: 'S&P 500',
        price: 4500.00,
        changesPercentage: 0.75,
        change: 33.75,
        dayLow: 4466.25,
        dayHigh: 4510.50,
        yearHigh: 4800.00,
        yearLow: 4100.00,
        marketCap: null,
        priceAvg50: 4450.00,
        priceAvg200: 4300.00,
        volume: 2500000000,
        avgVolume: 2300000000,
        exchange: 'INDEX',
        open: 4475.00,
        previousClose: 4466.25,
        eps: null,
        pe: null,
        earningsAnnouncement: null,
        sharesOutstanding: null,
        timestamp: Date.now(),
      },
      {
        symbol: '^IXIC',
        name: 'NASDAQ Composite',
        price: 14200.00,
        changesPercentage: 1.25,
        change: 175.00,
        dayLow: 14025.00,
        dayHigh: 14225.00,
        yearHigh: 15000.00,
        yearLow: 12500.00,
        marketCap: null,
        priceAvg50: 14100.00,
        priceAvg200: 13800.00,
        volume: 3500000000,
        avgVolume: 3200000000,
        exchange: 'INDEX',
        open: 14050.00,
        previousClose: 14025.00,
        eps: null,
        pe: null,
        earningsAnnouncement: null,
        sharesOutstanding: null,
        timestamp: Date.now(),
      },
      {
        symbol: '^DJI',
        name: 'Dow Jones Industrial Average',
        price: 35000.00,
        changesPercentage: -0.25,
        change: -87.50,
        dayLow: 34912.50,
        dayHigh: 35100.00,
        yearHigh: 36000.00,
        yearLow: 32000.00,
        marketCap: null,
        priceAvg50: 34800.00,
        priceAvg200: 34200.00,
        volume: 350000000,
        avgVolume: 320000000,
        exchange: 'INDEX',
        open: 35050.00,
        previousClose: 35087.50,
        eps: null,
        pe: null,
        earningsAnnouncement: null,
        sharesOutstanding: null,
        timestamp: Date.now(),
      },
    ],
    loading: false,
    error: null,
    lastUpdated: Date.now(),
  },
  tradingCalendar: {
    events: [
      {
        id: 'holiday-2024-01-15-MLK',
        date: '2024-01-15',
        title: 'Martin Luther King Jr. Day',
        type: 'holiday',
        impact: 'medium',
        country: 'US',
      },
    ],
    loading: false,
    error: null,
    lastUpdated: Date.now(),
  },
};

// Create mock store with thunk middleware
const mockStore = configureStore([thunk]);

// Custom render function
export function renderWithProviders(
  ui: ReactElement,
  {
    initialState = {},
    store,
    route = '/',
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Deep merge the provided initial state with the default state
  const mergedState = deepMerge(defaultInitialState, initialState);
  
  // Create store with merged state if no store provided
  const testStore = store || mockStore(mergedState);
  
  // Mock dispatch to handle thunks
  const originalDispatch = testStore.dispatch;
  testStore.dispatch = vi.fn().mockImplementation((action: any) => {
    if (typeof action === 'function') {
      // For thunks, just return a resolved promise
      return Promise.resolve();
    }
    return originalDispatch(action);
  });

  function Wrapper({ children }: WrapperProps) {
    return (
      <Provider store={testStore}>
        <MemoryRouter initialEntries={[route]}>
          {children}
        </MemoryRouter>
      </Provider>
    );
  }

  return {
    store: testStore,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Mock data generators
export const createMockStrategy = (overrides = {}) => ({
  id: '1',
  name: 'Test Strategy',
  description: 'A test strategy',
  type: 'custom',
  parameters: [],
  indicators: ['SMA', 'RSI'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides,
});

export const createMockBacktestResult = (overrides = {}) => ({
  id: '1',
  strategyId: '1',
  strategyName: 'Test Strategy',
  symbol: 'AAPL',
  timeframe: '1d',
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  initialBalance: 10000,
  finalBalance: 12500,
  roi: 25.0,
  maxDrawdown: 8.2,
  sharpeRatio: 1.3,
  winRate: 65,
  trades: 42,
  createdAt: '2024-01-01',
  ...overrides,
});

export const createMockMarketData = (overrides = {}) => ({
  id: '1',
  symbol: 'AAPL',
  timeframe: '1d',
  startDate: '2023-01-01',
  endDate: '2023-12-31',
  recordCount: 252,
  source: 'csv',
  hasIndicators: false,
  fileSize: '52KB',
  lastUpdated: '2024-01-01',
  ...overrides,
});

// Common test helpers
export const waitForLoadingToFinish = () => {
  return new Promise((resolve) => setTimeout(resolve, 0));
};

// Mock API responses
export const mockApiResponses = {
  strategies: {
    success: () => ({
      data: [createMockStrategy()],
      status: 200,
    }),
    error: () => {
      throw new Error('Failed to fetch strategies');
    },
  },
  marketData: {
    success: () => ({
      data: [createMockMarketData()],
      status: 200,
    }),
    error: () => {
      throw new Error('Failed to fetch market data');
    },
  },
  backtestResults: {
    success: () => ({
      data: [createMockBacktestResult()],
      status: 200,
    }),
    error: () => {
      throw new Error('Failed to fetch backtest results');
    },
  },
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';

// Export custom render as default
export { renderWithProviders as render }; 