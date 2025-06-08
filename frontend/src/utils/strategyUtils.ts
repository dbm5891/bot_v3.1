/**
 * Utility functions for working with strategy data
 */

// Define the shape of the strategy object from the backend/state
export interface Strategy {
  id: string;
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  [key: string]: any;
}

// Define the shape needed for the StrategyStatsCard component
export interface StrategyStats {
  id: string;
  name: string;
  isActive: boolean;
  returns: number;
  trades: number;
  winRate: number;
  lastUpdated: string;
  description?: string;
}

/**
 * Transform strategy data to the format needed for the StrategyStatsCard
 * @param strategies Array of strategies from the backend/state
 * @returns Formatted strategies with performance stats
 */
export const transformStrategyData = (strategies: Strategy[]): StrategyStats[] => {
  if (!strategies || !Array.isArray(strategies)) return [];
  
  return strategies.map(strategy => {
    // Extract strategy performance data or use default values
    // In a real application, this data would come from the backend
    const returns = strategy.performance?.returns || Math.random() * 20 - 5; // Mock data: -5 to +15%
    const trades = strategy.performance?.trades || Math.floor(Math.random() * 100); // Mock data: 0-100 trades
    const winRate = strategy.performance?.winRate || Math.random() * 40 + 40; // Mock data: 40-80% win rate
    
    return {
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      isActive: strategy.status === 'active',
      returns: returns,
      trades: trades,
      winRate: winRate,
      lastUpdated: strategy.updatedAt || new Date().toISOString().split('T')[0]
    };
  });
}; 