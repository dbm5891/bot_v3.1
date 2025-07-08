import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchIndexQuotes, IndexQuote } from '../../store/slices/marketDataSlice';
import { 
  RefreshCw, 
  Clock, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface MarketStatusCardProps {
  onRefreshProp?: () => void;
  className?: string;
}

const MarketStatusCard: React.FC<MarketStatusCardProps> = ({
  onRefreshProp,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { 
    indices, 
    loading: marketDataLoading, 
    error: marketDataError, 
    lastUpdated 
  } = useSelector((state: RootState) => state.marketData);

  const handleRefresh = useCallback(() => {
    dispatch(fetchIndexQuotes());
    if (onRefreshProp) {
      onRefreshProp();
    }
  }, [dispatch, onRefreshProp]);

  useEffect(() => {
    if (!lastUpdated) {
      dispatch(fetchIndexQuotes());
    }
  }, [dispatch, lastUpdated]);

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };

  const isLoading = marketDataLoading;
  const displayError = marketDataError;

  if (isLoading && indices.length === 0) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <h3 className="font-medium text-lg">Market Status</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                disabled={isLoading}
                onClick={handleRefresh}
                aria-label="Refresh market data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh market data</p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayError) {
    let detailedErrorMessage = 'An unexpected error occurred.';
    if (typeof displayError === 'string' && displayError.includes("Invalid API KEY")) {
      detailedErrorMessage = "Invalid API Key. Please verify your API key in application settings.";
    } else if (typeof displayError === 'object' && displayError !== null && (displayError as any).message) {
      detailedErrorMessage = (displayError as any).message;
      if (detailedErrorMessage.includes("Invalid API KEY")) {
        detailedErrorMessage = "Invalid API Key. Please verify your API key in application settings.";
      }
    } else if (typeof displayError === 'string') {
      detailedErrorMessage = displayError;
    }

    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <h3 className="font-medium text-lg">Market Status</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                aria-label="Refresh market data"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh market data</p>
            </TooltipContent>
          </Tooltip>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="bg-destructive/10 text-destructive rounded-lg p-4">
            <p className="font-medium">Market Data Connection Issue</p>
            <p className="text-sm mt-2 text-destructive/90">{detailedErrorMessage}</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="mt-4 w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  const displayedIndices = indices.slice(0, 4);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <h3 className="font-medium text-lg">Market Status</h3>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="flex items-center bg-muted px-2 py-1 rounded-md text-xs">
              <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
              <span className="text-muted-foreground">{formatTimestamp(lastUpdated)}</span>
            </div>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                disabled={isLoading}
                aria-label="Refresh market data"
                className={cn(
                  "transition-all duration-200",
                  isLoading && "animate-spin"
                )}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh market data</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        {displayedIndices.length === 0 && !isLoading ? (
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No market index data available.
              <br />
              Please check your API key or network connection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y divide-border sm:divide-y-0">
            {displayedIndices.map((indexData: IndexQuote, arrayIndex) => {
              const isPositive = indexData.change >= 0;
              const changeColor = isPositive ? "text-success" : "text-destructive";
              const bgColor = isPositive ? "bg-success/10" : "bg-destructive/10";
              
              return (
                <div 
                  key={indexData.symbol} 
                  className={cn(
                    "p-4 hover:bg-muted/40 transition-colors",
                    arrayIndex % 2 === 0 && "sm:border-r sm:border-border"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{indexData.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{indexData.symbol}</p>
                    </div>
                    <div className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                      bgColor,
                      changeColor
                    )}>
                      {isPositive ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : (
                        <ArrowDown className="h-3 w-3" />
                      )}
                      {Math.abs(indexData.change).toFixed(2)}%
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-semibold">
                      {indexData.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className={cn("text-sm", changeColor)}>
                      {isPositive ? '+' : ''}{indexData.change.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Example usage
export default MarketStatusCard; 