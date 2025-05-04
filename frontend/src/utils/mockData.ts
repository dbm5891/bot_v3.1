// Mock data to use when API calls fail or during development
import { MarketData } from '../store/slices/dataSlice';
import { Strategy } from '../store/slices/strategySlice';
import { BacktestResult } from '../store/slices/backtestingSlice';

// Mock available market data
export const mockAvailableData: MarketData[] = [
  {
    id: '1',
    symbol: 'AAPL',
    timeframe: '1d',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    recordCount: 252,
    source: 'csv',
    hasIndicators: true,
    fileSize: '52KB',
    lastUpdated: '2024-04-15',
  },
  {
    id: '2',
    symbol: 'MSFT',
    timeframe: '1d',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    recordCount: 252,
    source: 'csv',
    hasIndicators: true,
    fileSize: '48KB',
    lastUpdated: '2024-04-15',
  },
  {
    id: '3',
    symbol: 'TSLA',
    timeframe: '1d',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    recordCount: 252,
    source: 'csv',
    hasIndicators: false,
    fileSize: '50KB',
    lastUpdated: '2024-04-15',
  },
];

// Mock symbols
export const mockSymbols = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'META', 'NVDA'];

// Mock strategies
export const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'Moving Average Crossover',
    description: 'Simple strategy using SMA crossovers',
    type: 'custom',
    parameters: [
      {
        name: 'shortPeriod',
        type: 'number',
        value: 10
      },
      {
        name: 'longPeriod',
        type: 'number',
        value: 50
      }
    ],
    indicators: ['SMA'],
    createdAt: '2024-03-15',
    updatedAt: '2024-04-10',
  },
  {
    id: '2',
    name: 'RSI Overbought/Oversold',
    description: 'Uses RSI indicator to find entry/exit points',
    type: 'custom',
    parameters: [
      {
        name: 'rsiPeriod',
        type: 'number',
        value: 14
      },
      {
        name: 'overbought',
        type: 'number',
        value: 70
      },
      {
        name: 'oversold',
        type: 'number',
        value: 30
      }
    ],
    indicators: ['RSI'],
    createdAt: '2024-02-20',
    updatedAt: '2024-04-05',
  },
];

// Mock backtest results
export const mockBacktestResults: BacktestResult[] = [
  {
    id: '1',
    strategyId: '1',
    strategyName: 'Moving Average Crossover',
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
    createdAt: '2024-04-01',
  },
  {
    id: '2',
    strategyId: '2',
    strategyName: 'RSI Overbought/Oversold',
    symbol: 'MSFT',
    timeframe: '1d',
    startDate: '2023-01-01',
    endDate: '2023-12-31',
    initialBalance: 10000,
    finalBalance: 11200,
    roi: 12.0,
    maxDrawdown: 6.5,
    sharpeRatio: 0.9,
    winRate: 58,
    trades: 35,
    createdAt: '2024-04-02',
  },
];

// Check if we're in development mode
export const isDevelopment = true;