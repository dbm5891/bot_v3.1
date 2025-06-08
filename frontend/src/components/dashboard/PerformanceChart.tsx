import React, { useEffect, useRef, useState, useMemo } from 'react';
import { 
  Box, 
  useTheme, 
  ButtonGroup, 
  Button, 
  Tooltip, 
  Skeleton, 
  Alert, 
  Paper, 
  ToggleButtonGroup, 
  ToggleButton, 
  IconButton, 
  Card, 
  CardHeader, 
  CardContent,
  FormControlLabel, 
  Switch, 
  Typography,
  Stack,
  Menu,
  MenuItem,
  alpha,
  Fade,
  Divider,
} from '@mui/material';
import { 
  createChart, 
  ColorType, 
  IChartApi, 
  ISeriesApi, 
  SeriesType,
  Time, 
  LineStyle,
  CrosshairMode,
} from 'lightweight-charts';
import { 
  FileDownload as DownloadIcon, 
  Compare as CompareIcon,
  MoreVert as MoreVertIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { exportToCsv, formatPerformanceDataForExport, exportDashboardData } from '../../utils/exportUtils';
import { 
  timeRanges, 
  PerformanceDataPoint as PerformanceData, 
  formatDateForChart 
} from '../../utils/chartUtils';

interface PerformanceChartProps {
  data: PerformanceData[];
  compareData?: PerformanceData[]; // Optional comparison data series
  title?: string;
  loading?: boolean;
  error?: string | null;
  selectedRange: string;
  onTimeRangeChange: (range: string) => void;
  showBenchmarkToggle?: boolean;
  showBenchmark?: boolean;
  onBenchmarkToggle?: (checked: boolean) => void;
  metrics?: {
    totalReturn?: number;
    monthlyReturn?: number;
    sharpeRatio?: number;
    maxDrawdown?: number;
    winRate?: number;
    profitFactor?: number;
  };
  overrideChartHeight?: number; // New optional prop
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  compareData, 
  title = 'Portfolio Performance', 
  loading = false, 
  error = null, 
  selectedRange, 
  onTimeRangeChange, 
  showBenchmarkToggle = false,
  showBenchmark = false,
  onBenchmarkToggle = () => {},
  metrics,
  overrideChartHeight,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<SeriesType> | null>(null);
  const compareSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const theme = useTheme();
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [hoveredPercentChange, setHoveredPercentChange] = useState<number | null>(null);
  const [hoveredCompareValue, setHoveredCompareValue] = useState<number | null>(null);

  // Internal state for chart settings
  const [internalMainSeriesType, setInternalMainSeriesType] = useState<'Area' | 'Line'>('Area');
  const [settingsMenuAnchorEl, setSettingsMenuAnchorEl] = useState<null | HTMLElement>(null);

  // Handlers for Chart Settings Menu (moved from DashboardPage)
  const handleOpenSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchorEl(event.currentTarget);
  };

  const handleCloseSettingsMenu = () => {
    setSettingsMenuAnchorEl(null);
  };

  const handleChangeMainSeriesType = (newType: 'Area' | 'Line') => {
    setInternalMainSeriesType(newType);
    handleCloseSettingsMenu();
  };

  // Calculate current chart height
  const chartHeight = useMemo(() => {
    if (overrideChartHeight) { // Use override if provided
      return overrideChartHeight;
    }
    // Adjusted default responsive logic for potentially smaller cards and JSDOM
    const effectiveWidth = typeof window !== 'undefined' && window.innerWidth > 0 ? window.innerWidth : 600; // Default to 600 if window.innerWidth is 0 or undefined
    return effectiveWidth < 600 ? 240 : (effectiveWidth < 900 ? 280 : 320); 
  }, [overrideChartHeight]); // Removed window.innerWidth from dependencies

  // Calculate percentage change from first value
  const calculatePercentageChange = (sourceData: PerformanceData[]) => {
    if (!sourceData || sourceData.length === 0) return [];
    
    const baseValue = sourceData[0].value;
    
    return sourceData.map((item: PerformanceData) => ({ // Added type for item
      time: item.date as Time,
      value: ((item.value - baseValue) / baseValue) * 100
    }));
  };

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

  // Early return for empty data state after loading and error checks
  if (!loading && !error && data && data.length === 0) {
    return (
      <Card 
        sx={{ 
          height: chartHeight, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          borderRadius: theme.shape.borderRadius, 
          boxShadow: theme.shadows[1],
        }}
      >
        <CardContent>
          <Typography variant="body1" color="text.secondary" align="center">
            No portfolio performance data available for the selected period.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    // Only create chart if container exists and we have valid, non-empty data
    const validData = data
      .map(item => ({
        time: formatDateForChart(item.date) as Time, // Time is now number | undefined
        value: item.value,
      }))
      .filter(item => item.time !== undefined && !isNaN(item.time as number));

    if (chartContainerRef.current && validData && validData.length > 0) {
      // Clean up existing chart if it exists
      cleanupChart();

      try {
        const isDarkMode = theme.palette.mode === 'dark';
        const textColor = isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(25, 25, 25, 0.8)';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
        const primaryColor = theme.palette.primary.main;
        const secondaryColor = theme.palette.secondary.main;
        const backgroundColor = 'transparent';

        // Create new chart
        const chart = createChart(chartContainerRef.current, {
          layout: {
            background: { color: backgroundColor },
            textColor,
            fontFamily: theme.typography.fontFamily,
            fontSize: 12,
          },
          grid: {
            vertLines: {
              color: gridColor,
              style: LineStyle.Dotted,
            },
            horzLines: {
              color: gridColor,
              style: LineStyle.Dotted,
            },
          },
          rightPriceScale: {
            borderColor: gridColor,
            autoScale: true,
            scaleMargins: {
              top: 0.1,
              bottom: 0.2,
            },
            borderVisible: false,
          },
          timeScale: {
            borderColor: gridColor,
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
              color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              style: LineStyle.Dashed,
            },
            horzLine: {
              width: 1,
              color: isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              style: LineStyle.Dashed,
              labelBackgroundColor: primaryColor,
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
          const formattedData = validData; // Already formatted and filtered
          
          // Calculate first value for percentage change
          const firstValue = formattedData[0].value;
          
          // Create the main performance series based on mainSeriesType
          if (internalMainSeriesType === 'Area') {
            const mainSeries = chart.addAreaSeries({
              lineColor: primaryColor,
              topColor: isDarkMode 
                ? `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.4)`
                : `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.3)`,
              bottomColor: isDarkMode 
                ? `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.05)`
                : `rgba(${parseInt(primaryColor.slice(1, 3), 16)}, ${parseInt(primaryColor.slice(3, 5), 16)}, ${parseInt(primaryColor.slice(5, 7), 16)}, 0.0)`,
              lineWidth: 2,
              crosshairMarkerVisible: true,
              crosshairMarkerRadius: 6,
              crosshairMarkerBorderWidth: 2,
              crosshairMarkerBorderColor: isDarkMode ? '#fff' : primaryColor,
              crosshairMarkerBackgroundColor: isDarkMode ? primaryColor : '#fff',
              lastValueVisible: false,
              priceLineVisible: false,
            });
            mainSeries.setData(formattedData);
            mainSeriesRef.current = mainSeries;
          } else { // mainSeriesType === 'Line' -> internalMainSeriesType === 'Line'
            const mainSeries = chart.addLineSeries({
              color: primaryColor, // Use color for line series
              lineWidth: 2,
              crosshairMarkerVisible: true,
              crosshairMarkerRadius: 6,
              crosshairMarkerBorderWidth: 2,
              crosshairMarkerBorderColor: isDarkMode ? '#fff' : primaryColor,
              crosshairMarkerBackgroundColor: isDarkMode ? primaryColor : '#fff',
              lastValueVisible: false,
              priceLineVisible: false,
            });
            mainSeries.setData(formattedData);
            mainSeriesRef.current = mainSeries;
          }

          // Add comparison data series if provided (using 'compareData' prop)
          if (compareData && compareData.length > 0 && showBenchmark) {
            const compareFormattedData = compareData.map(item => ({
              time: formatDateForChart(item.date) as Time,
              value: item.value,
            }));
            
            const compareSeries = chart.addLineSeries({
              color: secondaryColor,
              lineWidth: 2,
              lineStyle: LineStyle.Dashed,
              crosshairMarkerRadius: 4,
              crosshairMarkerBorderWidth: 2,
              crosshairMarkerBorderColor: secondaryColor,
              crosshairMarkerBackgroundColor: backgroundColor,
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
              return;
            }

            // Get data for main series
            if (mainSeriesRef.current) { // Check if mainSeriesRef.current is not null
              const mainSeriesData = param.seriesData.get(mainSeriesRef.current);
              if (mainSeriesData && 'value' in mainSeriesData) {
                const value = mainSeriesData.value as number;
                setHoveredValue(value);
                
                // Calculate percentage change from first value
                const percentChange = ((value - firstValue) / firstValue) * 100;
                setHoveredPercentChange(percentChange);
                
                // Format date for display
                const timestamp = param.time as number;
                const date = new Date(timestamp * 1000);
                setHoveredDate(date.toLocaleDateString());
              }
            }
            
            // Get data for compare series if it exists
            if (compareSeriesRef.current && showBenchmark) {
              const compareSeriesData = param.seriesData.get(compareSeriesRef.current);
              if (compareSeriesData && 'value' in compareSeriesData) {
                setHoveredCompareValue(compareSeriesData.value as number);
              }
            }
          });

          // Make chart responsive
          const handleResize = () => {
            if (chartContainerRef.current && chart) {
              chart.applyOptions({ 
                width: chartContainerRef.current.clientWidth,
                height: chartHeight, // Uses the potentially overridden chartHeight on resize
              });
              chart.timeScale().fitContent();
            }
          };

          window.addEventListener('resize', handleResize);
          
          // Fit chart content by default
          chart.timeScale().fitContent();

          // Clean up event listeners when component unmounts
          return () => {
            window.removeEventListener('resize', handleResize);
            cleanupChart();
          };
        } // End of if (validData && validData.length > 0)
      } catch (err) {
        console.error('Error creating performance chart:', err);
      }
    } else if (chartContainerRef.current) {
      // If no data, but container exists, ensure previous chart is cleared
      cleanupChart();
    }
  }, [data, compareData, selectedRange, showBenchmark, theme.palette.mode, chartHeight, internalMainSeriesType]);

  // Handle time range change
  const handleRangeChange = (range: string) => {
    onTimeRangeChange(range);
  };

  // Handle benchmark toggle
  const handleBenchmarkToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    onBenchmarkToggle(event.target.checked);
  };

  // Handle export data
  const handleExportData = () => {
    if (!data || data.length === 0) return;
    
    try {
      if (metrics) {
        // Use the enhanced export function with metrics
        exportDashboardData(data, compareData, metrics, selectedRange);
      } else {
        // Fall back to the basic export function
        const formattedData = formatPerformanceDataForExport(data);
        const fileName = `portfolio-performance-${selectedRange.toLowerCase()}-${new Date().toISOString().split('T')[0]}`;
        exportToCsv(formattedData, fileName);
      }
    } catch (err) {
      console.error('Error exporting data:', err);
    }
  };

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

  // Render function
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Optional: Add a small header/toolbar area within PerformanceChart if needed for controls like settings */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1, position: 'absolute', top: 0, right: 0, zIndex: 1 }}>
        <Tooltip title="Chart Settings">
          <span> {/* Wrapper for disabled button */} 
            <IconButton onClick={handleOpenSettingsMenu} aria-label="Chart settings" size="small" disabled={loading || !!error}>
              <SettingsIcon fontSize="inherit" />
            </IconButton>
          </span>
        </Tooltip>
        <Menu
            anchorEl={settingsMenuAnchorEl}
            open={Boolean(settingsMenuAnchorEl)}
            onClose={handleCloseSettingsMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <MenuItem disabled>
              <Typography variant="caption" color="text.secondary">Main Series Type</Typography>
            </MenuItem>
            <MenuItem 
              selected={internalMainSeriesType === 'Area'} 
              onClick={() => handleChangeMainSeriesType('Area')}
            >
              Area Chart
            </MenuItem>
            <MenuItem 
              selected={internalMainSeriesType === 'Line'} 
              onClick={() => handleChangeMainSeriesType('Line')}
            >
              Line Chart
            </MenuItem>
        </Menu>
      </Box>

      {/* Legend and hover information */}
      <Box
        ref={legendRef}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          px: 2,
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Box>
            {hoveredDate ? (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formatDateDisplay(hoveredDate)}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Hover for details
              </Typography>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {(hoveredValue !== null) && (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: theme.palette.primary.main
                }}
              >
                {formatCurrency(hoveredValue)}
              </Typography>
            )}
            
            {(hoveredPercentChange !== null) && (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 600, 
                  color: hoveredPercentChange >= 0 
                    ? theme.palette.success.main 
                    : theme.palette.error.main
                }}
              >
                {formatPercentage(hoveredPercentChange)}
              </Typography>
            )}
            
            {showBenchmark && hoveredCompareValue !== null && (
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500, 
                  color: theme.palette.secondary.main
                }}
              >
                <Box component="span" sx={{ fontSize: '0.75rem', mr: 0.5 }}>
                  Benchmark:
                </Box>
                {formatCurrency(hoveredCompareValue)}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Chart content area */}
      {loading ? (
        <Box sx={{ p: 2, height: chartHeight, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height="100%" 
            animation="wave" 
            sx={{ borderRadius: 1 }} 
          />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      ) : (
        <Box
          ref={chartContainerRef}
          sx={{
            height: chartHeight, // Uses the potentially overridden chartHeight
            width: '100%',
            flexGrow: 1, // This will make the chart container take up available space if PerformanceChart root has fixed height
                           // But PerformanceChart root has height: 100%, so this works with parent DialogContent flex
            '& .tv-lightweight-charts': {
              margin: '0 auto',
            },
          }}
        />
      )}
      
      {/* Time range selector */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          p: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <ButtonGroup 
          size="small" 
          variant="outlined" 
          aria-label="time range selection"
          sx={{ 
            '& .MuiButtonGroup-grouped': {
              borderColor: theme.palette.divider,
              minWidth: { xs: 30, sm: 45 },
              px: { xs: 1, sm: 2 },
            }
          }}
        >
          {timeRanges.map((range) => (
            <Tooltip
              key={range.label}
              title={range.description}
              arrow
              TransitionComponent={Fade}
              TransitionProps={{ timeout: 300 }}
            >
              <Button
                onClick={() => handleRangeChange(range.label)}
                aria-label={`Select ${range.description}`}
                variant={selectedRange === range.label ? 'contained' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
              >
                {range.label}
              </Button>
            </Tooltip>
          ))}
        </ButtonGroup>
      </Box>
    </Box>
  );
};

export default PerformanceChart;