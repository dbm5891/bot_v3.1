import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';
import { CardHeader, CardContent } from '@/components/ui/card';

const formatDateString = (dateStr: string | undefined, locale: string = 'en-US'): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffDays = Math.round(diffSeconds / (24 * 60 * 60));
    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.round(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.round(diffSeconds / 3600)}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays <= 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

interface BacktestResult {
  id: string;
  strategyName: string;
  symbol: string;
  timeframe: string;
  totalReturn?: string | number;
  createdAt?: string;
}

interface RecentBacktestsProps {
  backtests: BacktestResult[];
  loading?: boolean;
  error?: string | null;
  onViewDetails: (id: string) => void;
}

const RecentBacktests: React.FC<RecentBacktestsProps> = ({ 
  backtests, 
  loading, 
  error,
  onViewDetails,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="w-full h-32 bg-muted animate-pulse rounded" />;
  }

  if (error) {
    return <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />{error}</div>;
  }

  if (!backtests || backtests.length === 0) {
    return (
      <div className="text-center p-4">
        <div className="text-muted-foreground mb-2">No recent backtests found.</div>
        <Button 
          variant="outline" 
          onClick={() => navigate('/backtesting')}
          className="gap-1"
        >
          <PlusCircle className="w-4 h-4" /> Run a New Backtest
        </Button>
      </div>
    );
  }

  const getReturnValue = (value: string | number | undefined): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value.replace('%','')) || 0;
    return 0;
  };

  const topBacktests = backtests.slice(0, 4);

  return (
    <CardHeader className="text-lg font-semibold">
      <CardContent className="p-4">
        <ul className="divide-y">
          {topBacktests.map((backtest) => {
            const returnValue = getReturnValue(backtest.totalReturn);
            const isPositive = returnValue >= 0;
            return (
              <li
                key={backtest.id}
                className="flex items-center px-4 py-3 hover:bg-accent cursor-pointer transition-colors"
                onClick={() => onViewDetails(backtest.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate mr-2">{backtest.strategyName}</span>
                    <span className="inline-block border rounded px-2 py-0.5 text-xs text-primary border-primary bg-primary/10 ml-2">{backtest.symbol}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {isPositive ? <TrendingUp className="w-5 h-5 text-green-500" /> : <TrendingDown className="w-5 h-5 text-red-500" />}
                      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>{isPositive ? '+' : ''}{returnValue.toFixed(2)}%</span>
                    </span>
                    <span>{formatDateString(backtest.createdAt)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </CardHeader>
  );
};

export default RecentBacktests;