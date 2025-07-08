import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  LineChart, 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Pause, 
  Play, 
  Download,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface ChartSeries {
  id: string;
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area';
  visible?: boolean;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'candlestick' | 'heatmap';
  theme: 'light' | 'dark' | 'auto';
  animations: boolean;
  realTime: boolean;
  maxDataPoints?: number;
  updateInterval?: number;
  yAxisType?: 'linear' | 'logarithmic';
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
}

interface AdvancedChartProps {
  title?: string;
  description?: string;
  series: ChartSeries[];
  config?: Partial<ChartConfig>;
  height?: number;
  loading?: boolean;
  error?: string;
  onDataUpdate?: (newData: ChartDataPoint) => void;
  onSeriesToggle?: (seriesId: string, visible: boolean) => void;
  onExport?: (format: 'png' | 'svg' | 'csv') => void;
  className?: string;
}

const defaultConfig: ChartConfig = {
  type: 'line',
  theme: 'auto',
  animations: true,
  realTime: false,
  maxDataPoints: 1000,
  updateInterval: 1000,
  yAxisType: 'linear',
  showGrid: true,
  showLegend: true,
  showTooltip: true
};

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  title,
  description,
  series,
  config: userConfig,
  height = 400,
  loading = false,
  error,
  onDataUpdate,
  onSeriesToggle,
  onExport,
  className
}) => {
  const [config, setConfig] = useState<ChartConfig>({ ...defaultConfig, ...userConfig });
  const [isRealTimeActive, setIsRealTimeActive] = useState(config.realTime);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<{ series: string; point: ChartDataPoint } | null>(null);
  
  const chartRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const realTimeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate chart statistics
  const chartStats = useMemo(() => {
    const allValues = series.flatMap(s => s.data.map(d => d.value));
    const latestValues = series.map(s => s.data[s.data.length - 1]?.value || 0);
    
    return {
      totalPoints: allValues.length,
      minValue: Math.min(...allValues),
      maxValue: Math.max(...allValues),
      avgValue: allValues.reduce((a, b) => a + b, 0) / allValues.length || 0,
      latestValues,
      trend: latestValues.length > 1 ? 
        (latestValues[latestValues.length - 1] > latestValues[latestValues.length - 2] ? 'up' : 'down') : 'neutral'
    };
  }, [series]);

  // Real-time data simulation
  useEffect(() => {
    if (isRealTimeActive && config.realTime) {
      realTimeTimerRef.current = setInterval(() => {
        const newDataPoint: ChartDataPoint = {
          timestamp: Date.now(),
          value: Math.random() * 100 + 50, // Simulate real-time data
          label: `Point ${Date.now()}`
        };
        
        onDataUpdate?.(newDataPoint);
      }, config.updateInterval);
    } else if (realTimeTimerRef.current) {
      clearInterval(realTimeTimerRef.current);
      realTimeTimerRef.current = null;
    }

    return () => {
      if (realTimeTimerRef.current) {
        clearInterval(realTimeTimerRef.current);
      }
    };
  }, [isRealTimeActive, config.realTime, config.updateInterval, onDataUpdate]);

  // Canvas drawing logic (simplified)
  const drawChart = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Set up drawing context
    ctx.strokeStyle = config.theme === 'dark' ? '#ffffff' : '#000000';
    ctx.lineWidth = 2;

    // Draw grid if enabled
    if (config.showGrid) {
      ctx.strokeStyle = config.theme === 'dark' ? '#333333' : '#e5e5e5';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 5; i++) {
        const y = (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw series data
    series.forEach((seriesData, seriesIndex) => {
      if (!seriesData.visible) return;

      const color = seriesData.color || `hsl(${seriesIndex * 60}, 70%, 50%)`;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      if (seriesData.data.length > 1) {
        ctx.beginPath();
        
        seriesData.data.forEach((point, index) => {
          const x = (width / (seriesData.data.length - 1)) * index;
          const normalizedValue = (point.value - chartStats.minValue) / (chartStats.maxValue - chartStats.minValue);
          const y = height - (normalizedValue * height);

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.stroke();
      }
    });
  }, [series, config, chartStats]);

  // Update canvas when data changes
  useEffect(() => {
    drawChart();
  }, [drawChart]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawChart();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [drawChart]);

  const handleSeriesToggle = (seriesId: string) => {
    const newVisible = !series.find(s => s.id === seriesId)?.visible;
    onSeriesToggle?.(seriesId, newVisible);
  };

  const handleExport = (format: 'png' | 'svg' | 'csv') => {
    onExport?.(format);
  };

  const toggleRealTime = () => {
    setIsRealTimeActive(!isRealTimeActive);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-destructive mb-2">⚠️ Chart Error</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "w-full transition-all duration-300",
      isFullscreen && "fixed inset-4 z-50 shadow-2xl",
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              {config.type === 'line' && <LineChart className="w-5 h-5" />}
              {config.type === 'bar' && <BarChart className="w-5 h-5" />}
              {title || 'Advanced Chart'}
              {isRealTimeActive && (
                <Badge variant="outline" className="ml-2 animate-pulse">
                  <Activity className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
            </CardTitle>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Chart Statistics */}
            <div className="flex items-center gap-4 text-sm">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      {chartStats.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : chartStats.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <Activity className="w-4 h-4 text-gray-500" />
                      )}
                      <span className="font-medium">
                        {chartStats.latestValues[0]?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1">
                      <div>Latest Value: {chartStats.latestValues[0]?.toFixed(2)}</div>
                      <div>Min: {chartStats.minValue.toFixed(2)}</div>
                      <div>Max: {chartStats.maxValue.toFixed(2)}</div>
                      <div>Avg: {chartStats.avgValue.toFixed(2)}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Chart Controls */}
            <div className="flex items-center gap-1">
              {config.realTime && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleRealTime}
                  className="h-8 w-8 p-0"
                >
                  {isRealTimeActive ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              )}
              
              <Select value={config.type} onValueChange={(value) => setConfig({...config, type: value as any})}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="candlestick">Candle</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('png')}
                className="h-8 w-8 p-0"
              >
                <Download className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Series Legend */}
        {config.showLegend && series.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {series.map((seriesData, index) => (
              <Button
                key={seriesData.id}
                variant={seriesData.visible ? "default" : "outline"}
                size="sm"
                onClick={() => handleSeriesToggle(seriesData.id)}
                className="h-7 text-xs"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: seriesData.color || `hsl(${index * 60}, 70%, 50%)` }}
                />
                {seriesData.name}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div 
          ref={chartRef}
          className="relative w-full bg-card rounded-lg border"
          style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full rounded-lg"
              style={{ display: 'block' }}
            />
          )}
          
          {/* Hover tooltip */}
          {hoveredPoint && config.showTooltip && (
            <div className="absolute bg-popover border rounded-lg p-2 text-sm shadow-lg pointer-events-none z-10">
              <div className="font-medium">{hoveredPoint.series}</div>
              <div>Value: {hoveredPoint.point.value.toFixed(2)}</div>
              <div>Time: {new Date(hoveredPoint.point.timestamp).toLocaleTimeString()}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedChart; 