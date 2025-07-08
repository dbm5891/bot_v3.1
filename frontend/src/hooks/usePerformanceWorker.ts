import { useEffect, useRef, useCallback, useState } from 'react';

interface WorkerMessage {
  id: string;
  type: string;
  payload?: any;
}

interface WorkerResponse {
  id: string;
  type: string;
  result?: any;
  error?: string;
}

interface WorkerTask {
  id: string;
  resolve: (result: any) => void;
  reject: (error: any) => void;
  startTime: number;
}

export function usePerformanceWorker() {
  const workerRef = useRef<Worker | null>(null);
  const tasksRef = useRef<Map<string, WorkerTask>>(new Map());
  const [isReady, setIsReady] = useState(false);
  const [activeTasksCount, setActiveTasksCount] = useState(0);

  useEffect(() => {
    // Create worker instance
    try {
      const worker = new Worker(new URL('../workers/PerformanceWorker.ts', import.meta.url), {
        type: 'module'
      });

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        const { id, type, result, error } = event.data;

        // Handle worker ready signal
        if (type === 'WORKER_READY') {
          setIsReady(true);
          return;
        }

        // Handle task completion
        const task = tasksRef.current.get(id);
        if (task) {
          const duration = performance.now() - task.startTime;
          console.log(`Worker task ${type} completed in ${duration.toFixed(2)}ms`);

          tasksRef.current.delete(id);
          setActiveTasksCount(prev => prev - 1);

          if (error) {
            task.reject(new Error(error));
          } else {
            task.resolve(result);
          }
        }
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
        // Reject all pending tasks
        tasksRef.current.forEach(task => {
          task.reject(new Error('Worker error'));
        });
        tasksRef.current.clear();
        setActiveTasksCount(0);
      };

      workerRef.current = worker;

      return () => {
        worker.terminate();
        tasksRef.current.clear();
        setActiveTasksCount(0);
      };
    } catch (error) {
      console.warn('Web Workers not supported, falling back to main thread');
    }
  }, []);

  const executeTask = useCallback(<T = any>(type: string, payload?: any): Promise<T> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current || !isReady) {
        reject(new Error('Worker not available'));
        return;
      }

      const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const task: WorkerTask = {
        id,
        resolve,
        reject,
        startTime: performance.now()
      };

      tasksRef.current.set(id, task);
      setActiveTasksCount(prev => prev + 1);

      const message: WorkerMessage = {
        id,
        type,
        payload
      };

      workerRef.current.postMessage(message);

      // Add timeout for long-running tasks
      setTimeout(() => {
        if (tasksRef.current.has(id)) {
          tasksRef.current.delete(id);
          setActiveTasksCount(prev => prev - 1);
          reject(new Error('Worker task timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }, [isReady]);

  // Convenience methods for specific tasks
  const calculatePortfolioMetrics = useCallback((data: any[]) => {
    return executeTask('CALCULATE_PORTFOLIO_METRICS', { data });
  }, [executeTask]);

  const processBacktestData = useCallback((data: any[]) => {
    return executeTask('PROCESS_BACKTEST_DATA', { data });
  }, [executeTask]);

  const optimizeChartData = useCallback((data: any[], maxPoints: number = 1000) => {
    return executeTask('OPTIMIZE_CHART_DATA', { data, maxPoints });
  }, [executeTask]);

  const calculateRSI = useCallback((data: any[], period: number = 14) => {
    return executeTask('CALCULATE_RSI', { data, period });
  }, [executeTask]);

  const calculateBollingerBands = useCallback((data: any[], period: number = 20, multiplier: number = 2) => {
    return executeTask('CALCULATE_BOLLINGER_BANDS', { data, period, multiplier });
  }, [executeTask]);

  return {
    isReady,
    activeTasksCount,
    executeTask,
    calculatePortfolioMetrics,
    processBacktestData,
    optimizeChartData,
    calculateRSI,
    calculateBollingerBands
  };
}

// Fallback functions for when worker is not available
export function calculatePortfolioMetricsFallback(data: any[]) {
  const returns = data.map((item, index) => {
    if (index === 0) return 0;
    return ((item.value - data[index - 1].value) / data[index - 1].value) * 100;
  });

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance);

  const riskFreeRate = 2;
  const sharpeRatio = (avgReturn * 252 - riskFreeRate) / (volatility * Math.sqrt(252));

  let maxDrawdown = 0;
  let peak = data[0]?.value || 0;

  for (const item of data) {
    if (item.value > peak) {
      peak = item.value;
    }
    const drawdown = ((peak - item.value) / peak) * 100;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
  }

  const positiveReturns = returns.filter(r => r > 0);
  const winRate = (positiveReturns.length / returns.length) * 100;

  return {
    totalReturn: ((data[data.length - 1]?.value - data[0]?.value) / data[0]?.value) * 100,
    volatility,
    sharpeRatio,
    maxDrawdown,
    winRate,
    avgReturn: avgReturn * 252
  };
}