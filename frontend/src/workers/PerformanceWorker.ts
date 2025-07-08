/**
 * Performance Web Worker
 * Handles heavy computations in background to prevent UI blocking
 */

// Types for worker communication
interface WorkerMessage {
  id: string;
  type: string;
  payload: any;
}

interface WorkerResponse {
  id: string;
  type: string;
  result?: any;
  error?: string;
}

// Heavy computation functions
function calculatePortfolioMetrics(data: any[]) {
  const start = performance.now();
  
  // Simulate heavy calculations
  const returns = data.map((item, index) => {
    if (index === 0) return 0;
    return ((item.value - data[index - 1].value) / data[index - 1].value) * 100;
  });
  
  // Calculate volatility (standard deviation of returns)
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);
  
  // Calculate Sharpe ratio (simplified)
  const riskFreeRate = 2; // 2% annual risk-free rate
  const sharpeRatio = (avgReturn * 252 - riskFreeRate) / (volatility * Math.sqrt(252));
  
  // Calculate maximum drawdown
  let maxDrawdown = 0;
  let peak = data[0]?.value || 0;
  
  for (const item of data) {
    if (item.value > peak) {
      peak = item.value;
    }
    const drawdown = ((peak - item.value) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }
  
  // Calculate win rate for trades
  const positiveReturns = returns.filter(r => r > 0);
  const winRate = (positiveReturns.length / returns.length) * 100;
  
  const end = performance.now();
  console.log(`Portfolio metrics calculation took ${end - start} ms`);
  
  return {
    totalReturn: ((data[data.length - 1]?.value - data[0]?.value) / data[0]?.value) * 100,
    volatility,
    sharpeRatio,
    maxDrawdown,
    winRate,
    avgReturn: avgReturn * 252, // Annualized
    calculationTime: end - start
  };
}

function processBacktestData(rawData: any[]) {
  const start = performance.now();
  
  // Process and transform large datasets
  const processedData = rawData.map((item, index) => {
    // Simulate complex transformations
    const movingAverage = rawData
      .slice(Math.max(0, index - 20), index + 1)
      .reduce((sum, d) => sum + d.value, 0) / Math.min(21, index + 1);
    
    const rsi = calculateRSI(rawData.slice(0, index + 1));
    const bollinger = calculateBollingerBands(rawData.slice(Math.max(0, index - 20), index + 1));
    
    return {
      ...item,
      movingAverage,
      rsi,
      bollingerUpper: bollinger.upper,
      bollingerLower: bollinger.lower,
      signal: generateTradingSignal(item.value, movingAverage, rsi)
    };
  });
  
  const end = performance.now();
  console.log(`Backtest data processing took ${end - start} ms`);
  
  return {
    processedData,
    processingTime: end - start,
    dataPoints: rawData.length
  };
}

function calculateRSI(data: any[], period: number = 14) {
  if (data.length < period + 1) return 50; // Default RSI
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].value - data[i - 1].value;
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Calculate RSI for remaining data
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].value - data[i - 1].value;
    if (change > 0) {
      avgGain = ((avgGain * (period - 1)) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = ((avgLoss * (period - 1)) + Math.abs(change)) / period;
    }
  }
  
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateBollingerBands(data: any[], period: number = 20, multiplier: number = 2) {
  if (data.length < period) {
    const avg = data.reduce((sum, d) => sum + d.value, 0) / data.length;
    return { upper: avg, lower: avg, middle: avg };
  }
  
  const values = data.slice(-period).map(d => d.value);
  const avg = values.reduce((sum, v) => sum + v, 0) / period;
  
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  
  return {
    upper: avg + (stdDev * multiplier),
    lower: avg - (stdDev * multiplier),
    middle: avg
  };
}

function generateTradingSignal(price: number, ma: number, rsi: number) {
  if (price > ma && rsi > 50 && rsi < 70) return 'BUY';
  if (price < ma && rsi < 50 && rsi > 30) return 'SELL';
  if (rsi > 80) return 'STRONG_SELL';
  if (rsi < 20) return 'STRONG_BUY';
  return 'HOLD';
}

function optimizeChartData(data: any[], maxPoints: number = 1000) {
  const start = performance.now();
  
  if (data.length <= maxPoints) {
    return { optimizedData: data, reduction: 0 };
  }
  
  // Use adaptive sampling to reduce data points while preserving trends
  const step = data.length / maxPoints;
  const optimizedData = [];
  
  for (let i = 0; i < data.length; i += step) {
    const index = Math.floor(i);
    if (index < data.length) {
      optimizedData.push(data[index]);
    }
  }
  
  // Always include the last point
  if (optimizedData[optimizedData.length - 1] !== data[data.length - 1]) {
    optimizedData.push(data[data.length - 1]);
  }
  
  const end = performance.now();
  
  return {
    optimizedData,
    reduction: ((data.length - optimizedData.length) / data.length) * 100,
    optimizationTime: end - start,
    originalPoints: data.length,
    optimizedPoints: optimizedData.length
  };
}

// Handle messages from main thread
self.onmessage = function(event: MessageEvent<WorkerMessage>) {
  const { id, type, payload } = event.data;
  
  try {
    let result;
    
    switch (type) {
      case 'CALCULATE_PORTFOLIO_METRICS':
        result = calculatePortfolioMetrics(payload.data);
        break;
        
      case 'PROCESS_BACKTEST_DATA':
        result = processBacktestData(payload.data);
        break;
        
      case 'OPTIMIZE_CHART_DATA':
        result = optimizeChartData(payload.data, payload.maxPoints);
        break;
        
      case 'CALCULATE_RSI':
        result = calculateRSI(payload.data, payload.period);
        break;
        
      case 'CALCULATE_BOLLINGER_BANDS':
        result = calculateBollingerBands(payload.data, payload.period, payload.multiplier);
        break;
        
      default:
        throw new Error(`Unknown worker task type: ${type}`);
    }
    
    const response: WorkerResponse = {
      id,
      type: `${type}_COMPLETE`,
      result
    };
    
    self.postMessage(response);
    
  } catch (error) {
    const response: WorkerResponse = {
      id,
      type: `${type}_ERROR`,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    self.postMessage(response);
  }
};

// Signal that worker is ready
self.postMessage({
  id: 'init',
  type: 'WORKER_READY'
});

export {}; // Make this a module