import React, { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, IChartApi } from 'lightweight-charts';
import { BacktestResult } from '../../store/slices/backtestingSlice';
import { useTheme } from '../../components/ui/theme-provider';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

interface BacktestingChartProps {
  backtest: BacktestResult;
}

const BacktestingChart: React.FC<BacktestingChartProps> = ({ backtest }) => {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<'equity' | 'drawdown' | 'trades'>('equity');

  // Theme-aware chart colors
  const chartColors = useMemo(() => ({
    background: 'transparent',
    text: theme === 'dark' ? '#E1E1E6' : '#1A1A1A',
    grid: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    border: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    equity: {
      line: theme === 'dark' ? '#3B82F6' : '#2962FF',
      topColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.4)' : 'rgba(41, 98, 255, 0.56)',
      bottomColor: theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(41, 98, 255, 0.04)',
    },
    drawdown: {
      line: theme === 'dark' ? '#EF4444' : '#F44336',
      topColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(244, 67, 54, 0.04)',
      bottomColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(244, 67, 54, 0.56)',
    },
    trades: {
      long: theme === 'dark' ? '#22C55E' : '#4CAF50',
      short: theme === 'dark' ? '#EF4444' : '#F44336',
    },
  }), [theme]);

  // Generate equity curve from trades
  const generateEquityCurve = () => {
    let equity = backtest.initialCapital;
    const equityCurve = [{
      time: new Date(backtest.startDate).toISOString().split('T')[0],
      value: equity,
    }];

    // Sort trades chronologically
    const sortedTrades = Array.isArray(backtest.trades) ? [...backtest.trades].sort(
      (a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime()
    ) : [];

    // Add equity points for each trade
    sortedTrades.forEach((trade: any) => {
      equity += trade.profit;
      equityCurve.push({
        time: new Date(trade.exitDate).toISOString().split('T')[0],
        value: equity,
      });
    });

    return equityCurve;
  };

  // Generate drawdown curve
  const generateDrawdownCurve = () => {
    const equityCurve = generateEquityCurve();
    let peakEquity = backtest.initialCapital;
    
    return equityCurve.map((point: any) => {
      if (typeof point.value !== 'number') return { ...point, value: 0 };
      peakEquity = Math.max(
        typeof peakEquity === 'number' ? peakEquity : 0,
        typeof point.value === 'number' ? point.value : 0
      );
      const drawdown = peakEquity > 0 ? (peakEquity - point.value) / peakEquity : 0;
      return {
        time: point.time,
        value: drawdown * -100, // Negative percentage for visualization
      };
    });
  };

  // Update trade points with theme colors
  const generateTradePoints = () => {
    const trades = Array.isArray(backtest.trades) ? backtest.trades : [];
    const longEntries = trades
      .filter((t: any) => t.direction === 'long')
      .map((t: any) => ({
        time: new Date(t.entryDate).toISOString().split('T')[0],
        position: 'belowBar' as const,
        color: chartColors.trades.long,
        shape: 'arrowUp' as const,
        text: 'LONG'
      }));

    const longExits = trades
      .filter((t: any) => t.direction === 'long')
      .map((t: any) => ({
        time: new Date(t.exitDate).toISOString().split('T')[0],
        position: 'aboveBar' as const,
        color: chartColors.trades.long,
        shape: 'arrowDown' as const,
        text: 'EXIT'
      }));

    const shortEntries = trades
      .filter((t: any) => t.direction === 'short')
      .map((t: any) => ({
        time: new Date(t.entryDate).toISOString().split('T')[0],
        position: 'aboveBar' as const,
        color: chartColors.trades.short,
        shape: 'arrowDown' as const,
        text: 'SHORT'
      }));

    const shortExits = trades
      .filter((t: any) => t.direction === 'short')
      .map((t: any) => ({
        time: new Date(t.exitDate).toISOString().split('T')[0],
        position: 'belowBar' as const,
        color: chartColors.trades.short,
        shape: 'arrowUp' as const,
        text: 'EXIT'
      }));

    return [...longEntries, ...longExits, ...shortEntries, ...shortExits];
  };

  useEffect(() => {
    if (chartContainerRef.current) {
      // Clean up previous chart if it exists
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { color: chartColors.background },
          textColor: chartColors.text,
        },
        grid: {
          vertLines: {
            color: chartColors.grid,
          },
          horzLines: {
            color: chartColors.grid,
          },
        },
        rightPriceScale: {
          borderColor: chartColors.border,
        },
        timeScale: {
          borderColor: chartColors.border,
          timeVisible: true,
        },
        crosshair: {
          mode: 0,
          vertLine: {
            color: chartColors.text,
            labelBackgroundColor: chartColors.background,
          },
          horzLine: {
            color: chartColors.text,
            labelBackgroundColor: chartColors.background,
          },
        },
      });

      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({
            width: chartContainerRef.current.clientWidth,
          });
        }
      };

      let series;
      if (chartType === 'equity') {
        series = chart.addAreaSeries({
          lineColor: chartColors.equity.line,
          topColor: chartColors.equity.topColor,
          bottomColor: chartColors.equity.bottomColor,
          lineWidth: 2,
          priceFormat: {
            type: 'price',
            precision: 2,
            minMove: 0.01,
          },
        });
        series.setData(generateEquityCurve());
      } else if (chartType === 'drawdown') {
        series = chart.addAreaSeries({
          lineColor: chartColors.drawdown.line,
          topColor: chartColors.drawdown.topColor,
          bottomColor: chartColors.drawdown.bottomColor,
          lineWidth: 2,
          priceFormat: {
            type: 'percent',
            precision: 2,
          },
        });
        series.setData(generateDrawdownCurve());
      } else if (chartType === 'trades') {
        series = chart.addAreaSeries({
          lineColor: chartColors.equity.line,
          topColor: chartColors.equity.topColor,
          bottomColor: chartColors.equity.bottomColor,
          lineWidth: 2,
        });
        series.setData(generateEquityCurve());
        series.setMarkers(generateTradePoints());
      }

      window.addEventListener('resize', handleResize);
      chart.timeScale().fitContent();
      chartRef.current = chart;

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [backtest, chartType, chartColors]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <Button
          variant={chartType === 'equity' ? 'secondary' : 'outline'}
          onClick={() => setChartType('equity')}
          className={cn(
            "flex-1",
            chartType === 'equity' && "bg-secondary text-secondary-foreground"
          )}
        >
          Equity Curve
        </Button>
        <Button
          variant={chartType === 'drawdown' ? 'secondary' : 'outline'}
          onClick={() => setChartType('drawdown')}
          className={cn(
            "flex-1",
            chartType === 'drawdown' && "bg-secondary text-secondary-foreground"
          )}
        >
          Drawdown
        </Button>
        <Button
          variant={chartType === 'trades' ? 'secondary' : 'outline'}
          onClick={() => setChartType('trades')}
          className={cn(
            "flex-1",
            chartType === 'trades' && "bg-secondary text-secondary-foreground"
          )}
        >
          Trades
        </Button>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};

export default BacktestingChart;