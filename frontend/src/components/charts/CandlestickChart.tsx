import { useEffect, useRef, useState, useMemo } from 'react';
import { Box, Typography, ButtonGroup, Button, FormControlLabel, Switch, Tooltip } from '@mui/material';
import { createChart, IChartApi, ISeriesApi, LineStyle, CrosshairMode, Time } from 'lightweight-charts';

// Define types for candlestick data
export interface CandlestickData {
  time: string | number; // Time can be a string like '2023-01-01' or a UNIX timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Define types for technical indicator data
export interface IndicatorData {
  time: string | number;
  value: number;
}

// Available indicator types
export type IndicatorType = 'sma' | 'ema' | 'bollinger' | 'rsi' | 'macd' | 'volume';

// Indicator config
interface Indicator {
  type: IndicatorType;
  name: string;
  data: IndicatorData[];
  visible: boolean;
  color: string;
  width: number;
  style: LineStyle;
  periods?: number; // For indicators like SMA/EMA that require period setting
}

// Chart properties
interface CandlestickChartProps {
  data: CandlestickData[];
  title?: string;
  showVolume?: boolean;
  width?: number;
  height?: number;
  indicators?: Indicator[];
  onTimeRangeChange?: (fromTime: number, toTime: number) => void;
}

// Time ranges for the chart
const timeRanges = [
  { label: '1D', days: 1 },
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'YTD', days: 0 }, // Special case for Year-to-Date
  { label: '1Y', days: 365 },
  { label: 'ALL', days: 0 } // Special case for all data
];

