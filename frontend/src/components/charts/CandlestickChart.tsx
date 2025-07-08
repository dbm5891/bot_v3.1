import { useEffect, useRef, useState, useMemo } from 'react';
import { createChart, IChartApi, ISeriesApi, LineStyle, CrosshairMode, Time } from 'lightweight-charts';
import { useTheme } from '../ui/theme-provider';
import { cn } from '@/lib/utils';

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
  width?: string;
  height?: number;
  indicators?: Indicator[];
  onTimeRangeChange?: (fromTime: number, toTime: number) => void;
  showGrid?: boolean;
  showCrosshair?: boolean;
  className?: string;
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
  width = '100%',
  height = 400,
  indicators = [],
  onTimeRangeChange,
  showGrid = true,
  showCrosshair = true,
  className,
}) => {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeries = useRef<ISeriesApi<'Histogram'> | null>(null);
  const indicatorSeriesRefs = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());
  
  const [selectedRange, setSelectedRange] = useState('ALL');
  const [hoverData, setHoverData] = useState<CandlestickData | null>(null);
  const [showIndicators, setShowIndicators] = useState(true);
  
  // Theme-aware chart colors
  const chartColors = useMemo(() => ({
    background: 'transparent',
    text: `hsl(var(--foreground))`,
    grid: `hsl(var(--chart-grid))`,
    border: `hsl(var(--border))`,
    upColor: `hsl(var(--chart-up))`,
    downColor: `hsl(var(--chart-down))`,
    volume: `hsl(var(--chart-volume))`,
    crosshair: `hsl(var(--chart-crosshair))`,
    tooltip: {
      background: `hsl(var(--chart-tooltip-bg))`,
      border: `hsl(var(--chart-tooltip-border))`,
    }
  }), []);
  
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
    
    const filteredData = getFilteredData;
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

  useEffect(() => {
    if (chartContainerRef.current && data.length > 0) {
      // Remove existing chart if it exists
      if (chartRef.current) {
        chartRef.current.remove();
        indicatorSeriesRefs.current.clear();
      }
      
      const filteredData = getFilteredData;
      
      // Create new chart with theme-aware colors
      const chart = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height,
        layout: {
          background: { color: chartColors.background },
          textColor: chartColors.text,
          fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        grid: {
          vertLines: { color: showGrid ? chartColors.grid : 'transparent' },
          horzLines: { color: showGrid ? chartColors.grid : 'transparent' },
        },
        crosshair: {
          mode: showCrosshair ? CrosshairMode.Normal : CrosshairMode.Magnet,
          vertLine: {
            color: chartColors.crosshair,
            width: 1,
            style: LineStyle.Dashed,
          },
          horzLine: {
            color: chartColors.crosshair,
            width: 1,
            style: LineStyle.Dashed,
          },
        },
        timeScale: {
          rightOffset: 5,
          barSpacing: 5,
          fixLeftEdge: true,
          lockVisibleTimeRangeOnResize: true,
          rightBarStaysOnScroll: true,
          borderColor: chartColors.border,
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: chartColors.border,
        },
        handleScroll: {
          vertTouchDrag: false,
        },
      });
      
      // Add candlestick series with theme-aware colors
      const mainSeries = chart.addCandlestickSeries({
        upColor: chartColors.upColor,
        downColor: chartColors.downColor,
        borderVisible: false,
        wickUpColor: chartColors.upColor,
        wickDownColor: chartColors.downColor,
      });
      
      // Format and set data
      const formattedData = getFilteredData.map((item) => ({
        time: item.time as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));
      
      mainSeries.setData(formattedData);
      candleSeries.current = mainSeries;
      
      // Add volume histogram if enabled with theme-aware colors
      if (showVolume && filteredData.some(item => item.volume !== undefined)) {
        const volumeHistogram = chart.addHistogramSeries({
          color: chartColors.volume,
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '', // Set to empty string for overlay
        });
        
        // Format and set volume data with theme-aware colors
        const volumeData = filteredData.map((item) => ({
          time: item.time as Time,
          value: item.volume || 0,
          color: (item.close >= item.open) ? chartColors.upColor : chartColors.downColor,
        }));

        volumeHistogram.setData(volumeData);
        volumeSeries.current = volumeHistogram;
        volumeHistogram.priceScale().applyOptions({
          scaleMargins: {
            top: 0.8,
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
              lineWidth: ([1, 2, 3, 4].includes(indicator.width) ? indicator.width : 2) as 1 | 2 | 3 | 4,
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
            width: chartContainerRef.current.clientWidth 
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
  }, [data, selectedRange, showVolume, width, height, showIndicators, indicators, chartColors, showGrid, showCrosshair]);
  
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
    <div className={cn("w-full", className)} style={{ width }}>
      {/* Chart header with title, stats and controls */}
      <div className="flex justify-between items-center mb-1">
        <div>
          <h6 className="text-base">{title}</h6>
          
          {/* Show price info when hovering over chart */}
          {hoverData ? (
            <div className="flex gap-2 mt-0.5">
              <span className="text-sm text-secondary">
                O: <span className="font-medium">{formatPrice(hoverData.open)}</span>
              </span>
              <span className="text-sm text-secondary">
                H: <span className="font-medium">{formatPrice(hoverData.high)}</span>
              </span>
              <span className="text-sm text-secondary">
                L: <span className="font-medium">{formatPrice(hoverData.low)}</span>
              </span>
              <span className="text-sm text-secondary">
                C: <span className="font-medium">{formatPrice(hoverData.close)}</span>
              </span>
              {hoverData.volume && (
                <span className="text-sm text-secondary">
                  Vol: <span className="font-medium">{hoverData.volume.toLocaleString()}</span>
                </span>
              )}
            </div>
          ) : (
            <div className="flex gap-2 mt-0.5">
              <span 
                className={`text-sm ${stats.isPositive ? 'text-success-main' : 'text-error-main'} font-medium`}
              >
                {stats.isPositive ? '+' : ''}{stats.change.toFixed(2)} ({formatPercentage(stats.changePercent)})
              </span>
            </div>
          )}
        </div>
        
        {/* Chart controls */}
        <div className="flex items-center gap-2">
          {/* Indicator toggle */}
          {indicators.length > 0 && (
            <label className="flex items-center">
              <input 
                type="checkbox"
                checked={showIndicators}
                onChange={(e) => setShowIndicators(e.target.checked)}
                className="mr-2"
              />
              Indicators
            </label>
          )}
          
          {/* Time range selector */}
          <div className="btn-group btn-group-sm">
            {timeRanges.map((range) => (
              <button 
                key={range.label}
                className={`btn ${selectedRange === range.label ? 'btn-contained' : 'btn-outline'}`}
                onClick={() => setSelectedRange(range.label)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main chart container */}
      <div 
        ref={chartContainerRef} 
        className="w-full h-[500px] border border-gray-100 rounded-lg overflow-hidden" 
      />
    </div>
  );
};

export default CandlestickChart;