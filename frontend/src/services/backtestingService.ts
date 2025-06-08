import api from '../utils/api';

// Base URL for the API
const API_BASE_URL = '/api';

// Types
export interface BacktestConfig {
  strategyId: string;
  symbol: string;
  timeframe: string;
  strategy: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  positionSize: number;
  stopLoss?: number;
  takeProfit?: number;
  parameters: Record<string, any>;
}

export interface TradeDetail {
  id?: number;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  direction: string;
  profit: number;
  profitPercent: number;
  size?: number;
  type?: string;
}

export interface BacktestResult {
  id: string;
  strategyId?: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  initialBalance?: number;
  finalBalance?: number;
  initialCapital?: number;
  finalCapital?: number;
  totalReturn?: number;
  roi?: number;
  annualizedReturn?: number;
  maxDrawdown?: number;
  sharpeRatio: number;
  drawdown?: number;
  winRate: number;
  profitFactor?: number;
  trades: number;
  tradesCount?: number;
  tradesDetails?: TradeDetail[];
  createdAt?: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: Record<string, any>;
}

// Use the configured API instance
const apiClient = api;

export class BacktestingService {
  /**
   * Run a new backtest
   */
  static async runBacktest(config: BacktestConfig): Promise<BacktestResult> {
    try {
      const response = await apiClient.post<BacktestResult>('/api/backtest/run', config);
      return response.data;
    } catch (error) {
      console.error('Error running backtest:', error);
      throw new Error('Failed to run backtest. Please check your configuration and try again.');
    }
  }

  /**
   * Get backtest history
   */
  static async getBacktestHistory(): Promise<BacktestResult[]> {
    try {
      const response = await apiClient.get<BacktestResult[]>('/api/backtest/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching backtest history:', error);
      throw new Error('Failed to fetch backtest history.');
    }
  }

  /**
   * Get a specific backtest by ID
   */
  static async getBacktest(backtestId: string): Promise<BacktestResult> {
    try {
      const response = await apiClient.get<BacktestResult>(`/api/backtest/${backtestId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching backtest:', error);
      throw new Error('Failed to fetch backtest details.');
    }
  }

  /**
   * Get available strategies
   */
  static async getStrategies(): Promise<Strategy[]> {
    try {
      const response = await apiClient.get<Strategy[]>('/api/strategies');
      return response.data;
    } catch (error) {
      console.error('Error fetching strategies:', error);
      throw new Error('Failed to fetch available strategies.');
    }
  }

  /**
   * Get available symbols
   */
  static async getSymbols(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>('/api/symbols');
      return response.data;
    } catch (error) {
      console.error('Error fetching symbols:', error);
      throw new Error('Failed to fetch available symbols.');
    }
  }

  /**
   * Get available data information
   */
  static async getAvailableData(): Promise<any> {
    try {
      const response = await apiClient.get('/api/data/available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available data:', error);
      throw new Error('Failed to fetch available data information.');
    }
  }
}

export default BacktestingService; 