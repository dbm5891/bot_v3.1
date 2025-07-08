import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, ArrowRight, CalendarDays } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchCalendarEvents, CalendarEvent, clearCalendarError } from '../../store/slices/tradingCalendarSlice';
import { cn } from "@/lib/utils";

interface TradingCalendarProps {
  onViewAll?: () => void;
  daysToFetch?: number;
  className?: string;
}

const FETCH_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

const TradingCalendar: React.FC<TradingCalendarProps> = ({
  onViewAll,
  daysToFetch = 14,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    events: calendarEvents, 
    loading,
    error,
    lastUpdated 
  } = useSelector((state: RootState) => state.tradingCalendar);

  const handleRefresh = () => {
    const now = Date.now();
    const lastFetch = Number(localStorage.getItem('tradingCalendarLastFetch'));
    if (!lastFetch || now - lastFetch > FETCH_COOLDOWN_MS) {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + daysToFetch);
      dispatch(fetchCalendarEvents({ from: today, to: futureDate }));
      localStorage.setItem('tradingCalendarLastFetch', now.toString());
    }
  };

  useEffect(() => {
    if (!lastUpdated && !loading) {
      handleRefresh();
    }
  }, [dispatch, lastUpdated, loading, daysToFetch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading && calendarEvents.length === 0) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="font-semibold text-lg">
          Trading Calendar
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-full h-32 bg-muted animate-pulse rounded" />
          <div className="w-2/3 h-4 bg-muted animate-pulse rounded" />
          <div className="w-1/2 h-4 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("h-full", className)}>
        <CardHeader className="font-semibold text-lg">
          Trading Calendar
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" />{error}</div>
          <Button 
            onClick={() => {
              dispatch(clearCalendarError());
              handleRefresh();
            }}
            variant="outline" 
            size="sm"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="font-semibold text-lg">
        Trading Calendar
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {calendarEvents.length === 0 ? (
          <div className="p-4 text-center flex flex-col items-center justify-center h-full text-muted-foreground">
            No upcoming trading events for the selected period.<br />
            {onViewAll
              ? <span>Try refreshing, or use the <ArrowRight className="inline w-4 h-4 align-text-bottom mx-1" /> button to view all events and adjust filters.</span>
              : (lastUpdated ? 'Try refreshing or consider broadening your filter criteria.' : 'Fetching events...')}
          </div>
        ) : (
          <ul className="divide-y">
            {Array.from(new Map(calendarEvents.slice(0, 5).map(e => [e.id, e])).values()).map((event) => (
              <li key={event.id} className="flex items-center px-4 py-3 gap-3">
                <CalendarDays className="w-5 h-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                    <span>{formatDate(event.date)}</span>
                    {event.description && <span className="truncate">{event.description}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingCalendar; 