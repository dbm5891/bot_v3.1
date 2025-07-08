import React from 'react';
import { cn } from "@/lib/utils";
import AppIcon from '../icons/AppIcon';
import { Card, CardContent, CardHeader } from '../ui/card';

interface StatusProps {
  loading?: boolean;
  error?: string;
  warning?: string;
}

interface StatusCardProps {
  strategiesStatus: StatusProps;
  dataStatus: StatusProps;
  backtestingStatus: StatusProps;
  portfolioStatus: StatusProps;
  className?: string;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  strategiesStatus,
  dataStatus,
  backtestingStatus,
  portfolioStatus,
  className,
}) => {
  const getStatusDetails = (status: StatusProps): string => {
    if (status.loading) return 'Fetching latest data...';
    if (status.error) return status.error;
    if (status.warning) return status.warning;
    return 'Data synchronized and up to date.';
  };

  const getStatusChipProps = (status: StatusProps) => {
    if (status.loading) {
      return { 
        label: 'Loading', 
        color: 'default' as const, 
        icon: <AppIcon name="Loader" className="animate-spin" size={16} />,
      };
    }
    if (status.error) {
      return { 
        label: 'Error', 
        color: 'error' as const, 
        icon: <AppIcon name="AlertCircle" size={16} />,
      };
    }
    if (status.warning) {
      return {
        label: 'Warning',
        color: 'warning' as const,
        icon: <AppIcon name="AlertTriangle" size={16} />,
      };
    }
    return {
      label: 'OK',
      color: 'success' as const,
      icon: <AppIcon name="Check" size={16} />,
    };
  };

  const statusItems = [
    {
      name: 'Strategies Definition',
      ...getStatusChipProps(strategiesStatus),
      details: getStatusDetails(strategiesStatus),
    },
    {
      name: 'Market Data Feeds',
      ...getStatusChipProps(dataStatus),
      details: getStatusDetails(dataStatus),
    },
    {
      name: 'Backtesting Engine',
      ...getStatusChipProps(backtestingStatus),
      details: getStatusDetails(backtestingStatus),
    },
    {
      name: 'Portfolio Tracking',
      ...getStatusChipProps(portfolioStatus),
      details: getStatusDetails(portfolioStatus),
    }
  ];

  const chipColorClass = (color: string) => {
    switch (color) {
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="text-lg font-semibold">System Status</CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between py-2 border-b last:border-b-0 border-border">
              <div>
                <div className="font-medium text-foreground">{item.name}</div>
                {item.details && (
                  <div className="text-sm text-muted-foreground mt-1">{item.details}</div>
                )}
              </div>
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                chipColorClass(item.color)
              )}>
                {item.icon}
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;