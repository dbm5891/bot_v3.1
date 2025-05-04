import React, { useEffect, useRef } from 'react';
import { Box, useTheme } from '@mui/material';
import { createChart, ColorType, IChartApi } from 'lightweight-charts';

interface PerformanceData {
  date: string;
  value: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const theme = useTheme();

  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      // Clear existing chart if it exists
      if (chartRef.current) {
        chartRef.current.remove();
      }

      const isDarkMode = theme.palette.mode === 'dark';
      const textColor = isDarkMode ? '#FFFFFF' : '#191919';
      const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';

      // Create new chart
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor,
        },
        grid: {
          vertLines: { color: gridColor },
          horzLines: { color: gridColor },
        },
        rightPriceScale: {
          borderColor: gridColor,
        },
        timeScale: {
          borderColor: gridColor,
          timeVisible: true,
        },
        crosshair: {
          horzLine: { visible: false },
          vertLine: { visible: false },
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });

      const areaSeries = chart.addAreaSeries({
        topColor: 'rgba(33, 150, 243, 0.56)',
        bottomColor: 'rgba(33, 150, 243, 0.04)',
        lineColor: 'rgba(33, 150, 243, 1)',
        lineWidth: 2,
      });

      // Format data for the chart
      const formattedData = data.map(item => ({
        time: item.date,
        value: item.value,
      }));

      areaSeries.setData(formattedData);

      // Make chart responsive
      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({ 
            width: chartContainerRef.current.clientWidth 
          });
        }
      };

      window.addEventListener('resize', handleResize);
      chart.timeScale().fitContent();
      chartRef.current = chart;

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [data, theme.palette.mode]);

  return (
    <Box ref={chartContainerRef} sx={{ width: '100%', height: 300 }} />
  );
};

export default PerformanceChart;