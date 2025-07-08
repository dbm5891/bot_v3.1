import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "../../lib/utils";
import { 
  BarChart3,
  Settings,
  Play,
  Download,
  Filter,
  Activity,
  CheckCircle,
  XCircle,
  Info,
  RefreshCw,
  MoreHorizontal,
  LucideIcon
} from "lucide-react";

// Lazy load heavy components
const BacktestResults = React.lazy(() => import('./BacktestResults'));
const StrategyConfiguration = React.lazy(() => import('./StrategyConfiguration'));
const PerformanceCharts = React.lazy(() => import('./PerformanceCharts'));

// Memoized loading component
const LoadingSkeleton = memo(() => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
  </div>
));

// Optimized tab interface
interface Tab {
  title: string;
  icon: LucideIcon;
  component: React.ComponentType<any>;
}

interface ExpandableTabsProps {
  tabs: Tab[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

// Memoized tab button component
const TabButton = memo(({ 
  tab, 
  index, 
  isSelected, 
  isHovered, 
  onClick, 
  onMouseEnter, 
  onMouseLeave,
  activeColor 
}: {
  tab: Tab;
  index: number;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  activeColor: string;
}) => {
  const Icon = tab.icon;
  
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300",
        isSelected
          ? cn("bg-muted", activeColor)
          : "hover:bg-muted hover:text-foreground"
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Icon 
        size={20} 
        style={{
          color: isSelected ? undefined : (isHovered ? "#2563eb" : "#737373"),
          transition: "color 0.3s ease"
        }}
      />
      <AnimatePresence>
        {isSelected && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="ml-2 overflow-hidden whitespace-nowrap"
          >
            {tab.title}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

// Optimized expandable tabs component
const ExpandableTabs = memo<ExpandableTabsProps>(({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const outsideClickRef = React.useRef<HTMLDivElement>(null);

  useOnClickOutside(outsideClickRef, useCallback(() => {
    setSelected(null);
    onChange?.(null);
  }, [onChange]));

  const handleSelect = useCallback((index: number) => {
    setSelected(index);
    onChange?.(index);
  }, [onChange]);

  const handleMouseEnter = useCallback((index: number) => {
    setHoveredIndex(index);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
  }, []);

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-1 shadow-dashboard hover:shadow-card-hover transition-shadow duration-200",
        className
      )}
    >
      {tabs.map((tab, index) => (
        <TabButton
          key={tab.title}
          tab={tab}
          index={index}
          isSelected={selected === index}
          isHovered={hoveredIndex === index}
          onClick={() => handleSelect(index)}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          activeColor={activeColor}
        />
      ))}
    </div>
  );
});

// Optimized sparkline chart component
const SparklineChart = memo(({ 
  data, 
  color, 
  width = 100, 
  height = 30 
}: { 
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) => {
  const pathData = useMemo(() => {
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal;
    
    return data.map((value, index) => {
      const x = (data.length > 1 ? (index / (data.length - 1)) : 0.5) * width;
      const y = height - (range !== 0 ? ((value - minVal) / range) * height : height / 2);
      return `${x},${y}`;
    }).join(' ');
  }, [data, width, height]);

  const gradientId = useMemo(() => `gradient-${color.replace('#', '')}`, [color]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon 
        points={`0,${height} ${pathData} ${width},${height}`}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
});

// Quick stats component
const QuickStats = memo(() => {
  const stats = useMemo(() => [
    { label: "Active Strategies", value: "12", trend: "up" },
    { label: "Running Tests", value: "3", trend: "neutral" },
    { label: "Completed Today", value: "8", trend: "up" },
    { label: "Best Strategy", value: "RSI Mean Reversion", trend: "up" }
  ], []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-border/50"
        >
          <div className="text-sm text-muted-foreground">{stat.label}</div>
          <div className="text-xl font-semibold mt-1">{stat.value}</div>
          <div className="flex items-center mt-2">
            <Activity className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-xs text-muted-foreground">Active</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
});

// Main optimized component
export const OptimizedBacktestingPage = memo(() => {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  
  const tabs = useMemo(() => [
    {
      title: "Configuration",
      icon: Settings,
      component: StrategyConfiguration
    },
    {
      title: "Results",
      icon: BarChart3,
      component: BacktestResults
    },
    {
      title: "Performance",
      icon: Activity,
      component: PerformanceCharts
    }
  ], []);

  const handleTabChange = useCallback((index: number | null) => {
    setActiveTab(index);
  }, []);

  const ActiveComponent = useMemo(() => {
    if (activeTab !== null && tabs[activeTab]) {
      return tabs[activeTab].component;
    }
    return null;
  }, [activeTab, tabs]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Backtesting Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced strategy testing and optimization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
          <button className="p-2 border border-border rounded-lg hover:bg-muted transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <QuickStats />

      {/* Navigation Tabs */}
      <ExpandableTabs 
        tabs={tabs}
        onChange={handleTabChange}
        className="mb-6"
      />

      {/* Content Area */}
      <div className="min-h-[400px]">
        <React.Suspense fallback={<LoadingSkeleton />}>
          {ActiveComponent && <ActiveComponent />}
        </React.Suspense>
      </div>
    </div>
  );
});

export default OptimizedBacktestingPage;