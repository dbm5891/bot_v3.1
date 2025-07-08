import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  createChart, 
  IChartApi, 
  ISeriesApi, 
  SeriesType,
  Time, 
  LineStyle,
  CrosshairMode,
  CandlestickData,
  HistogramData,
} from 'lightweight-charts';
import { 
  timeRanges, 
  PerformanceDataPoint as PerformanceData, 
  formatDateForChart 
} from '../../utils/chartUtils';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ui/theme-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarChart3, CandlestickChart, LineChart, Settings2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to get computed CSS value
const getComputedCssVar = (varName: string): string => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  return computedStyle.getPropertyValue(varName).trim();
};

interface PerformanceChartProps {
  data: PerformanceData[];
  compareData?: PerformanceData[]; // Optional comparison data series
  volumeData?: { date: string; volume: number }[]; // Optional volume data
  candlestickData?: { date: string; open: number; high: number; low: number; close: number }[]; // Optional OHLC data
  loading?: boolean;
  error?: string | null;
  selectedRange: string;
  onTimeRangeChange: (range: string) => void;
  showBenchmark?: boolean;
  overrideChartHeight?: number; // Optional prop
}

const PerformanceChart: React.FC<PerformanceChartProps> = React.memo(({ 
  data, 
  compareData, 
  volumeData,
  candlestickData,
  loading = false, 
  error = null, 
  selectedRange, 
  onTimeRangeChange, 
  showBenchmark = false,
  overrideChartHeight,
}) => {
  const { theme } = useTheme();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const compareSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Internal state for chart settings
  const [chartType, setChartType] = useState<'Area' | 'Line' | 'Candlestick'>('Area');
  const [showVolume, setShowVolume] = useState<boolean>(!!volumeData);
  
  // Add hover state variables
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredPercentChange, setHoveredPercentChange] = useState<number | null>(null);
  const [hoveredCompareValue, setHoveredCompareValue] = useState<number | null>(null);
  const [hoveredVolume, setHoveredVolume] = useState<number | null>(null);
  const [hoveredOHLC, setHoveredOHLC] = useState<{open: number, high: number, low: number, close: number} | null>(null);

  // Theme-aware chart colors
  const chartColors = useMemo(() => {
    const isDark = theme === 'dark';
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);

    // Helper to get RGB values from CSS variable
    const getRGBFromVar = (varName: string): string => {
      const value = computedStyle.getPropertyValue(varName).trim();
      // If the value is already RGB/RGBA, return it
      if (value.startsWith('rgb')) return value;
      // If it's HSL, convert to RGB (simplified for now)
      return isDark ? '#3b82f6' : '#2563eb'; // Fallback to hardcoded values
    };

    return {
      background: 'transparent',
      text: isDark ? '#e2e8f0' : '#1e293b',
      grid: isDark ? '#334155' : '#e2e8f0',
      border: isDark ? '#334155' : '#e2e8f0',
      primary: getRGBFromVar('--primary'),
      secondary: isDark ? '#94a3b8' : '#64748b',
      success: isDark ? '#22c55e' : '#16a34a',
      destructive: isDark ? '#ef4444' : '#dc2626',
      volume: isDark ? '#64748b' : '#94a3b8',
      upColor: isDark ? '#22c55e' : '#16a34a',
      downColor: isDark ? '#ef4444' : '#dc2626',
      crosshair: isDark ? '#e2e8f0' : '#1e293b',
      tooltip: {
        background: isDark ? '#1e293b' : '#ffffff',
        border: isDark ? '#334155' : '#e2e8f0',
      }
    };
  }, [theme]); // Re-compute when theme changes

  // Calculate current chart height
  const chartHeight = useMemo(() => {
    if (overrideChartHeight) { // Use override if provided
      return overrideChartHeight;
    }
    // Adjusted default responsive logic for potentially smaller cards and JSDOM
    const effectiveWidth = typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 600; // Default to 600 if window.innerWidth is 0 or undefined
    return effectiveWidth < 600 ? 240 : (effectiveWidth < 900 ? 280 : 320); 
  }, [overrideChartHeight]); // Removed window.innerWidth from dependencies

  // Cleanup chart resources when component unmounts or before re-creating chart
  const cleanupChart = () => {
    if (chartRef.current) {
      try {
        chartRef.current.remove();
        chartRef.current = null;
      } catch (err) {
        console.error('Error removing chart:', err);
      }
    }
  };

  // Early return for loading state
  if (loading) {
    return (
      <div className="h-full w-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            {timeRanges.map((_, i) => (
              <div key={i} className="h-8 w-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
        <div className="flex-grow bg-muted rounded animate-pulse min-h-[240px]" />
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-destructive/10 text-destructive rounded-lg p-4 max-w-md">
          <p className="font-medium mb-2">Chart Data Error</p>
          <p className="text-sm text-destructive/90">{error}</p>
        </div>
      </div>
    );
  }

  // Early return for empty data state
  if (!loading && !error && data && data.length === 0) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md">
          <p className="text-lg font-medium mb-2">No Data Available</p>
          <p className="text-sm text-muted-foreground">
            No portfolio performance data available for the selected period.
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Only create chart if container exists and we have valid, non-empty data
    const validData = data
      .map(item => ({
        time: formatDateForChart(item.date) as Time,
        value: item.value,
      }))
      .filter(item => item.time !== undefined && !isNaN(item.time as number));

    if (chartContainerRef.current && validData && validData.length > 0) {
      // Clean up existing chart if it exists
      cleanupChart();

      try {
        // Create new chart with theme-aware colors
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { color: chartColors.background },
            textColor: chartColors.text,
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
          },
          grid: {
            vertLines: {
              color: chartColors.grid,
              style: LineStyle.Dotted,
            },
            horzLines: {
              color: chartColors.grid,
              style: LineStyle.Dotted,
            },
          },
          rightPriceScale: {
            borderColor: chartColors.border,
            autoScale: true,
            scaleMargins: {
              top: 0.1,
              bottom: showVolume ? 0.3 : 0.2,
            },
            borderVisible: false,
          },
          timeScale: {
            borderColor: chartColors.border,
            timeVisible: true,
            secondsVisible: false,
            tickMarkFormatter: (time: Time) => {
              const date = new Date(time as number * 1000);
              return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            },
            borderVisible: false,
          },
          crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
              width: 1,
              color: chartColors.grid,
              style: LineStyle.Dashed,
              labelBackgroundColor: chartColors.background,
            },
            horzLine: {
              width: 1,
              color: chartColors.grid,
              style: LineStyle.Dashed,
              labelBackgroundColor: chartColors.background,
            },
          },
          handleScroll: {
            vertTouchDrag: false,
          },
          handleScale: {
            axisPressedMouseMove: {
              time: true,
              price: true,
            },
          },
          width: chartContainerRef.current.clientWidth,
          height: chartHeight,
        });

        chartRef.current = chart;

        // Use the 'validData' which has been processed and filtered
        if (validData && validData.length > 0) { 
          const formattedData = validData;
          
          // Calculate first value for percentage change
          const firstValue = formattedData[0].value;
          
          // Create main series based on chart type
          if (chartType === 'Candlestick' && candlestickData && candlestickData.length > 0) {
            // Format candlestick data
            const formattedCandlestickData = candlestickData.map(item => ({
              time: formatDateForChart(item.date) as Time,
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
            })) as CandlestickData[];
            
            const candlestickSeries = chart.addCandlestickSeries({
              upColor: chartColors.upColor,
              downColor: chartColors.downColor,
              borderVisible: false,
              wickUpColor: chartColors.upColor,
              wickDownColor: chartColors.downColor,
            });
            
            candlestickSeries.setData(formattedCandlestickData);
            candlestickSeriesRef.current = candlestickSeries;
            mainSeriesRef.current = candlestickSeries;
          } else {
            // Create Area or Line series
            const mainSeries = chartType === 'Area' 
              ? chart.addAreaSeries({
                  lineColor: chartColors.primary,
                  topColor: chartColors.primary + '40', // 25% opacity
                  bottomColor: chartColors.primary + '00', // 0% opacity
                  lineWidth: 2,
                  crosshairMarkerVisible: true,
                  lastValueVisible: false,
                  priceLineVisible: false,
                })
              : chart.addLineSeries({
                  color: chartColors.primary,
                  lineWidth: 2,
                  crosshairMarkerVisible: true,
                  lastValueVisible: false,
                  priceLineVisible: false,
                });

            mainSeriesRef.current = mainSeries;
            mainSeries.setData(formattedData);
          }

          // Add volume data if available and enabled
          if (volumeData && volumeData.length > 0 && showVolume) {
            // Create a separate price scale for volume
            chart.applyOptions({
              leftPriceScale: {
                visible: true,
                scaleMargins: {
                  top: 0.8, // Position volume at the bottom 20% of the chart
                  bottom: 0.02,
                },
              },
            });
            
            const volumeSeries = chart.addHistogramSeries({
              color: chartColors.volume,
              priceFormat: {
                type: 'volume',
              },
              priceScaleId: 'left',
            });
            
            const formattedVolumeData = volumeData.map(item => ({
              time: formatDateForChart(item.date) as Time,
              value: item.volume,
              color: chartColors.volume,
            })) as HistogramData[];
            
            volumeSeries.setData(formattedVolumeData);
            volumeSeriesRef.current = volumeSeries;
          }

          // Add comparison data series if provided
          if (compareData && compareData.length > 0 && showBenchmark) {
            const compareFormattedData = compareData.map(item => ({
              time: formatDateForChart(item.date) as Time,
              value: item.value,
            }));
            
            const compareSeries = chart.addLineSeries({
              color: chartColors.secondary,
              lineWidth: 2,
              lineStyle: LineStyle.Dashed,
              crosshairMarkerRadius: 4,
              crosshairMarkerBorderWidth: 2,
              crosshairMarkerBorderColor: chartColors.secondary,
              crosshairMarkerBackgroundColor: chartColors.background,
              lastValueVisible: false,
              priceLineVisible: false,
              title: 'Benchmark',
            });
            
            compareSeries.setData(compareFormattedData);
            compareSeriesRef.current = compareSeries;
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
              setHoveredDate(null);
              setHoveredPercentChange(null);
              setHoveredCompareValue(null);
              setHoveredVolume(null);
              setHoveredOHLC(null);
              return;
            }

            // Format date for display
            const timestamp = param.time as number;
            const date = new Date(timestamp * 1000);
            setHoveredDate(date.toLocaleDateString());

            // Get data for main series
            if (mainSeriesRef.current) {
              if (chartType === 'Candlestick' && candlestickSeriesRef.current) {
                const candleData = param.seriesData.get(candlestickSeriesRef.current);
                if (candleData && 'open' in candleData) {
                  const ohlc = {
                    open: candleData.open as number,
                    high: candleData.high as number,
                    low: candleData.low as number,
                    close: candleData.close as number,
                  };
                  setHoveredOHLC(ohlc);
                  setHoveredValue(ohlc.close);
                  
                  // Calculate percentage change from first value
                  const percentChange = ((ohlc.close - firstValue) / firstValue) * 100;
                  setHoveredPercentChange(percentChange);
                }
              } else {
                const mainSeriesData = param.seriesData.get(mainSeriesRef.current);
                if (mainSeriesData && 'value' in mainSeriesData) {
                  const value = mainSeriesData.value as number;
                  setHoveredValue(value);
                  
                  // Calculate percentage change from first value
                  const percentChange = ((value - firstValue) / firstValue) * 100;
                  setHoveredPercentChange(percentChange);
                }
              }
            }
            
            // Get data for compare series if it exists
            if (compareSeriesRef.current && showBenchmark) {
              const compareSeriesData = param.seriesData.get(compareSeriesRef.current);
              if (compareSeriesData && 'value' in compareSeriesData) {
                setHoveredCompareValue(compareSeriesData.value as number);
              }
            }

            // Get volume data if it exists
            if (volumeSeriesRef.current && showVolume) {
              const volumeSeriesData = param.seriesData.get(volumeSeriesRef.current);
              if (volumeSeriesData && 'value' in volumeSeriesData) {
                setHoveredVolume(volumeSeriesData.value as number);
              }
            }
          });

          // Make chart responsive
          const handleResize = () => {
            if (chartContainerRef.current && chart) {
              chart.applyOptions({ 
                width: chartContainerRef.current.clientWidth,
                height: chartHeight,
              });
              chart.timeScale().fitContent();
            }
          };

          window.addEventListener('resize', handleResize);
          chart.timeScale().fitContent();

          return () => {
            window.removeEventListener('resize', handleResize);
            cleanupChart();
          };
        }
      } catch (err) {
        console.error('Error creating performance chart:', err);
      }
    } else if (chartContainerRef.current) {
      cleanupChart();
    }
  }, [data, compareData, volumeData, candlestickData, selectedRange, showBenchmark, chartHeight, chartType, showVolume, theme, chartColors]);

  // Handle time range change
  const handleRangeChange = (range: string) => {
    onTimeRangeChange(range);
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Format currency value for display
  const formatCurrency = (value: number | null) => {
    if (value === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Format percentage for display
  const formatPercentage = (value: number | null) => {
    if (value === null) return '-';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  // Format volume for display
  const formatVolume = (value: number | null) => {
    if (value === null) return '-';
    
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    } else if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`;
    }
    
    return value.toLocaleString();
  };

  // Render function
  return (
    <div className="h-full w-full flex flex-col">
      {/* Chart Controls */}
      <div className="flex items-center justify-between mb-4">
        {/* Legend */}
        <div ref={legendRef} className="flex items-center gap-4">
          {hoveredValue !== null && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="space-y-1 cursor-help">
                    <div className="text-sm font-medium">
                      {formatCurrency(hoveredValue)}
                    </div>
                    {hoveredPercentChange !== null && (
                      <div className={cn(
                        "text-xs",
                        hoveredPercentChange >= 0 ? "text-success" : "text-destructive"
                      )}>
                        {hoveredPercentChange >= 0 ? "+" : ""}
                        {formatPercentage(hoveredPercentChange)}
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent className="py-2">
                  <div className="space-y-2">
                    <div className="text-[13px] font-medium">{formatDateDisplay(hoveredDate)}</div>
                    
                    {/* OHLC data if available */}
                    {hoveredOHLC && (
                      <>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex grow gap-2">
                            Open <span className="ml-auto">{formatCurrency(hoveredOHLC.open)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex grow gap-2 text-success">
                            High <span className="ml-auto">{formatCurrency(hoveredOHLC.high)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="flex grow gap-2 text-destructive">
                            Low <span className="ml-auto">{formatCurrency(hoveredOHLC.low)}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className={cn(
                            "flex grow gap-2",
                            hoveredOHLC.close >= hoveredOHLC.open ? "text-success" : "text-destructive"
                          )}>
                            Close <span className="ml-auto">{formatCurrency(hoveredOHLC.close)}</span>
                          </span>
                        </div>
                      </>
                    )}
                    
                    {/* Volume if available */}
                    {hoveredVolume !== null && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex grow gap-2 text-muted-foreground">
                          Volume <span className="ml-auto">{formatVolume(hoveredVolume)}</span>
                        </span>
                      </div>
                    )}
                    
                    {/* Benchmark if available */}
                    {showBenchmark && hoveredCompareValue !== null && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex grow gap-2 text-muted-foreground">
                          Benchmark <span className="ml-auto">{formatCurrency(hoveredCompareValue)}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Chart Controls */}
        <div className="flex items-center gap-2">
          {/* Chart Type Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                {chartType === 'Area' && <BarChart3 className="h-4 w-4" />}
                {chartType === 'Line' && <LineChart className="h-4 w-4" />}
                {chartType === 'Candlestick' && <CandlestickChart className="h-4 w-4" />}
                <span className="sr-only md:not-sr-only md:ml-1 md:text-xs">
                  {chartType}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setChartType('Area')}
                className={cn("gap-2", chartType === 'Area' && "bg-accent")}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Area</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setChartType('Line')}
                className={cn("gap-2", chartType === 'Line' && "bg-accent")}
              >
                <LineChart className="h-4 w-4" />
                <span>Line</span>
              </DropdownMenuItem>
              {candlestickData && candlestickData.length > 0 && (
                <DropdownMenuItem 
                  onClick={() => setChartType('Candlestick')}
                  className={cn("gap-2", chartType === 'Candlestick' && "bg-accent")}
                >
                  <CandlestickChart className="h-4 w-4" />
                  <span>Candlestick</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Settings Menu */}
          {volumeData && volumeData.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                  <Settings2 className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowVolume(!showVolume)}>
                  {showVolume ? "Hide Volume" : "Show Volume"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Time Range Selector */}
          <div className="flex gap-1">
            {timeRanges.map((range) => (
              <Button
                key={range.label}
                variant={selectedRange === range.label ? "default" : "outline"}
                size="sm"
                onClick={() => handleRangeChange(range.label)}
                className="h-8 px-2 min-w-[40px]"
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className="flex-grow relative min-h-[240px] w-full rounded-md border"
      />
    </div>
  );
});

export default PerformanceChart;