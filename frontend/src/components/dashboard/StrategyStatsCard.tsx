import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import your preferred icons from lucide-react or heroicons
import { ArrowRight, CheckCircle, TrendingUp, TrendingDown, Timer, Calendar, BarChart3, Info, Play, AlertTriangle } from 'lucide-react';
import { cn } from "@/lib/utils";

// Utility to format date strings
const formatDateString = (dateStr: string | undefined, locale: string = 'en-US'): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffDays = Math.round(diffSeconds / (24 * 60 * 60));
    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.round(diffSeconds / 60)} min ago`;
    if (diffSeconds < 86400) return `${Math.round(diffSeconds / 3600)} hr ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

interface StrategyStats {
  id: string;
  name: string;
  isActive: boolean;
  returns: number;
  trades: number;
  winRate: number;
  lastUpdated: string;
  description?: string;
}

interface StrategyStatsCardProps {
  strategies: StrategyStats[];
  loading?: boolean;
  error?: string | null;
  onViewDetails: (id: string) => void;
  variant?: 'outlined' | 'elevation';
  className?: string;
}

const StrategyStatsCard: React.FC<StrategyStatsCardProps> = ({
  strategies,
  loading = false,
  error = null,
  onViewDetails,
  className,
}) => {
  if (loading) {
    return (
      <Card className={cn("w-full h-full flex flex-col", className)}>
        <CardHeader className="font-semibold text-lg">Active Strategies</CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="w-full h-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full h-full flex flex-col", className)}>
        <CardHeader className="font-semibold text-lg">Active Strategies</CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!strategies || strategies.length === 0) {
    return (
      <Card className={cn("w-full h-full flex flex-col", className)}>
        <CardHeader className="font-semibold text-lg">Active Strategies</CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground text-center">No active strategies found.</div>
        </CardContent>
      </Card>
    );
  }

  const sortedStrategies = [...strategies].sort((a, b) => b.returns - a.returns);

  return (
    <Card className={cn("w-full h-full flex flex-col", className)}>
      <div className="p-4 border-b flex items-center justify-between">
        <span className="font-semibold text-lg">Top Active Strategies</span>
        <Button variant="ghost" size="icon" onClick={() => onViewDetails('all')} className="gap-1">
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>
      <CardContent className="flex-1 overflow-y-auto p-0">
        <ul className="divide-y">
          {sortedStrategies.map((strategy) => (
            <li
              key={strategy.id}
              className="flex items-center px-4 py-3 hover:bg-accent cursor-pointer transition-colors"
              onClick={() => onViewDetails(strategy.id)}
            >
              <div className="flex flex-col items-center mr-4">
                <BarChart3 className={`w-6 h-6 ${strategy.isActive ? 'text-green-500' : 'text-muted-foreground'}`} />
                {strategy.isActive && <CheckCircle className="w-4 h-4 text-green-500 mt-1" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium truncate mr-2">{strategy.name}</span>
                  <span className="flex items-center gap-1 text-xs">
                    {strategy.returns >= 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                    <span className={strategy.returns >= 0 ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}>{strategy.returns}%</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {strategy.trades} trades</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDateString(strategy.lastUpdated)}</span>
                  <span className="flex items-center gap-1"><Info className="w-3 h-3" /> {strategy.winRate}% win</span>
                </div>
                {strategy.description && (
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{strategy.description}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default StrategyStatsCard; 