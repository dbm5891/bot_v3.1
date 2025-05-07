/**
 * Utility function to generate synthetic performance data for the Analytics page
 * 
 * This function creates mock data for demonstration purposes.
 * In a production environment, this would be replaced with real data from the backend API.
 */

interface PerformanceDataPoint {
  date: string;
  value: number;
}

interface PerformanceMetrics {
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
}

interface PerformanceData {
  data: PerformanceDataPoint[];
  benchmarkData: PerformanceDataPoint[];
  metrics: PerformanceMetrics;
}

/**
 * Generate synthetic performance data based on the selected time range
 * 
 * @param timeRange - Time range to generate data for ('1m', '3m', '6m', '1y', 'all')
 * @returns Object containing performance data arrays and metrics
 */
export function generatePerformanceData(timeRange: string): PerformanceData {
  // Set data points based on time range
  let dataPoints = 0;
  let startValue = 10000;
  let startDate = new Date();
  
  switch(timeRange) {
    case '1m':
      dataPoints = 30;
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case '3m':
      dataPoints = 90;
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    case '6m':
      dataPoints = 180;
      startDate.setMonth(startDate.getMonth() - 6);
      break;
    case '1y':
      dataPoints = 365;
      startDate.setMonth(startDate.getMonth() - 12);
      break;
    case 'all':
      dataPoints = 730;
      startDate.setMonth(startDate.getMonth() - 24);
      break;
    default:
      dataPoints = 365;
      startDate.setMonth(startDate.getMonth() - 12);
  }
  
  // Generate portfolio data with some randomness and overall trend
  const data: PerformanceDataPoint[] = [];
  const benchmarkData: PerformanceDataPoint[] = [];
  
  let currentValue = startValue;
  let benchmarkValue = startValue;
  let maxValue = currentValue;
  let maxDrawdown = 0;
  let currentDate = new Date(startDate);
  
  // Track wins and losses for metrics
  let wins = 0;
  let losses = 0;
  let totalWinAmount = 0;
  let totalLossAmount = 0;
  
  for (let i = 0; i < dataPoints; i++) {
    // Portfolio value with some randomness and trend
    const dailyChange = Math.random() * 0.02 - 0.005; // Random daily change between -0.5% and 1.5%
    const trendFactor = 0.0003; // Small upward trend
    
    const prevValue = currentValue;
    currentValue = currentValue * (1 + dailyChange + trendFactor);
    
    // Track wins/losses
    if (currentValue > prevValue) {
      wins++;
      totalWinAmount += (currentValue - prevValue) / prevValue;
    } else {
      losses++;
      totalLossAmount += Math.abs((currentValue - prevValue) / prevValue);
    }
    
    // Calculate drawdown
    if (currentValue > maxValue) {
      maxValue = currentValue;
    } else {
      const drawdown = (maxValue - currentValue) / maxValue * 100;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    // Benchmark value (less volatile, lower trend)
    const benchmarkDailyChange = Math.random() * 0.015 - 0.005; // Random daily change between -0.5% and 1%
    const benchmarkTrendFactor = 0.0002; // Smaller upward trend
    benchmarkValue = benchmarkValue * (1 + benchmarkDailyChange + benchmarkTrendFactor);
    
    // Format date as MM/DD/YYYY
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
    
    data.push({
      date: formattedDate,
      value: parseFloat(currentValue.toFixed(2))
    });
    
    benchmarkData.push({
      date: formattedDate,
      value: parseFloat(benchmarkValue.toFixed(2))
    });
    
    // Increment date by 1 day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Calculate metrics
  const winRate = wins / (wins + losses) * 100;
  const avgWin = totalWinAmount / wins * 100;
  const avgLoss = totalLossAmount / losses * 100;
  const profitFactor = totalWinAmount / totalLossAmount;
  
  const totalReturn = ((data[data.length - 1].value - startValue) / startValue) * 100;
  const sharpeRatio = totalReturn / (maxDrawdown + 0.1); // Simple approximation
  
  return {
    data,
    benchmarkData,
    metrics: {
      totalReturn,
      maxDrawdown,
      sharpeRatio,
      winRate,
      avgWin,
      avgLoss,
      profitFactor
    }
  };
}