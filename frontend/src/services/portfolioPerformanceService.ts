import api from '../utils/api';

// Define the structure of the portfolio performance data based on API documentation
export interface PortfolioPerformanceData {
  performanceData: Array<{ date: string; value: number }>;
  benchmarkData?: Array<{ date: string; value: number }>; // Optional benchmark data
  metrics: {
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
    // Add other relevant metrics as needed
  };
}

// Function to fetch portfolio performance data from the backend
export const fetchPortfolioPerformance = async (timeRange: string): Promise<PortfolioPerformanceData> => {
  try {
    const response = await api.get<PortfolioPerformanceData>('/api/portfolio/performance', {
      params: {
        timeRange: timeRange,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching portfolio performance data:', error);
    throw error; // Re-throw the error to be handled by the caller
  }
}; 