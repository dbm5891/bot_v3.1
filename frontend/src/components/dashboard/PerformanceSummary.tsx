import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AppIcon from '../icons/AppIcon';
import { useTheme } from '../ui/theme-provider';
import type { LucideProps } from 'lucide-react';

interface PerformanceMetrics {
  totalReturn: number | string;
  monthlyReturn: number | string;
  winRate?: number | string;
  profitFactor?: number | string;
}

interface PerformanceSummaryProps {
  metrics: PerformanceMetrics;
  selectedTimeRange: string;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

interface MetricDisplay {
  label: string;
  value: string | number;
  description: string;
  icon: keyof typeof import('lucide-react');
  color: string;
  bgColor: string;
}

const parsePercentageValue = (value: number | string): number => {
  if (typeof value === 'string') {
    return parseFloat(value.replace('%', ''));
  }
  return value;
};

const PerformanceSummary: React.FC<PerformanceSummaryProps> = ({
  metrics,
  selectedTimeRange,
  loading = false,
  error = null,
  className
}) => {
  const { theme } = useTheme();
  const totalReturn = parsePercentageValue(metrics.totalReturn);
  const monthlyReturn = parsePercentageValue(metrics.monthlyReturn);
  const winRate = metrics.winRate !== undefined ? parsePercentageValue(metrics.winRate) : undefined;
  const profitFactor = metrics.profitFactor !== undefined ? Number(metrics.profitFactor) : undefined;

  const performanceMetricsList: (MetricDisplay | false)[] = [
    {
      label: 'Total Return',
      value: metrics.totalReturn,
      description: 'Total return over the selected period',
      icon: 'TrendingUp',
      color: totalReturn >= 0 ? 'text-success dark:text-success' : 'text-destructive dark:text-destructive',
      bgColor: totalReturn >= 0 ? 'bg-success/10 dark:bg-success/20' : 'bg-destructive/10 dark:bg-destructive/20',
    },
    {
      label: 'Monthly Return',
      value: metrics.monthlyReturn,
      description: 'Average monthly return',
      icon: 'TrendingUp',
      color: monthlyReturn >= 0 ? 'text-success dark:text-success' : 'text-destructive dark:text-destructive',
      bgColor: monthlyReturn >= 0 ? 'bg-success/10 dark:bg-success/20' : 'bg-destructive/10 dark:bg-destructive/20',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      description: 'Percentage of winning trades',
      icon: 'Percent',
      color: 'text-primary dark:text-primary',
      bgColor: 'bg-primary/10 dark:bg-primary/20',
    },
    profitFactor !== undefined && {
      label: 'Profit Factor',
      value: profitFactor.toFixed(2),
      description: 'Gross profit divided by gross loss',
      icon: 'DollarSign',
      color: profitFactor > 1 ? 'text-success dark:text-success' : 'text-primary dark:text-primary',
      bgColor: profitFactor > 1 ? 'bg-success/10 dark:bg-success/20' : 'bg-primary/10 dark:bg-primary/20',
    },
  ];

  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader>
          <CardTitle>Performance Summary ({selectedTimeRange})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <AppIcon name="Loader" className="animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader>
          <CardTitle>Performance Summary ({selectedTimeRange})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-destructive">
            <AppIcon name="AlertCircle" className="mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Performance Summary ({selectedTimeRange})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {performanceMetricsList.filter(Boolean).map((metric) => {
            const m = metric as MetricDisplay;
            return (
              <div key={m.label} className="flex flex-col gap-2">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", m.bgColor)}>
                  <AppIcon name={m.icon} className={cn("transition-colors", m.color)} size={20} />
                </div>
                <div>
                  <div className={cn("text-2xl font-bold transition-colors", m.color)}>{m.value}</div>
                  <div className="text-sm text-muted-foreground">{m.label}</div>
                  {m.description && (
                    <div className="text-xs text-muted-foreground mt-1">{m.description}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceSummary; 