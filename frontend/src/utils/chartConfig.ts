import { colors } from '../theme';
import { ChartOptions, ChartType } from 'chart.js';

/**
 * Creates TradingView-inspired chart configuration for Chart.js
 */
export const createChartConfig = <TType extends 'line' | 'bar' | 'candlestick'>(type: TType): ChartOptions<TType> => {
  // Base config for all chart types
  const baseConfig: ChartOptions<TType> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 600,
    },
    layout: {
      padding: {
        left: 0,
        right: 8,
        top: 0,
        bottom: 0,
      },
    },
    scales: {
      x: {
        grid: {
          color: colors.chart.grid,
          drawBorder: false,
          tickLength: 0,
        },
        ticks: {
          color: colors.text.secondary,
          font: {
            size: 10,
            family: '"Inter", sans-serif',
          },
          maxRotation: 0,
          minRotation: 0,
          maxTicksLimit: 8,
        },
        border: {
          display: false,
        },
      },
      y: {
        position: 'right',
        grid: {
          color: colors.chart.grid,
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: colors.text.secondary,
          font: {
            size: 10,
            family: '"Inter", sans-serif',
          },
          padding: 8,
          callback: function(value: any) {
            // Format numbers to be more readable
            if (value >= 1000000) {
              return '$' + (value / 1000000).toFixed(1) + 'M';
            }
            if (value >= 1000) {
              return '$' + (value / 1000).toFixed(1) + 'K';
            }
            return '$' + value;
          },
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        backgroundColor: colors.background.paper,
        titleColor: colors.text.primary,
        bodyColor: colors.text.primary,
        borderColor: colors.border,
        borderWidth: 1,
        padding: 10,
        cornerRadius: 4,
        displayColors: true,
        titleFont: {
          family: '"Inter", sans-serif',
          size: 12,
          weight: '600',
        },
        bodyFont: {
          family: '"Inter", sans-serif',
          size: 12,
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 2,
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      },
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: colors.text.primary,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          font: {
            family: '"Inter", sans-serif',
            size: 11,
          },
        },
      },
      title: {
        display: false,
      },
    },
  };

  // Line chart specific configurations
  if (type === 'line') {
    return {
      ...baseConfig,
      elements: {
        line: {
          tension: 0.3, // Slightly curved lines
          borderWidth: 2,
          fill: 'start',
          backgroundColor: (context: any) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(41, 98, 255, 0.28)');
            gradient.addColorStop(1, 'rgba(41, 98, 255, 0.0)');
            return gradient;
          },
          borderColor: colors.chart.line,
        },
        point: {
          radius: 0, // Hide points by default
          hoverRadius: 5, // Show on hover
          backgroundColor: colors.chart.line,
          borderColor: colors.background.paper,
          borderWidth: 2,
          hitRadius: 30,
        },
      },
    };
  }

  // Bar chart specific configurations
  if (type === 'bar') {
    return {
      ...baseConfig,
      elements: {
        bar: {
          backgroundColor: (context: any) => {
            const value = context.dataset.data[context.dataIndex];
            return value >= 0 ? colors.chart.green : colors.chart.red;
          },
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 3,
        },
      },
    };
  }

  // Default
  return baseConfig;
};

/**
 * Creates gradient backgrounds for chart data
 */
export const createGradient = (ctx: CanvasRenderingContext2D, color: string, opacity: number = 0.2) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  gradient.addColorStop(0, `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
  gradient.addColorStop(1, `${color}00`);
  return gradient;
};

/**
 * Format large numbers to be more readable
 */
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'K';
  }
  return value.toFixed(2);
};