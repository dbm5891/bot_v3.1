'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { motion, animate, useMotionValue, Transition } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Activity, 
  Users, 
  Target, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Pause,
  Settings,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
    ease: 'linear',
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

// GlowingEffect Component
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
                  : `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
                radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
                radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%), 
                radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
                repeating-conic-gradient(
                  from 236.84deg at 50% 50%,
                  #dd7bbb 0%,
                  #d79f1e calc(25% / var(--repeating-conic-gradient-times)),
                  #5a922c calc(50% / var(--repeating-conic-gradient-times)), 
                  #4c7894 calc(75% / var(--repeating-conic-gradient-times)),
                  #dd7bbb calc(100% / var(--repeating-conic-gradient-times))
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

// Main Dashboard Component
interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative';
  icon: React.ReactNode;
  description?: string;
}

function MetricCard({ title, value, change, changeType, icon, description }: MetricCardProps) {
  return (
    <div className="relative group">
      <GlowingEffect
        spread={40}
        glow={true}
        disabled={false}
        proximity={64}
        inactiveZone={0.01}
        borderWidth={2}
      />
      <Card className="relative p-6 bg-gradient-to-br from-background via-background to-muted/20 border-border/50 hover:border-border transition-all duration-300 group-hover:shadow-lg">
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
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            {icon}
          </div>
        </div>
      </Card>
    </div>
  );
}

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
      <Card className="relative p-6 bg-gradient-to-br from-background via-background to-muted/10 border-border/50 hover:border-border transition-all duration-300 group-hover:shadow-xl">
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

function TradingChart() {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'Pause' : 'Start'} Backtest</span>
          </Button>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Strategy: RSI + MACD</span>
            <span>•</span>
            <span>Timeframe: 1H</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative h-64 bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg border border-border/30 overflow-hidden">
        <GlowEffect
          colors={['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b']}
          mode="flowHorizontal"
          blur="soft"
          className="opacity-20"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Interactive Trading Chart</p>
            <p className="text-xs text-muted-foreground">Real-time data visualization</p>
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
  );
}

function PerformanceMetrics() {
  const metrics = [
    { label: 'Win Rate', value: '68.5%', color: 'text-green-600' },
    { label: 'Profit Factor', value: '2.34', color: 'text-blue-600' },
    { label: 'Max Drawdown', value: '12.3%', color: 'text-red-600' },
    { label: 'Sharpe Ratio', value: '1.87', color: 'text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 border border-border/30"
        >
          <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
          <p className={cn("text-lg font-bold", metric.color)}>{metric.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

function RecentTrades() {
  const trades = [
    { symbol: 'BTCUSDT', type: 'Long', pnl: '+$1,234', time: '2m ago', status: 'closed' },
    { symbol: 'ETHUSDT', type: 'Short', pnl: '-$456', time: '5m ago', status: 'closed' },
    { symbol: 'ADAUSDT', type: 'Long', pnl: '+$789', time: '12m ago', status: 'open' },
    { symbol: 'SOLUSDT', type: 'Long', pnl: '+$321', time: '18m ago', status: 'closed' },
  ];

  return (
    <div className="space-y-3">
      {trades.map((trade, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/20 to-muted/5 border border-border/20 hover:border-border/40 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className={cn(
              "w-2 h-2 rounded-full",
              trade.status === 'open' ? "bg-blue-500" : "bg-gray-400"
            )} />
            <div>
              <p className="text-sm font-medium text-foreground">{trade.symbol}</p>
              <p className="text-xs text-muted-foreground">{trade.type} • {trade.time}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              "text-sm font-medium",
              trade.pnl.startsWith('+') ? "text-green-600" : "text-red-600"
            )}>
              {trade.pnl}
            </p>
            <p className="text-xs text-muted-foreground capitalize">{trade.status}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function TradingDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1D');
  
  const timeframes = ['1H', '4H', '1D', '1W', '1M'];
  
  const metrics = [
    {
      title: 'Total Portfolio Value',
      value: '$124,567.89',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      description: 'Across all trading pairs'
    },
    {
      title: 'Active Strategies',
      value: '8',
      change: '+2',
      changeType: 'positive' as const,
      icon: <Target className="h-5 w-5 text-primary" />,
      description: 'Currently running'
    },
    {
      title: 'Monthly P&L',
      value: '$8,432.10',
      change: '+18.7%',
      changeType: 'positive' as const,
      icon: <TrendingUp className="h-5 w-5 text-primary" />,
      description: 'This month performance'
    },
    {
      title: 'Win Rate',
      value: '68.5%',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: <Activity className="h-5 w-5 text-primary" />,
      description: 'Last 30 days'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
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
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Trading Dashboard</h1>
            <p className="text-muted-foreground">Monitor your algorithmic trading performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-muted/50 rounded-lg p-1 border border-border/50">
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
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {metrics.map((metric, index) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Chart */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <ChartCard 
              title="Strategy Performance" 
              actions={
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              }
            >
              <TradingChart />
            </ChartCard>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <ChartCard title="Key Metrics">
              <PerformanceMetrics />
            </ChartCard>
            
            <ChartCard title="Recent Trades">
              <RecentTrades />
            </ChartCard>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ChartCard title="Risk Analysis">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20">
                    <p className="text-sm text-red-600 font-medium">Risk Level</p>
                    <p className="text-2xl font-bold text-red-600">Medium</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
                    <p className="text-sm text-blue-600 font-medium">Exposure</p>
                    <p className="text-2xl font-bold text-blue-600">67%</p>
                  </div>
                </div>
                <div className="h-32 bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg border border-border/30 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Risk Distribution Chart</p>
                </div>
              </div>
            </ChartCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ChartCard title="Market Overview">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {['BTC', 'ETH', 'SOL'].map((symbol, index) => (
                    <div key={symbol} className="p-3 rounded-lg bg-gradient-to-br from-muted/20 to-muted/5 border border-border/20">
                      <p className="text-xs text-muted-foreground">{symbol}/USDT</p>
                      <p className="text-sm font-bold text-foreground">
                        ${(Math.random() * 100000 + 10000).toFixed(2)}
                      </p>
                      <p className={cn(
                        "text-xs",
                        Math.random() > 0.5 ? "text-green-600" : "text-red-600"
                      )}>
                        {Math.random() > 0.5 ? '+' : '-'}{(Math.random() * 10).toFixed(2)}%
                      </p>
                    </div>
                  ))}
                </div>
                <div className="h-24 bg-gradient-to-br from-muted/20 to-muted/5 rounded-lg border border-border/30 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Market Sentiment Indicator</p>
                </div>
              </div>
            </ChartCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 