import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, ToggleButtonGroup, ToggleButton, Typography } from '@mui/material';
import { createChart, IChartApi, LineStyle } from 'lightweight-charts';
import { BacktestResult } from '../../store/slices/backtestingSlice';

interface BacktestingChartProps {
  backtest: BacktestResult;
}

const BacktestingChart: React.FC<BacktestingChartProps> = ({ backtest }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartType, setChartType] = useState<'equity' | 'drawdown' | 'trades'>('equity');

  // Generate equity curve from trades
  const generateEquityCurve = () => {
    let equity = backtest.initialCapital;
    const equityCurve = [{
      time: new Date(backtest.startDate).toISOString().split('T')[0],
      value: equity,
    }];

    // Sort trades chronologically
    const sortedTrades = [...backtest.trades].sort(
      (a, b) => new Date(a.exitDate).getTime() - new Date(b.exitDate).getTime()
    );

    // Add equity points for each trade
    sortedTrades.forEach(trade => {
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
    
    return equityCurve.map(point => {
      peakEquity = Math.max(peakEquity, point.value);
      const drawdown = peakEquity > 0 ? (peakEquity - point.value) / peakEquity : 0;
      
      return {
        time: point.time,
        value: drawdown * -100, // Negative percentage for visualization
      };
    });
  };

  // Generate trade points
  const generateTradePoints = () => {
    const longEntries = backtest.trades
      .filter(t => t.direction === 'long')
      .map(t => ({
        time: new Date(t.entryDate).toISOString().split('T')[0],
        position: 'belowBar',
        color: '#4CAF50',
        shape: 'arrowUp',
        text: 'LONG'
      }));

    const longExits = backtest.trades
      .filter(t => t.direction === 'long')
      .map(t => ({
        time: new Date(t.exitDate).toISOString().split('T')[0],
        position: 'aboveBar',
        color: '#4CAF50',
        shape: 'arrowDown',
        text: 'EXIT'
      }));

    const shortEntries = backtest.trades
      .filter(t => t.direction === 'short')
      .map(t => ({
        time: new Date(t.entryDate).toISOString().split('T')[0],
        position: 'aboveBar',
        color: '#F44336',
        shape: 'arrowDown',
        text: 'SHORT'
      }));

    const shortExits = backtest.trades
      .filter(t => t.direction === 'short')
      .map(t => ({
        time: new Date(t.exitDate).toISOString().split('T')[0],
        position: 'belowBar',
        color: '#F44336',
        shape: 'arrowUp',
        text: 'EXIT'
      }));

    return [...longEntries, ...longExits, ...shortEntries, ...shortExits];
  };

  const handleChartTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: 'equity' | 'drawdown' | 'trades' | null,
  ) => {
    if (newType !== null) {
      setChartType(newType);
    }
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
          background: { color: 'transparent' },
          textColor: '#D9D9D9',
        },
        grid: {
          vertLines: {
            color: 'rgba(197, 203, 206, 0.1)',
          },
          horzLines: {
            color: 'rgba(197, 203, 206, 0.1)',
          },
        },
        rightPriceScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
        },
        timeScale: {
          borderColor: 'rgba(197, 203, 206, 0.8)',
          timeVisible: true,
        },
        crosshair: {
          mode: 0,
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
          lineColor: '#2962FF',
          topColor: 'rgba(41, 98, 255, 0.56)',
          bottomColor: 'rgba(41, 98, 255, 0.04)',
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
          lineColor: '#F44336',
          topColor: 'rgba(244, 67, 54, 0.04)',
          bottomColor: 'rgba(244, 67, 54, 0.56)',
          lineWidth: 2,
          priceFormat: {
            type: 'percent',
            precision: 2,
          },
        });
        series.setData(generateDrawdownCurve());
      } else if (chartType === 'trades') {
        // For trades view, show both equity and trade markers
        series = chart.addAreaSeries({
          lineColor: '#2962FF',
          topColor: 'rgba(41, 98, 255, 0.56)',
          bottomColor: 'rgba(41, 98, 255, 0.04)',
          lineWidth: 2,
        });
        series.setData(generateEquityCurve());
        
        // Add trade markers
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
  }, [backtest, chartType]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="subtitle1">Performance Visualization</Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="equity">Equity Curve</ToggleButton>
          <ToggleButton value="drawdown">Drawdown</ToggleButton>
          <ToggleButton value="trades">Trades</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box ref={chartContainerRef} sx={{ height: 400 }} />
    </Paper>
  );
};

export default BacktestingChart;