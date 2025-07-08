import { useState } from 'react';
import AppIcon from '../icons/AppIcon';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardHeaderProps {
  onRefresh: () => void;
  lastRefreshed?: string;
  autoRefreshInterval?: number;
  onAutoRefreshIntervalChange: (interval: number | undefined) => void;
  loading?: boolean;
  showBenchmark?: boolean;
  handleBenchmarkToggle?: (checked: boolean) => void;
  className?: string;
}

const AUTO_REFRESH_OPTIONS = [
  { label: 'Off', value: undefined },
  { label: '15s', value: 15 },
  { label: '30s', value: 30 },
  { label: '1m', value: 60 },
];

export default function DashboardHeader({
  onRefresh,
  lastRefreshed,
  autoRefreshInterval,
  onAutoRefreshIntervalChange,
  loading,
  showBenchmark,
  handleBenchmarkToggle,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between px-6 py-4 bg-card border border-border rounded-lg", className)}>
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-lg">Dashboard</h2>
        {lastRefreshed && (
          <div className="flex items-center bg-muted px-2 py-1 rounded-md text-xs">
            <AppIcon name="Clock" className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground">Last refreshed: {lastRefreshed}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={loading}
          className={cn(
            "transition-all duration-200",
            loading && "animate-spin"
          )}
        >
          <AppIcon name="RefreshCw" className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <AppIcon name="Clock" className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {AUTO_REFRESH_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.label}
                onClick={() => onAutoRefreshIntervalChange(option.value)}
                className={cn(
                  "cursor-pointer",
                  autoRefreshInterval === option.value && "font-medium bg-primary/10"
                )}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {showBenchmark !== undefined && handleBenchmarkToggle && (
          <div className="flex items-center gap-2">
            <Switch
              id="show-benchmark"
              checked={showBenchmark}
              onCheckedChange={handleBenchmarkToggle}
            />
            <Label htmlFor="show-benchmark" className="text-sm">
              Show Benchmark
            </Label>
          </div>
        )}
      </div>
    </header>
  );
} 