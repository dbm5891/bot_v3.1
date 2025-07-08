import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import AppIcon from '../icons/AppIcon';
import type { LucideProps } from 'lucide-react';

interface DeltaProps {
  value: number | string;
  trend?: 'up' | 'down' | 'neutral';
}

interface StatCardProps {
  title: string;
  value: number | string;
  delta?: DeltaProps;
  icon?: React.ReactElement | keyof typeof import('lucide-react');
  color?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  onClick?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryValue?: string;
  precision?: number;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  delta,
  icon,
  description,
  loading = false,
  error = null,
  onClick,
  action,
  secondaryValue,
  precision = 2,
  prefix = '',
  suffix = '',
  tooltip,
  variant = 'default',
  className,
}) => {
  // Format numeric values
  const formattedValue = typeof value === 'number'
    ? `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}${suffix}`
    : `${prefix}${value}${suffix}`;
  
  // Format delta values
  const formattedDelta = delta && typeof delta.value === 'number' 
    ? delta.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : delta?.value;

  // Get variant-based colors
  const getVariantClasses = (variant: StatCardProps['variant']) => {
    switch (variant) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'destructive':
        return 'text-destructive';
      default:
        return 'text-primary';
    }
  };

  // Determine icon to use
  const renderIcon = () => {
    if (!icon) return null;
    
    if (React.isValidElement(icon)) {
      const iconProps = icon.props as LucideProps;
      return React.cloneElement(icon, {
        ...iconProps,
        className: cn(getVariantClasses(variant), iconProps.className)
      });
    }
    
    if (typeof icon === 'string') {
      return <AppIcon name={icon} size={24} className={getVariantClasses(variant)} />;
    }
    
    return null;
  };

  // Determine delta icon and color
  const getDeltaContent = () => {
    if (!delta) return null;

    const trend = delta.trend || (typeof delta.value === 'number' ? (delta.value > 0 ? 'up' : delta.value < 0 ? 'down' : 'neutral') : 'neutral');
    
    const trendConfig = {
      up: {
        icon: 'ArrowUp' as const,
        class: 'text-success',
      },
      down: {
        icon: 'ArrowDown' as const,
        class: 'text-destructive',
      },
      neutral: {
        icon: 'ArrowRight' as const,
        class: 'text-muted-foreground',
      },
    };

    return (
      <div className={cn("flex items-center gap-1", trendConfig[trend].class)}>
        <AppIcon name={trendConfig[trend].icon} size={16} />
        <span className="text-sm font-medium">{formattedDelta}%</span>
      </div>
    );
  };

  const cardContent = (
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {renderIcon()}
            <h3 className="font-medium text-foreground">{title}</h3>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-foreground">
              {formattedValue}
            </div>
            {secondaryValue && (
              <div className="text-sm text-muted-foreground">
                {secondaryValue}
              </div>
            )}
          </div>
          {delta && getDeltaContent()}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="text-muted-foreground hover:text-foreground"
          >
            {action.label}
          </Button>
        )}
      </div>
    </CardContent>
  );

  const card = (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {loading ? (
        <div className="p-6 flex items-center justify-center">
          <AppIcon name="Loader" className="animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="p-6 text-center text-destructive">
          <AppIcon name="AlertCircle" className="mx-auto mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        cardContent
      )}
    </Card>
  );

  return tooltip ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {card}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : card;
};

export default StatCard;