import React, { useMemo } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Divider, 
  Grid, 
  Typography, 
  Tooltip, 
  Skeleton,
  Alert,
  useTheme,
  alpha,
  Paper,
  Fade
} from '@mui/material';
import { 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  ShowChart as ChartIcon,
  Assessment as AssessmentIcon, 
  MonetizationOn as MonetizationOnIcon,
  EmojiEvents as EmojiEventsIcon,
} from '@mui/icons-material';
import AppIcon from '../icons/AppIcon';

interface PerformanceMetric {
  label: string;
  value: string | number;
  description: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  color?: string;
}

interface PerformanceSummaryProps {
  metrics: {
    totalReturn: number | string;
    monthlyReturn: number | string;
    sharpeRatio: string | number;
    maxDrawdown: string | number;
    winRate?: number;
    profitFactor?: number;
  };
  selectedTimeRange: string;
  loading?: boolean;
  error?: string | null;
  variant?: 'outlined' | 'elevation';
}

/**
 * Helper function to convert a percentage string to a number
 * @param value The string value to parse (e.g., "10.5%")
 * @returns The parsed number value
 */
export const parsePercentageValue = (value: string | number): number => {
  if (typeof value === 'number') {
    return value;
  }
  
  // Remove the percentage sign and any whitespace
  const cleaned = value.replace('%', '').trim();
  // Parse as float
  return parseFloat(cleaned);
};

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({ 
  metrics, 
  selectedTimeRange, 
  loading = false, 
  error = null,
  variant = 'elevation',
}) => {
  const theme = useTheme();

  // Format the metric display values
  const formatMetric = (metric: number | string, isPercentage = false): string => {
    if (typeof metric === 'number') {
      return isPercentage ? `${metric > 0 ? '+' : ''}${metric.toFixed(2)}%` : metric.toFixed(2);
    }
    
    if (isPercentage && typeof metric === 'string' && metric.includes('%')) {
      const value = parsePercentageValue(metric);
      return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    }
    
    return metric.toString();
  };

  // Generate the metrics array, memoized for performance
  const performanceMetricsList = useMemo(() => {
    if (!metrics) {
      return [];
    }

    const totalReturn = typeof metrics.totalReturn === 'string' 
      ? parsePercentageValue(metrics.totalReturn)
      : metrics.totalReturn;
      
    const monthlyReturn = typeof metrics.monthlyReturn === 'string'
      ? parsePercentageValue(metrics.monthlyReturn)
      : metrics.monthlyReturn;
      
    const maxDrawdown = typeof metrics.maxDrawdown === 'string'
      ? parsePercentageValue(metrics.maxDrawdown)
      : metrics.maxDrawdown;

    return [
      {
        label: 'Total Return',
        value: formatMetric(totalReturn, true),
        description: `Overall performance during the ${selectedTimeRange} period`,
        isPositive: totalReturn >= 0,
        icon: <AppIcon name="TrendingUp" size={24} />,
        color: totalReturn >= 0 ? theme.palette.success.main : theme.palette.error.main,
      },
      {
        label: 'Monthly Return',
        value: formatMetric(monthlyReturn, true),
        description: 'Performance over the last month',
        isPositive: monthlyReturn >= 0,
        icon: <AppIcon name="TrendingUp" size={24} />,
        color: monthlyReturn >= 0 ? theme.palette.success.main : theme.palette.error.main,
      },
      {
        label: 'Sharpe Ratio',
        value: formatMetric(metrics.sharpeRatio),
        description: 'Risk-adjusted return (higher is better)',
        icon: <AssessmentIcon fontSize="medium" />,
        color: theme.palette.info.main,
      },
      {
        label: 'Max Drawdown',
        value: formatMetric(maxDrawdown, true),
        description: 'Largest peak-to-trough decline',
        icon: <AppIcon name="Minus" size={24} />,
        color: theme.palette.error.main,
      },
      {
        label: 'Win Rate',
        value: metrics.winRate !== undefined ? formatMetric(metrics.winRate, true) : 'N/A',
        description: 'Percentage of winning trades',
        icon: <AppIcon name="Award" size={24} />,
        color: theme.palette.warning.main,
      },
      {
        label: 'Profit Factor',
        value: metrics.profitFactor !== undefined ? formatMetric(metrics.profitFactor) : 'N/A',
        description: 'Gross profits divided by gross losses',
        icon: <AppIcon name="DollarSign" size={24} />,
        color: metrics.profitFactor !== undefined && metrics.profitFactor > 1 ? theme.palette.success.main : theme.palette.warning.main,
      },
    ];
  }, [metrics, selectedTimeRange, theme.palette]);

  if (loading) {
    return (
      <Card
        variant={variant}
      >
        <CardHeader 
          title={`Performance Summary (${selectedTimeRange})`}
          titleTypographyProps={{ variant: 'h6' }}
        />
        <Divider />
        <CardContent sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={6} md={4} key={item}>
                <Skeleton variant="rectangular" height={100} animation="wave" sx={{ borderRadius: 1 }} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        variant={variant}
      >
        <CardHeader 
          title="Performance Summary"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <Divider />
        <CardContent sx={{ p: 2 }}>
          <Alert severity="error" sx={{ borderRadius: 1 }}>{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant={variant}
      sx={{
        borderRadius: theme.shape.borderRadius * 1.5,
        boxShadow: variant === 'elevation' ? (theme.shadows[16] || theme.shadows[8]) : 'none',
        height: '100%', // Ensure card takes full height of its container
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardHeader 
        title={`Performance Summary (${selectedTimeRange || 'ALL'})`}
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        sx={{ pb: 1 }}
      />
      <Divider />
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, flexGrow: 1 }}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {performanceMetricsList.map((metric) => {
            const isKeyMetric = metric.label === 'Total Return' || metric.label === 'Sharpe Ratio';
            return (
              <Grid item xs={6} sm={4} key={metric.label}>
                <Paper 
                  variant="outlined"
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    textAlign: 'center', 
                    borderRadius: theme.shape.borderRadius,
                    borderColor: alpha(metric.color || theme.palette.divider, 0.5),
                    backgroundColor: alpha(metric.color || theme.palette.grey[500], 0.04),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: `0 4px 12px ${alpha(metric.color || theme.palette.grey[500], 0.2)}`,
                    }
                  }}
                >
                  <Tooltip title={metric.description} placement="top" arrow TransitionComponent={Fade}>
                    <Box>
                      <Box sx={{ mb: 0.5, color: metric.color || theme.palette.text.primary, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        {metric.icon} 
                        <Typography 
                          variant="caption" 
                          component="div" 
                          color="text.secondary"
                          fontWeight={isKeyMetric ? 500 : 400}
                          sx={{ ml: metric.icon ? 0.5 : 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                        >
                          {metric.label}
                        </Typography>
                      </Box>
                      <Typography 
                        variant="h6"
                        fontWeight={isKeyMetric ? 700 : 600} 
                        color={metric.color || theme.palette.text.primary}
                        sx={{ wordBreak: 'break-word' }}
                      >
                        {metric.value}
                      </Typography>
                      {metric.label === 'Max Drawdown' && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          (Lower is better)
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PerformanceSummary; 