const CandlestickChart: React.FC<CandlestickChartProps> = ({
  data,
  title = 'Price Chart',
  showVolume = true,
  width,
  height = 500,
  indicators = [],
  onTimeRangeChange,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRefs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  
  const [selectedRange, setSelectedRange] = useState('ALL');
  const [hoverData, setHoverData] = useState<CandlestickData | null>(null);
  const [showIndicators, setShowIndicators] = useState(true);
  
  // Filter data for selected time range
  const getFilteredData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    if (selectedRange === 'ALL') return data;
    
    const now = new Date();
    let cutoffDate: Date;
    
    if (selectedRange === 'YTD') {
      cutoffDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
    } else {
      const days = timeRanges.find(r => r.label === selectedRange)?.days || 0;
      cutoffDate = new Date();
      cutoffDate.setDate(now.getDate() - days);
    }
    
    return data.filter(item => {
      const itemDate = typeof item.time === 'string' ? new Date(item.time) : new Date(item.time as number * 1000);
      return itemDate >= cutoffDate;
    });
  }, [data, selectedRange]);
  
  // Calculate price stats
  const getPriceStats = () => {
    if (!data || data.length === 0) return { change: 0, changePercent: 0, isPositive: false };
    
    const filteredData = getFilteredData();
    const firstCandle = filteredData[0];
    const lastCandle = filteredData[filteredData.length - 1];
    
    const change = lastCandle.close - firstCandle.open;
    const changePercent = (change / firstCandle.open) * 100;
    
    return {
      change,
      changePercent,
      isPositive: change >= 0,
    };
  };

  // Memoize formatted data for candlestick series
  const formattedData = useMemo(() => 
    getFilteredData.map((item: CandlestickData) => ({
      time: item.time as Time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    })), 
    [getFilteredData]
  );

  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      // Remove existing chart if it exists
      if (chartRef.current) {
        chartRef.current.remove();
        indicatorSeriesRefs.current.clear();
      }
      
      const filteredData = getFilteredData();
      
      // Create new chart
      const chart = createChart(chartContainerRef.current, {
        width: width || chartContainerRef.current.clientWidth,
        height: height,
        layout: {
          background: { color: 'transparent' },
          textColor: '#333',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        grid: {
          vertLines: { color: 'rgba(0, 0, 0, 0.06)', style: LineStyle.Dotted },
          horzLines: { color: 'rgba(0, 0, 0, 0.06)', style: LineStyle.Dotted },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { visible: true, labelVisible: true, style: LineStyle.Dashed },
          horzLine: { visible: true, labelVisible: true },
        },
        timeScale: {
          rightOffset: 5,
          barSpacing: 5,
          fixLeftEdge: true,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: true,
          borderColor: 'rgba(0, 0, 0, 0.06)',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: 'rgba(0, 0, 0, 0.06)',
        },
        handleScroll: {
          vertTouchDrag: false,
        },
      });
      
      // Add candlestick series
      const mainSeries = chart.addCandlestickSeries({
        upColor: '#4CAF50',
        downColor: '#FF5252',
        borderVisible: false,
        wickUpColor: '#4CAF50',
        wickDownColor: '#FF5252',
      });
      
      // Format and set data
      const formattedData = getFilteredData().map((item) => ({
        time: item.time as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));
      
      mainSeries.setData(formattedData);
      candleSeries.current = mainSeries;
      
      // Add volume histogram if enabled
      if (showVolume && filteredData.some(item => item.volume !== undefined)) {
        // Create volume series with separate price scale
        const volumeHistogram = chart.addHistogramSeries({
          color: '#26a69a',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: 'volume',
        });
        
        // Format and set volume data
        const volumeData = filteredData.map((item) => ({
          time: item.time as Time,
          value: item.volume || 0,
          color: item.close >= item.open ? '#4CAF5080' : '#FF525280',
        }));
        
        volumeHistogram.setData(volumeData);
        volumeSeries.current = volumeHistogram;
        
        // Create separate price scale for volume
        chart.priceScale('volume').applyOptions({
          scaleMargins: {
            top: 0.8, // Place volume at the bottom 20% of the chart
            bottom: 0,
          },
        });
      }
      
      // Add technical indicators
      if (showIndicators && indicators.length > 0) {
        indicators.forEach((indicator) => {
          if (indicator.visible) {
            const series = chart.addLineSeries({
              color: indicator.color,
              lineWidth: indicator.width,
              lineStyle: indicator.style,
              priceLineVisible: false,
              title: indicator.name,
            });
            
            // Format indicator data
            const indicatorData = indicator.data.map((item) => ({
              time: item.time as Time,
              value: item.value,
            }));
            
            series.setData(indicatorData);
            indicatorSeriesRefs.current.set(indicator.name, series);
          }
        });
      }
      
      // Create crosshair move handler
      chart.subscribeCrosshairMove((param) => {
        if (
          param.point === undefined ||
          !param.time ||
          param.point.x < 0 ||
          param.point.y < 0
        ) {
          setHoverData(null);
          return;
        }
        
        const seriesData = param.seriesData.get(mainSeries) as any;
        if (seriesData) {
          const hoverCandleData = {
            time: seriesData.time,
            open: seriesData.open,
            high: seriesData.high,
            low: seriesData.low,
            close: seriesData.close,
            volume: volumeSeries.current ? 
              (param.seriesData.get(volumeSeries.current) as any)?.value : undefined
          };
          
          setHoverData(hoverCandleData);
        }
      });
      
      // Make chart responsive
      const handleResize = () => {
        if (chartContainerRef.current && chart) {
          chart.applyOptions({ 
            width: width || chartContainerRef.current.clientWidth 
          });
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Subscribe to visible range changes if callback provided
      if (onTimeRangeChange) {
        chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
          if (range) {
            onTimeRangeChange(range.from as number, range.to as number);
          }
        });
      }
      
      chartRef.current = chart;
      
      // Fit all data to chart view
      chart.timeScale().fitContent();
      
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [data, selectedRange, showVolume, width, height, showIndicators, indicators]);
  
  // Format price for display
  const formatPrice = (price?: number) => {
    if (price === undefined) return '-';
    return price.toFixed(2);
  };
  
  // Format percentage for display
  const formatPercentage = (percentage: number) => {
    const formattedValue = Math.abs(percentage).toFixed(2);
    return percentage >= 0 ? `+${formattedValue}%` : `-${formattedValue}%`;
  };
  
  const stats = getPriceStats();
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Chart header with title, stats and controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          
          {/* Show price info when hovering over chart */}
          {hoverData ? (
            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
              <Typography variant="body2" color="textSecondary">
                O: <Box component="span" fontWeight="medium">{formatPrice(hoverData.open)}</Box>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                H: <Box component="span" fontWeight="medium">{formatPrice(hoverData.high)}</Box>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                L: <Box component="span" fontWeight="medium">{formatPrice(hoverData.low)}</Box>
              </Typography>
              <Typography variant="body2" color="textSecondary">
                C: <Box component="span" fontWeight="medium">{formatPrice(hoverData.close)}</Box>
              </Typography>
              {hoverData.volume && (
                <Typography variant="body2" color="textSecondary">
                  Vol: <Box component="span" fontWeight="medium">{hoverData.volume.toLocaleString()}</Box>
                </Typography>
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
              <Typography 
                variant="body2" 
                color={stats.isPositive ? 'success.main' : 'error.main'}
                fontWeight="medium"
              >
                {stats.isPositive ? '+' : ''}{stats.change.toFixed(2)} ({formatPercentage(stats.changePercent)})
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Chart controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Indicator toggle */}
          {indicators.length > 0 && (
            <FormControlLabel
              control={
                <Switch 
                  checked={showIndicators}
                  onChange={(e) => setShowIndicators(e.target.checked)}
                  size="small"
                />
              }
              label="Indicators"
              sx={{ mr: 2 }}
            />
          )}
          
          {/* Time range selector */}
          <ButtonGroup size="small">
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
      </Box>
      
      {/* Main chart container */}
      <Box 
        ref={chartContainerRef} 
        sx={{ 
          width: '100%', 
          height: height,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          borderRadius: 1,
          overflow: 'hidden',
        }} 
      />
    </Box>
  );
};

export default CandlestickChart;