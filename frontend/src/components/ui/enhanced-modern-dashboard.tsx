'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, animate, Transition } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Target, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Settings,
  RefreshCw,
  Calendar,
  Filter,
  Database,
  LineChart,
  BarChart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { useDashboardData } from '../../hooks/useDashboardData';
import { AppDispatch } from '../../store';
import { addNotification } from '../../store/slices/uiSlice';

// GlowEffect Component (same as before)
export type GlowEffectProps = {
  className?: string;
  style?: React.CSSProperties;
  colors?: string[];
  mode?: 'rotate' | 'pulse' | 'breathe' | 'colorShift' | 'flowHorizontal' | 'static';
  blur?: number | 'softest' | 'soft' | 'medium' | 'strong' | 'stronger' | 'strongest' | 'none';
  transition?: Transition;
  scale?: number;
  duration?: number;
};

function GlowEffect({
  className,
  style,
  colors = ['#FF5733', '#33FF57', '#3357FF', '#F1C40F'],
  mode = 'rotate',
  blur = 'medium',
  transition,
  scale = 1,
  duration = 5,
}: GlowEffectProps) {
  const BASE_TRANSITION = {
    repeat: Infinity,
    duration: duration,
    ease: 'linear' as const,
  };

  const animations = {
    rotate: {
      background: [
        `conic-gradient(from 0deg at 50% 50%, ${colors.join(', ')})`,
        `conic-gradient(from 360deg at 50% 50%, ${colors.join(', ')})`,
      ],
      transition: {
        ...(transition ?? BASE_TRANSITION),
      },
    },
    pulse: {
      background: colors.map(
        (color) =>
          `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
      ),
      scale: [1 * scale, 1.1 * scale, 1 * scale],
      opacity: [0.5, 0.8, 0.5],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror',
        }),
      },
    },
    breathe: {
      background: [
        ...colors.map(
          (color) =>
            `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 100%)`
        ),
      ],
      scale: [1 * scale, 1.05 * scale, 1 * scale],
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror',
        }),
      },
    },
    colorShift: {
      background: colors.map((color, index) => {
        const nextColor = colors[(index + 1) % colors.length];
        return `conic-gradient(from 0deg at 50% 50%, ${color} 0%, ${nextColor} 50%, ${color} 100%)`;
      }),
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror',
        }),
      },
    },
    flowHorizontal: {
      background: colors.map((color) => {
        const nextColor = colors[(colors.indexOf(color) + 1) % colors.length];
        return `linear-gradient(to right, ${color}, ${nextColor})`;
      }),
      transition: {
        ...(transition ?? {
          ...BASE_TRANSITION,
          repeatType: 'mirror',
        }),
      },
    },
    static: {
      background: `linear-gradient(to right, ${colors.join(', ')})`,
    },
  };

  const getBlurClass = (blur: GlowEffectProps['blur']) => {
    if (typeof blur === 'number') {
      return `blur-[${blur}px]`;
    }

    const presets = {
      softest: 'blur-sm',
      soft: 'blur',
      medium: 'blur-md',
      strong: 'blur-lg',
      stronger: 'blur-xl',
      strongest: 'blur-xl',
      none: 'blur-none',
    };

    return presets[blur as keyof typeof presets];
  };

  return (
    <motion.div
      style={
        {
          ...style,
          '--scale': scale,
          willChange: 'transform',
          backfaceVisibility: 'hidden',
        } as React.CSSProperties
      }
      animate={animations[mode]}
      className={cn(
        'pointer-events-none absolute inset-0 h-full w-full',
        'scale-[var(--scale)] transform-gpu',
        getBlurClass(blur),
        className
      )}
    />
  );
}

// GlowingEffect Component for interactive hover effects
interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: 'default' | 'white';
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = 'default',
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty('--active', '0');
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty('--active', isActive ? '1' : '0');

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue('--start')) || 0;
          let targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty('--start', String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener('scroll', handleScroll, { passive: true });
      document.body.addEventListener('pointermove', handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener('scroll', handleScroll);
        document.body.removeEventListener('pointermove', handlePointerMove);
      };
    }, [handleMove, disabled]);

    return (
      <>
        <div
          className={cn(
            'pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity',
            glow && 'opacity-100',
            variant === 'white' && 'border-white',
            disabled && '!block'
          )}
        />
        <div
          ref={containerRef}
          style={
            {
              '--blur': `${blur}px`,
              '--spread': spread,
              '--start': '0',
              '--active': '0',
              '--glowingeffect-border-width': `${borderWidth}px`,
              '--repeating-conic-gradient-times': '5',
              '--gradient':
                variant === 'white'
                  ? `repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  var(--black),
                  var(--black) calc(25% / var(--repeating-conic-gradient-times))
                )`
                  : `radial-gradient(circle, #3b82f6 10%, #3b82f600 20%),
                radial-gradient(circle at 40% 40%, #8b5cf6 5%, #8b5cf600 15%),
                radial-gradient(circle at 60% 60%, #10b981 10%, #10b98100 20%), 
                radial-gradient(circle at 40% 60%, #06b6d4 10%, #06b6d400 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #3b82f6 0%,
                  #8b5cf6 calc(25% / var(--repeating-conic-gradient-times)),
                  #10b981 calc(50% / var(--repeating-conic-gradient-times)), 
                  #06b6d4 calc(75% / var(--repeating-conic-gradient-times)),
                  #3b82f6 calc(100% / var(--repeating-conic-gradient-times))
                )`,
            } as React.CSSProperties
          }
          className={cn(
            'pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity',
            glow && 'opacity-100',
            blur > 0 && 'blur-[var(--blur)] ',
            className,
            disabled && '!hidden'
          )}
        >
          <div
            className={cn(
              'glow',
              'rounded-[inherit]',
              'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
              'after:[border:var(--glowingeffect-border-width)_solid_transparent]',
              'after:[background:var(--gradient)] after:[background-attachment:fixed]',
              'after:opacity-[var(--active)] after:transition-opacity after:duration-300',
              'after:[mask-clip:padding-box,border-box]',
              'after:[mask-composite:intersect]',
              'after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]'
            )}
          />
        </div>
      </>
    );
  }
);

GlowingEffect.displayName = 'GlowingEffect';

// Enhanced components that use real data
interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  description?: string;
  onClick?: () => void;
}

function MetricCard({ title, value, change, changeType, icon, description, onClick }: MetricCardProps) {
  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <Card className="relative p-6 bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/50 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 rounded-none">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <div className="flex items-center space-x-1">
                {changeType === 'positive' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  changeType === 'positive' ? "text-green-600" : "text-red-600"
                )}>
                  {change}
                </span>
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Chart Card Component
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

function ChartCard({ title, children, actions }: ChartCardProps) {
  return (
    <div className="relative group">
      <GlowingEffect
        spread={60}
        glow={true}
        disabled={false}
        proximity={80}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <Card className="relative p-6 bg-gradient-to-br from-white via-white to-slate-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700/30 border-slate-200/60 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 group-hover:shadow-xl rounded-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
        {children}
      </Card>
    </div>
  );
}

export default function EnhancedModernDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  
  // Use the real dashboard data hook
  const {
    loading,
    errors,
    strategies,
    availableData,
    results: recentBacktests,
    performanceData,
    metrics,
    refreshData,
    formatLastRefreshed,
  } = useDashboardData('ALL');
  
  const timeframes = ['1H', '4H', '1D', '1W', '1M'];
  
  // Create metrics from real data
  const dashboardMetrics = [
    {
      title: 'Total Strategies',
      value: strategies?.length || 0,
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <Target className="h-5 w-5 text-primary" />,
      description: 'Active trading strategies',
      onClick: () => navigate('/strategies')
    },
    {
      title: 'Available Datasets',
      value: availableData?.length || 0,
      change: '+8%',
      changeType: 'positive' as const,
      icon: <Database className="h-5 w-5 text-primary" />,
      description: 'Market data sources',
      onClick: () => navigate('/data')
    },
    {
      title: 'Recent Backtests',
      value: recentBacktests?.length || 0,
      change: '-2%',
      changeType: 'negative' as const,
      icon: <BarChart className="h-5 w-5 text-primary" />,
      description: 'Completed this month',
      onClick: () => navigate('/backtesting')
    },
    {
      title: 'Performance Score',
      value: metrics?.totalReturn ? `${metrics.totalReturn.toFixed(1)}%` : 'N/A',
      change: metrics?.monthlyReturn ? `${metrics.monthlyReturn > 0 ? '+' : ''}${metrics.monthlyReturn.toFixed(1)}%` : '0%',
      changeType: (metrics?.monthlyReturn || 0) >= 0 ? 'positive' as const : 'negative' as const,
      icon: <Activity className="h-5 w-5 text-primary" />,
      description: 'Total return rate',
      onClick: () => navigate('/analytics')
    }
  ];

  const handleRefresh = () => {
    refreshData();
    dispatch(addNotification({ 
      message: 'Dashboard data refreshed successfully', 
      type: 'success' 
    }));
  };

  // Enhanced loading state
  if (loading.global) {
    return (
      <div className="min-h-screen">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <GlowEffect
            colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']}
            mode="breathe"
            blur="strongest"
            className="opacity-10 dark:opacity-5"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
              <div className="h-4 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
            </div>
            <div className="h-10 w-32 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden border border-slate-200/60 dark:border-slate-700/60 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                                              <div className="w-10 h-10 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded-lg" />
                        <div className="h-4 w-16 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                    </div>
                                          <div className="h-4 w-3/4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                      <div className="h-8 w-1/2 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%] animate-[shimmer_2s_infinite] rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <GlowEffect
          colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']}
          mode="breathe"
          blur="strongest"
          className="opacity-10 dark:opacity-5"
        />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Trading Dashboard</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Monitor your algorithmic trading performance • Last updated: {formatLastRefreshed()}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-white/80 dark:bg-slate-800/80 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
              {timeframes.map((tf) => (
                <Button
                  key={tf}
                  variant={selectedTimeframe === tf ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(tf)}
                  className="text-xs"
                >
                  {tf}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Metrics Grid with Real Data */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
        >
          {dashboardMetrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <MetricCard {...metric} />
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Performance Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-2"
          >
            <ChartCard 
              title="Strategy Performance" 
              actions={
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/analytics')}>
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              }
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center space-x-3 flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/backtesting')}
                      className="flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>New Backtest</span>
                    </Button>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>Active Strategies: {strategies?.length || 0}</span>
                      <span>•</span>
                      <span>Data Sources: {availableData?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="relative h-64 bg-gradient-to-br from-slate-100/40 to-slate-50/20 dark:from-slate-800/40 dark:to-slate-900/20 rounded-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
                  <GlowEffect
                    colors={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']}
                    mode="flowHorizontal"
                    blur="soft"
                    className="opacity-20"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <BarChart3 className="h-12 w-12 text-slate-500 dark:text-slate-400 mx-auto" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">Performance Visualization</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {performanceData?.length ? `${performanceData.length} data points` : 'No data available'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Simulated chart elements */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex justify-between items-end h-16">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="bg-gradient-to-t from-primary/60 to-primary/20 rounded-t"
                          style={{ width: '3px' }}
                          initial={{ height: 0 }}
                          animate={{ 
                            height: Math.random() * 60 + 10,
                            transition: { delay: i * 0.1, duration: 0.5 }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ChartCard>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <ChartCard title="Recent Backtests">
              <div className="space-y-3">
                {recentBacktests && recentBacktests.length > 0 ? (
                  recentBacktests.slice(0, 4).map((backtest, index) => (
                    <motion.div
                      key={backtest.id || index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-slate-50/50 to-white/30 dark:from-slate-800/50 dark:to-slate-700/30 border border-slate-200/40 dark:border-slate-700/40 hover:border-slate-300/60 dark:hover:border-slate-600/60 transition-colors cursor-pointer"
                      onClick={() => navigate(`/backtest/${backtest.id}`)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {backtest.strategyName || 'Strategy'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {backtest.symbol || 'Multiple'} • {backtest.createdAt || 'Recent'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-medium",
                          (backtest.totalReturn || 0) >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {backtest.totalReturn ? `${backtest.totalReturn > 0 ? '+' : ''}${backtest.totalReturn.toFixed(2)}%` : 'N/A'}
                        </p>
                        <p className="text-xs text-muted-foreground">Return</p>
                      </div>
                    </motion.div>
                  ))
                                  ) : (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No recent backtests</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => navigate('/backtesting')}
                    >
                      Start Backtest
                    </Button>
                  </div>
                )}
              </div>
            </ChartCard>
            
            <ChartCard title="Quick Actions">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-16 flex-col space-y-1"
                  onClick={() => navigate('/strategies')}
                >
                  <Target className="h-5 w-5" />
                  <span className="text-xs">Strategies</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col space-y-1"
                  onClick={() => navigate('/backtesting')}
                >
                  <Play className="h-5 w-5" />
                  <span className="text-xs">Backtest</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col space-y-1"
                  onClick={() => navigate('/data')}
                >
                  <Database className="h-5 w-5" />
                  <span className="text-xs">Data</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col space-y-1"
                  onClick={() => navigate('/analytics')}
                >
                  <LineChart className="h-5 w-5" />
                  <span className="text-xs">Analytics</span>
                </Button>
              </div>
            </ChartCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 