import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'chart' | 'stat' | 'text' | 'dashboard' | 'form' | 'list' | 'avatar';
  count?: number;
  height?: number | string;
  width?: number | string;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  count = 1, 
  height = 100, 
  width = '100%',
  className 
}) => {
  const baseClass = 'animate-pulse bg-muted/50 dark:bg-muted/20 rounded-md';
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={cn(
            'p-6 border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm space-y-4',
            className
          )} style={{ height, width }}>
            <div className={cn(baseClass, 'h-6 w-3/4')} />
            <div className={cn(baseClass, 'h-4 w-1/2')} />
            <div className={cn(baseClass, 'h-20 w-full')} />
          </div>
        );
      
      case 'table':
        return (
          <div className={cn('space-y-3', className)}>
            <div className={cn(baseClass, 'h-10 w-full')} /> {/* Header */}
            {[...Array(count)].map((_, i) => (
              <div key={i} className={cn(baseClass, 'h-12 w-full')} />
            ))}
          </div>
        );
      
      case 'chart':
        return (
          <div className={cn('space-y-4', className)}>
            <div className={cn(baseClass, 'h-6 w-1/3')} />
            <div className={cn(baseClass, 'h-64 w-full')} />
            <div className="flex justify-between">
              <div className={cn(baseClass, 'h-4 w-16')} />
              <div className={cn(baseClass, 'h-4 w-16')} />
            </div>
          </div>
        );
      
      case 'stat':
        return (
          <div className={cn('p-6 border border-border/50 rounded-lg bg-card/50 space-y-3', className)}>
            <div className="flex items-center justify-between">
              <div className={cn(baseClass, 'h-5 w-24')} />
              <div className={cn(baseClass, 'h-5 w-5 rounded-full')} />
            </div>
            <div className={cn(baseClass, 'h-8 w-20')} />
            <div className={cn(baseClass, 'h-4 w-32')} />
          </div>
        );
      
      case 'dashboard':
        return (
          <div className={cn('space-y-6', className)}>
            {/* Header */}
            <div className="space-y-2">
              <div className={cn(baseClass, 'h-8 w-1/3')} />
              <div className={cn(baseClass, 'h-5 w-1/2')} />
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="p-6 border border-border/50 rounded-lg bg-card/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={cn(baseClass, 'h-4 w-20')} />
                    <div className={cn(baseClass, 'h-4 w-4 rounded-full')} />
                  </div>
                  <div className={cn(baseClass, 'h-7 w-16')} />
                  <div className={cn(baseClass, 'h-3 w-24')} />
                </div>
              ))}
            </div>
            
            {/* Chart */}
            <div className="p-6 border border-border/50 rounded-lg bg-card/50 space-y-4">
              <div className={cn(baseClass, 'h-6 w-1/4')} />
              <div className={cn(baseClass, 'h-80 w-full')} />
            </div>
          </div>
        );
      
      case 'form':
        return (
          <div className={cn('space-y-6', className)}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className={cn(baseClass, 'h-5 w-24')} />
                <div className={cn(baseClass, 'h-10 w-full')} />
              </div>
            ))}
          </div>
        );
      
      case 'list':
        return (
          <div className={cn('space-y-3', className)}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-border/50 rounded-lg">
                <div className={cn(baseClass, 'h-10 w-10 rounded-full')} />
                <div className="flex-1 space-y-2">
                  <div className={cn(baseClass, 'h-5 w-3/4')} />
                  <div className={cn(baseClass, 'h-4 w-1/2')} />
                </div>
                <div className={cn(baseClass, 'h-8 w-16')} />
              </div>
            ))}
          </div>
        );
      
      case 'avatar':
        return <div className={cn(baseClass, 'rounded-full', className)} style={{ height, width }} />;
      
      case 'text':
      default:
        return <div className={cn(baseClass, className)} style={{ height, width }} />;
    }
  };

  return renderSkeleton();
};

export default LoadingSkeleton; 