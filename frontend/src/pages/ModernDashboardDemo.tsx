import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, animate, Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useDashboardData } from '../hooks/useDashboardData';
import { AppDispatch } from '../store';
import { addNotification } from '../store/slices/uiSlice';
import ModernTradingDashboard from '../components/ui/modern-trading-dashboard';

// GlowEffect Component
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

// Enhanced Modern Dashboard with Real Data Integration
const ModernDashboardDemo: React.FC = () => {
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

  const handleRefresh = () => {
    refreshData();
    dispatch(addNotification({ 
      message: 'Dashboard data refreshed successfully', 
      type: 'success' 
    }));
  };

  // Always show the enhanced version with beautiful effects
  if (true) {
    return (
      <div className="min-h-screen p-6 relative">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <GlowEffect
            colors={['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981']}
            mode="breathe"
            blur="strongest"
            className="opacity-5"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto space-y-8">
          {/* Enhanced Header with Real Data */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Modern Trading Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor your algorithmic trading performance • Last updated: {formatLastRefreshed()}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-card/50 backdrop-blur rounded-lg p-1 border border-border/50">
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
              <Button variant="outline" size="sm" onClick={handleRefresh} className="shadow-lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </motion.div>

          {/* Enhanced Metrics Grid with Real Data */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {/* Total Strategies */}
                         <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="relative group cursor-pointer"
               onClick={() => navigate('/strategies')}
             >
               <GlowingEffect
                 spread={40}
                 glow={true}
                 disabled={false}
                 proximity={64}
                 inactiveZone={0.01}
                 borderWidth={2}
               />
               <Card className="relative p-6 bg-gradient-to-br from-background via-background to-primary/5 border-border/50 hover:border-primary/40 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 hover:shadow-primary/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Strategies</p>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{strategies?.length || 0}</p>
                      <div className="flex items-center space-x-1">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">+12.5%</span>
                        <span className="text-sm text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Active trading strategies</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Available Datasets */}
                         <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.15 }}
               className="relative group cursor-pointer"
               onClick={() => navigate('/data')}
             >
               <GlowingEffect
                 spread={40}
                 glow={true}
                 disabled={false}
                 proximity={64}
                 inactiveZone={0.01}
                 borderWidth={2}
               />
               <Card className="relative p-6 bg-gradient-to-br from-background via-background to-secondary/5 border-border/50 hover:border-secondary/40 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 hover:shadow-secondary/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Available Datasets</p>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{availableData?.length || 0}</p>
                      <div className="flex items-center space-x-1">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-green-600">+8%</span>
                        <span className="text-sm text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Market data sources</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 group-hover:scale-110 transition-transform duration-300">
                    <Database className="h-5 w-5 text-secondary" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Recent Backtests */}
                         <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="relative group cursor-pointer"
               onClick={() => navigate('/backtesting')}
             >
               <GlowingEffect
                 spread={40}
                 glow={true}
                 disabled={false}
                 proximity={64}
                 inactiveZone={0.01}
                 borderWidth={2}
               />
               <Card className="relative p-6 bg-gradient-to-br from-background via-background to-blue-500/5 border-border/50 hover:border-blue-500/40 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 hover:shadow-blue-500/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Recent Backtests</p>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">{recentBacktests?.length || 0}</p>
                      <div className="flex items-center space-x-1">
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-medium text-red-600">-2%</span>
                        <span className="text-sm text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Completed this month</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                    <BarChart className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Performance Score */}
                         <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.25 }}
               className="relative group cursor-pointer"
               onClick={() => navigate('/analytics')}
             >
               <GlowingEffect
                 spread={40}
                 glow={true}
                 disabled={false}
                 proximity={64}
                 inactiveZone={0.01}
                 borderWidth={2}
               />
               <Card className="relative p-6 bg-gradient-to-br from-background via-background to-green-500/5 border-border/50 hover:border-green-500/40 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-1 hover:shadow-green-500/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Performance Score</p>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-foreground">
                        {metrics?.totalReturn ? `${metrics.totalReturn.toFixed(1)}%` : 'N/A'}
                      </p>
                      <div className="flex items-center space-x-1">
                        {(metrics?.monthlyReturn || 0) >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={cn(
                          "text-sm font-medium",
                          (metrics?.monthlyReturn || 0) >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {metrics?.monthlyReturn ? `${metrics.monthlyReturn > 0 ? '+' : ''}${metrics.monthlyReturn.toFixed(1)}%` : '0%'}
                        </span>
                        <span className="text-sm text-muted-foreground">vs last month</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Total return rate</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>

          {/* Quick Actions Banner */}
                     <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="relative group"
           >
             <GlowingEffect
               spread={60}
               glow={true}
               disabled={false}
               proximity={80}
               inactiveZone={0.01}
               borderWidth={2}
             />
             <Card className="relative p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-primary/20 hover:border-primary/40 transition-all duration-300 group-hover:shadow-xl">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    🚀 Ready to start trading?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Create new strategies, run backtests, or analyze your performance with our powerful tools.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    onClick={() => navigate('/strategies')}
                    variant="outline"
                    className="hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Strategies
                  </Button>
                  <Button
                    onClick={() => navigate('/backtesting')}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start Backtest
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                         <motion.div
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.4 }}
               className="relative group"
             >
               <GlowingEffect
                 spread={60}
                 glow={true}
                 disabled={false}
                 proximity={80}
                 inactiveZone={0.01}
                 borderWidth={2}
               />
               <Card className="relative p-6 bg-gradient-to-br from-background via-background to-muted/10 border-border/50 hover:border-border transition-all duration-300 group-hover:shadow-xl">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg font-semibold text-foreground">Recent Backtests</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="space-y-3">
                    {recentBacktests && recentBacktests.length > 0 ? (
                      recentBacktests.slice(0, 3).map((backtest, index) => (
                        <motion.div
                          key={backtest.id || index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/20 to-muted/5 border border-border/20 hover:border-border/40 transition-colors cursor-pointer"
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
                      <div className="text-center py-8 text-muted-foreground">
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
                </CardContent>
              </Card>
            </motion.div>

                         <motion.div
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 0.5 }}
               className="relative group"
             >
               <GlowingEffect
                 spread={60}
                 glow={true}
                 disabled={false}
                 proximity={80}
                 inactiveZone={0.01}
                 borderWidth={2}
               />
               <Card className="relative p-6 bg-gradient-to-br from-background via-background to-muted/10 border-border/50 hover:border-border transition-all duration-300 group-hover:shadow-xl">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      onClick={() => navigate('/strategies')}
                    >
                      <Target className="h-6 w-6" />
                      <span className="text-sm font-medium">Strategies</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                      onClick={() => navigate('/backtesting')}
                    >
                      <Play className="h-6 w-6" />
                      <span className="text-sm font-medium">Backtest</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 hover:bg-blue-500 hover:text-white transition-all duration-300"
                      onClick={() => navigate('/data')}
                    >
                      <Database className="h-6 w-6" />
                      <span className="text-sm font-medium">Data</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col space-y-2 hover:bg-green-500 hover:text-white transition-all duration-300"
                      onClick={() => navigate('/analytics')}
                    >
                      <LineChart className="h-6 w-6" />
                      <span className="text-sm font-medium">Analytics</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to the original modern dashboard
  return <ModernTradingDashboard />;
};

export default ModernDashboardDemo; 