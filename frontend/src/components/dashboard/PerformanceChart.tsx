import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme, ButtonGroup, Button, Tooltip } from '@mui/material';
import { createChart, ColorType, IChartApi, SeriesType, Time, LineStyle } from 'lightweight-charts';

interface PerformanceData {
  date: string;
  value: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  compareData?: PerformanceData[]; // Optional comparison data series
  title?: string;
}

// Time range options for chart display
const timeRanges = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'YTD', days: 0 }, // Special case for Year-to-Date
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 0 } // Special case for all data
];

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, compareData, title = 'Portfolio Performance' }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const theme = useTheme();
  const [selectedRange, setSelectedRange] = useState('ALL');
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  // Filter data based on selected time range
  const getFilteredData = (sourceData: PerformanceData[], range: string) => {
    if (!sourceData || sourceData.length === 0) return [];
    
    if (range === 'ALL') return sourceData;
    
    const now = new Date();
    let cutoffDate: Date;
    
    // Handle YTD (Year to Date)
    if (range === 'YTD') {
      cutoffDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
    } else {
      // Get days from the selected range
      const days = timeRanges.find(r => r.label === range)?.days || 0;
      cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - days);
    }
    
    return sourceData.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= cutoffDate;
    });
  };

  // Calculate percentage change from first value
  const calculatePercentageChange = (sourceData: PerformanceData[]) => {
    if (!sourceData || sourceData.length === 0) return [];
    
    const baseValue = sourceData[0].value;
    
    return sourceData.map(item => ({
      time: item.date as Time,
      value: ((item.value - baseValue) / baseValue) * 100
    }));
  };

  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      // Clear existing chart if it exists
      if (chartRef.current) {
        chartRef.current.remove();
      }

      const isDarkMode = theme.palette.mode === 'dark';
      const textColor = isDarkMode ? '#FFFFFF' : '#191919';
      const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)';
      const primaryColor = theme.palette.primary.main;
      const secondaryColor = theme.palette.secondary.main;

      // Create new chart
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor,
          fontFamily: theme.typography.fontFamily,
        },
        grid: {
          vertLines: { color: gridColor, style: LineStyle.Dotted },
          horzLines: { color: gridColor, style: LineStyle.Dotted },
        },
        rightPriceScale: {
          borderColor: gridColor,
        },
        timeScale: {
          borderColor: gridColor,
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 1, // Magnet mode
          horzLine: { 
            visible: true,
            labelVisible: true,
          },
          vertLine: { 
            visible: true,
            labelVisible: true,
            style: LineStyle.Dashed,
          },
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
      });

      const filteredData = getFilteredData(data, selectedRange);
      const filteredCompareData = compareData ? getFilteredData(compareData, selectedRange) : null;
      
      // Show absolute values or percentage change (currently showing absolute values)
      const formattedData = filteredData.map(item => ({
        time: item.date as Time,
        value: item.value,
      }));
      
      // Add main data series
      const areaSeries = chart.addAreaSeries({
        topColor: `${primaryColor}80`, // With opacity
        bottomColor: `${primaryColor}10`,
        lineColor: primaryColor,
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: 2,
          minMove: 0.01,
        },
        title: 'Performance',
      });
      
      areaSeries.setData(formattedData);

      // Add comparison data series if provided
      if (filteredCompareData && filteredCompareData.length > 0) {
        const compareFormattedData = filteredCompareData.map(item => ({
          time: item.date as Time,
          value: item.value,
        }));
        
        const compareSeries = chart.addLineSeries({
          color: secondaryColor,
          lineWidth: 2,
          lineStyle: LineStyle.Dashed,
          title: 'Benchmark',
        });
        
        compareSeries.setData(compareFormattedData);
      }

      // Add tooltip for detailed information on hover
      chart.subscribeCrosshairMove((param) => {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.y < 0
        ) {
          setHoveredValue(null);
          return;
        }

        const seriesData = param.seriesData.get(areaSeries);
        if (seriesData && 'value' in seriesData) {
          setHoveredValue(seriesData.value as number);
        }
      });

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
  }, [data, compareData, theme.palette.mode, selectedRange, theme.palette.primary.main, theme.palette.secondary.main, theme.typography.fontFamily]);

  return (
    <Box sx={{ width: '100%', height: 350, position: 'relative' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        {hoveredValue !== null && (
          <Box sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            {selectedRange === 'ALL' || selectedRange === 'YTD'
              ? `Value: $${hoveredValue.toFixed(2)}`
              : `Change: ${hoveredValue.toFixed(2)}%`}
          </Box>
        )}
        <ButtonGroup size="small" sx={{ ml: 'auto' }}>
          {timeRanges.map((range) => (
            <Tooltip key={range.label} title={range.label === 'YTD' ? 'Year to Date' : ''}>
              <Button 
                variant={selectedRange === range.label ? 'contained' : 'outlined'}
                onClick={() => setSelectedRange(range.label)}
              >
                {range.label}
              </Button>
            </Tooltip>
          ))}
        </ButtonGroup>
      </Box>
      <Box ref={chartContainerRef} sx={{ width: '100%', height: 300 }} />
    </Box>
  );
};

export default PerformanceChart;