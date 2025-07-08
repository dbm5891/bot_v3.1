import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnClickOutside } from "usehooks-ts";
import { cn } from "../lib/utils";
// Only import icons that are actually used
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
  LineChart,
  TrendingUp as TrendingUpIcon,
  BarChart2,
  TrendingDown,
  Target,
  Database,
  PieChart,
  Microscope,
  LucideIcon
} from "lucide-react";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import { Separator } from "../components/ui/separator";
import { Checkbox } from "../components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface Tab {
  title: string;
  icon: LucideIcon;
  type?: never;
}

interface TabSeparator {
  type: "separator";
  title?: never;
  icon?: never;
}

type TabItem = Tab | TabSeparator;

interface ExpandableTabsProps {
  tabs: TabItem[];
  className?: string;
  activeColor?: string;
  onChange?: (index: number | null) => void;
}

const buttonVariants = {
  initial: {
    gap: 0,
    paddingLeft: ".5rem",
    paddingRight: ".5rem",
  },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? ".5rem" : 0,
    paddingLeft: isSelected ? "1rem" : ".5rem",
    paddingRight: isSelected ? "1rem" : ".5rem",
  }),
};

const spanVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const transition = { delay: 0.1, type: "spring" as const, bounce: 0, duration: 0.6 };

function ExpandableTabs({
  tabs,
  className,
  activeColor = "text-primary",
  onChange,
}: ExpandableTabsProps) {
  const [selected, setSelected] = React.useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const outsideClickRef = React.useRef(null);

  useOnClickOutside(outsideClickRef, () => {
    setSelected(null);
    onChange?.(null);
  });

  const handleSelect = (index: number) => {
    setSelected(index);
    onChange?.(index);
  };

  const TabSeparator = () => (
    <div className="mx-1 h-[24px] w-[1.2px] bg-border" aria-hidden="true" />
  );

  return (
    <div
      ref={outsideClickRef}
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-2xl border bg-background p-1 shadow-dashboard hover:shadow-card-hover transition-shadow duration-200",
        className
      )}
    >
      {tabs.map((tab, index) => {
        if (tab.type === "separator") {
          return <TabSeparator key={`separator-${index}`} />;
        }

        const Icon = tab.icon;
        const isHovered = hoveredIndex === index;
        const isSelected = selected === index;
        
        return (
          <motion.button
            key={tab.title}
            variants={buttonVariants}
            initial={false}
            animate="animate"
            custom={selected === index}
            onClick={() => handleSelect(index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            transition={transition}
            className={cn(
              "relative flex items-center rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300",
              selected === index
                ? cn("bg-muted", activeColor)
                : "hover:bg-muted hover:text-foreground"
            )}
            style={selected === index ? {} : { color: "#737373" }}
          >
            <Icon 
              size={20} 
              style={
                isSelected 
                  ? {} 
                  : { 
                      color: isHovered ? "#2563eb" : "#737373",
                      transition: "color 0.3s ease"
                    }
              }
            />
            <AnimatePresence initial={false}>
              {selected === index && (
                <motion.span
                  variants={spanVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={transition}
                  className="overflow-hidden"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

interface BacktestResult {
  id: string;
  strategy: string;
  symbol: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  status: 'running' | 'completed' | 'failed';
  progress?: number;
}

interface StrategyParameter {
  name: string;
  type: 'number' | 'boolean' | 'select' | 'range';
  value: any;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  description?: string;
}

interface TradingStrategy {
  id: string;
  name: string;
  description: string;
  category: string;
  parameters: StrategyParameter[];
  enabled: boolean;
}

const mockBacktestResults: BacktestResult[] = [
  {
    id: '1',
    strategy: 'RSI Mean Reversion',
    symbol: 'BTCUSD',
    timeframe: '1h',
    startDate: '2023-01-01',
    endDate: '2024-01-01',
    totalReturn: 24.5,
    sharpeRatio: 1.42,
    maxDrawdown: -8.3,
    winRate: 67.2,
    totalTrades: 156,
    profitFactor: 1.85,
    avgWin: 2.1,
    avgLoss: -1.3,
    status: 'completed'
  },
  {
    id: '2',
    strategy: 'Moving Average Crossover',
    symbol: 'ETHUSD',
    timeframe: '4h',
    startDate: '2023-06-01',
    endDate: '2024-01-01',
    totalReturn: 18.7,
    sharpeRatio: 1.28,
    maxDrawdown: -12.1,
    winRate: 58.9,
    totalTrades: 89,
    profitFactor: 1.67,
    avgWin: 3.2,
    avgLoss: -2.1,
    status: 'completed'
  },
  {
    id: '3',
    strategy: 'Bollinger Band Squeeze',
    symbol: 'SOLUSD',
    timeframe: '15m',
    startDate: '2023-12-01',
    endDate: '2024-01-01',
    totalReturn: 0,
    sharpeRatio: 0,
    maxDrawdown: 0,
    winRate: 0,
    totalTrades: 0,
    profitFactor: 0,
    avgWin: 0,
    avgLoss: 0,
    status: 'running',
    progress: 67
  }
];

const mockStrategies: TradingStrategy[] = [
  {
    id: '1',
    name: 'RSI Mean Reversion',
    description: 'Buy when RSI is oversold, sell when overbought',
    category: 'Momentum',
    enabled: true,
    parameters: [
      { name: 'RSI Period', type: 'number', value: 14, min: 5, max: 50, step: 1, description: 'Period for RSI calculation' },
      { name: 'Oversold Level', type: 'number', value: 30, min: 10, max: 40, step: 1, description: 'RSI level considered oversold' },
      { name: 'Overbought Level', type: 'number', value: 70, min: 60, max: 90, step: 1, description: 'RSI level considered overbought' },
      { name: 'Stop Loss %', type: 'number', value: 2.5, min: 0.5, max: 10, step: 0.1, description: 'Stop loss percentage' },
      { name: 'Take Profit %', type: 'number', value: 5.0, min: 1, max: 20, step: 0.1, description: 'Take profit percentage' }
    ]
  },
  {
    id: '2',
    name: 'Moving Average Crossover',
    description: 'Buy when fast MA crosses above slow MA',
    category: 'Trend Following',
    enabled: true,
    parameters: [
      { name: 'Fast MA Period', type: 'number', value: 10, min: 5, max: 50, step: 1, description: 'Fast moving average period' },
      { name: 'Slow MA Period', type: 'number', value: 30, min: 20, max: 200, step: 1, description: 'Slow moving average period' },
      { name: 'MA Type', type: 'select', value: 'SMA', options: ['SMA', 'EMA', 'WMA'], description: 'Type of moving average' },
      { name: 'Min Volume Filter', type: 'boolean', value: true, description: 'Filter trades by minimum volume' },
      { name: 'Position Size %', type: 'number', value: 10, min: 1, max: 100, step: 1, description: 'Position size as % of portfolio' }
    ]
  }
];

const SparklineChart = ({ data, color, width = 100, height = 30 }: { data: number[], color: string, width?: number, height?: number }) => {
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const range = maxVal - minVal;
  
  const points = data.map((value, index) => {
    const x = (data.length > 1 ? (index / (data.length - 1)) : 0.5) * width;
    const y = height - (range !== 0 ? ((value - minVal) / range) * height : height / 2);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon 
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
    </svg>
  );
};

const formSchema = z.object({
  strategy: z.string().min(1, "Strategy is required"),
  symbol: z.string().min(1, "Symbol is required"),
  timeframe: z.string().min(1, "Timeframe is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  initialCapital: z.number().min(1000, "Minimum capital is $1,000"),
  commission: z.number().min(0).max(1),
  slippage: z.number().min(0).max(1),
});

type FormValues = z.infer<typeof formSchema>;

// Text styling utility based on CSV specifications
const getTextStyle = (text: string): React.CSSProperties => {
  const textStyles: Record<string, React.CSSProperties> = {
    "Backtesting Dashboard": {
      fontFamily: "system-ui",
      fontWeight: "700",
      fontSize: "30px",
      lineHeight: "36px",
      letterSpacing: "-0.75px",
      color: "#0a0a0a"
    },
    "Advanced strategy testing and optimization": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "16px",
      lineHeight: "24px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Export": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Quick Stats": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Active Strategies": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "12": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#171717"
    },
    "Running Tests": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "3": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Completed Today": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "8": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#fafafa"
    },
    "Best Strategy": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "+24.5%": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#00c951"
    },
    "Strategy Setup": {
      fontFamily: "system-ui",
      fontWeight: "600",
      fontSize: "18px",
      lineHeight: "28px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Strategy": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "14px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "RSI Mean Reversion": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Symbol": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "14px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "BTCUSD": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Timeframe": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "14px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "1h": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Start Date": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "14px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "End Date": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "14px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Start Backtest": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#fafafa"
    },
    "Strategy Parameters": {
      fontFamily: "system-ui",
      fontWeight: "600",
      fontSize: "18px",
      lineHeight: "28px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "RSI Period": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Period for RSI calculation": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Oversold Level": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "RSI level considered oversold": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Overbought Level": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "RSI level considered overbought": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Stop Loss %": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Stop loss percentage": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Take Profit %": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Take profit percentage": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Total Return": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "+24.5% (performance)": {
      fontFamily: "system-ui",
      fontWeight: "700",
      fontSize: "24px",
      lineHeight: "32px",
      letterSpacing: "0px",
      color: "#00c951"
    },
    "Sharpe Ratio": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "1.42": {
      fontFamily: "system-ui",
      fontWeight: "700",
      fontSize: "24px",
      lineHeight: "32px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Excellent": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Max Drawdown": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "-8.3%": {
      fontFamily: "system-ui",
      fontWeight: "700",
      fontSize: "24px",
      lineHeight: "32px",
      letterSpacing: "0px",
      color: "#fb2c36"
    },
    "Low Risk": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Win Rate": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "67.2%": {
      fontFamily: "system-ui",
      fontWeight: "700",
      fontSize: "24px",
      lineHeight: "32px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "156 trades": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Overview": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Results": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Trades": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Analytics": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Equity Curve": {
      fontFamily: "system-ui",
      fontWeight: "600",
      fontSize: "18px",
      lineHeight: "28px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Interactive equity curve chart would go here": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "16px",
      lineHeight: "24px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "Risk Metrics": {
      fontFamily: "system-ui",
      fontWeight: "600",
      fontSize: "16px",
      lineHeight: "24px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Value at Risk (95%)": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "-2.1%": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Calmar Ratio": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "2.95": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Sortino Ratio": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "1.87": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Beta": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "0.73": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Trade Statistics": {
      fontFamily: "system-ui",
      fontWeight: "600",
      fontSize: "16px",
      lineHeight: "24px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Profit Factor": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "1.85": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#0a0a0a"
    },
    "Average Win": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "+2.1%": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#96a97f"
    },
    "Average Loss": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "-1.3%": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#ac825f"
    },
    "Largest Win": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#737373"
    },
    "+8.7%": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#00c951"
    },
    "Period for RSI calculation (gray)": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#a1a1a1"
    },
    "RSI level considered oversold (gray)": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#a1a1a1"
    },
    "RSI level considered overbought (gray)": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#a1a1a1"
    },
    "Stop loss percentage (gray)": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#a1a1a1"
    },
    "Take profit percentage (gray)": {
      fontFamily: "system-ui",
      fontWeight: "400",
      fontSize: "12px",
      lineHeight: "16px",
      letterSpacing: "0px",
      color: "#a1a1a1"
    },
    "+2.1% (green)": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#00c951"
    },
    "-1.3% (red)": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#fb2c36"
    },
    "+8.7% (green)": {
      fontFamily: "system-ui",
      fontWeight: "500",
      fontSize: "14px",
      lineHeight: "20px",
      letterSpacing: "0px",
      color: "#00c951"
    }
  };
  
  return textStyles[text] || {};
};

export function BacktestingDashboard() {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>("1");
  const [strategyParameters, setStrategyParameters] = useState<Record<string, StrategyParameter[]>>({});
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>(mockBacktestResults);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedResult, setSelectedResult] = useState<BacktestResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      strategy: "RSI Mean Reversion",
      symbol: "BTCUSD",
      timeframe: "1h",
      startDate: "2023-01-01",
      endDate: "2024-01-01",
      initialCapital: 10000,
      commission: 0.001,
      slippage: 0.0005,
    },
  });

  // Initialize strategy parameters state
  useEffect(() => {
    const initialParams: Record<string, StrategyParameter[]> = {};
    mockStrategies.forEach(strategy => {
      initialParams[strategy.id] = [...strategy.parameters];
    });
    setStrategyParameters(initialParams);
  }, []);

  // Handle strategy selection
  const handleStrategyChange = (strategyName: string) => {
    const strategy = mockStrategies.find(s => s.name === strategyName);
    if (strategy) {
      setSelectedStrategyId(strategy.id);
    }
  };

  // Update parameter value
  const updateParameterValue = (strategyId: string, paramIndex: number, newValue: any) => {
    setStrategyParameters(prev => ({
      ...prev,
      [strategyId]: prev[strategyId]?.map((param, index) => 
        index === paramIndex ? { ...param, value: newValue } : param
      ) || []
    }));
  };

  // Get current strategy parameters
  const getCurrentStrategyParams = () => {
    if (!selectedStrategyId || !strategyParameters[selectedStrategyId]) {
      return [];
    }
    return strategyParameters[selectedStrategyId];
  };

  const selectedStrategy = selectedStrategyId 
    ? mockStrategies.find(s => s.id === selectedStrategyId)
    : null;

  const onSubmit = async (data: FormValues) => {
    setIsRunning(true);
    
    const newBacktest: BacktestResult = {
      id: Date.now().toString(),
      strategy: data.strategy,
      symbol: data.symbol,
      timeframe: data.timeframe,
      startDate: data.startDate,
      endDate: data.endDate,
      totalReturn: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      winRate: 0,
      totalTrades: 0,
      profitFactor: 0,
      avgWin: 0,
      avgLoss: 0,
      status: 'running',
      progress: 0
    };

    setBacktestResults(prev => [newBacktest, ...prev]);

    // Simulate backtest progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Update with final results
        setBacktestResults(prev => prev.map(result => 
          result.id === newBacktest.id 
            ? {
                ...result,
                status: 'completed' as const,
                progress: 100,
                totalReturn: Math.random() * 40 - 10,
                sharpeRatio: Math.random() * 2,
                maxDrawdown: -(Math.random() * 20),
                winRate: 40 + Math.random() * 40,
                totalTrades: Math.floor(50 + Math.random() * 200),
                profitFactor: 0.8 + Math.random() * 1.5,
                avgWin: Math.random() * 5,
                avgLoss: -(Math.random() * 3)
              }
            : result
        ));
        setIsRunning(false);
      } else {
        setBacktestResults(prev => prev.map(result => 
          result.id === newBacktest.id 
            ? { ...result, progress }
            : result
        ));
      }
    }, 500);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'running': return 'text-blue-500';
      case 'failed': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <Activity className="h-4 w-4 animate-pulse" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const quickActionTabs = [
    { title: "New Backtest", icon: Play },
    { title: "Strategies", icon: Settings },
    { type: "separator" as const },
    { title: "Results", icon: BarChart3 },
    { title: "Analytics", icon: LineChart },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Microscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 style={getTextStyle("Backtesting Dashboard")}>Backtesting Dashboard</h1>
            <p style={getTextStyle("Advanced strategy testing and optimization")}>Advanced strategy testing and optimization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ExpandableTabs tabs={quickActionTabs} />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" style={{ color: "#0a0a0a" }} />
            <span style={getTextStyle("Export")}>Export</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Strategy Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Stats */}
          <Card className="p-4">
            <h3 style={getTextStyle("Quick Stats")} className="mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span style={getTextStyle("Active Strategies")}>Active Strategies</span>
                <Badge variant="secondary" style={{...getTextStyle("12"), borderRadius: "8px", paddingLeft: "8px", paddingRight: "8px", backgroundColor: "#f0f6ff", color: "#2563eb"}}>12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span style={getTextStyle("Running Tests")}>Running Tests</span>
                <Badge variant="outline" style={{...getTextStyle("3"), borderRadius: "8px", paddingLeft: "8px", paddingRight: "8px", borderColor: "#d3e0fb", color: "#2563eb"}}>3</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span style={getTextStyle("Completed Today")}>Completed Today</span>
                <Badge variant="default" style={{...getTextStyle("8"), borderRadius: "8px", paddingLeft: "8px", paddingRight: "8px"}}>8</Badge>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span style={getTextStyle("Best Strategy")}>Best Strategy</span>
                <span style={getTextStyle("+24.5%")}>+24.5%</span>
              </div>
            </div>
          </Card>

          {/* Strategy Configuration */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 style={getTextStyle("Strategy Setup")}>Strategy Setup</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(!showAdvanced)}>
                <Settings className="h-4 w-4" style={{ color: "#0d0d0d" }} />
              </Button>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="strategy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel style={getTextStyle("Strategy")}>Strategy</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleStrategyChange(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger name="strategy">
                            <SelectValue placeholder="Select strategy" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockStrategies.map((strategy) => (
                            <SelectItem key={strategy.id} value={strategy.name}>
                              {strategy.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-2">
                                      <FormField
                    control={form.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={getTextStyle("Symbol")}>Symbol</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger name="symbol">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="BTCUSD">BTCUSD</SelectItem>
                            <SelectItem value="ETHUSD">ETHUSD</SelectItem>
                            <SelectItem value="SOLUSD">SOLUSD</SelectItem>
                            <SelectItem value="ADAUSD">ADAUSD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={getTextStyle("Timeframe")}>Timeframe</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger name="timeframe">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1m">1m</SelectItem>
                            <SelectItem value="5m">5m</SelectItem>
                            <SelectItem value="15m">15m</SelectItem>
                            <SelectItem value="1h">1h</SelectItem>
                            <SelectItem value="4h">4h</SelectItem>
                            <SelectItem value="1d">1d</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={getTextStyle("Start Date")}>Start Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel style={getTextStyle("End Date")}>End Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {showAdvanced && (
                  <div className="space-y-4 pt-4 border-t">
                    <FormField
                      control={form.control}
                      name="initialCapital"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Capital</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="commission"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Commission %</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.001"
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="slippage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Slippage %</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                step="0.0001"
                                {...field} 
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" style={{ color: "#fafafa" }} />
                      <span style={getTextStyle("Start Backtest")}>Start Backtest</span>
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </Card>

          {/* Strategy Parameters */}
          {selectedStrategy && (
            <Card className="p-4">
              <h3 style={getTextStyle("Strategy Parameters")} className="mb-4">Strategy Parameters</h3>
              <div className="space-y-4">
                {getCurrentStrategyParams().map((param, index) => (
                  <div key={index} className="space-y-2">
                    <Label 
                      htmlFor={`param-${param.name.replace(/\s+/g, '-').toLowerCase()}-${index}`}
                      className="text-sm font-medium"
                    >
                      {param.name}
                    </Label>
                    {param.type === 'number' && (
                      <div className="space-y-2">
                        <Input
                          type="number"
                          id={`param-${param.name.replace(/\s+/g, '-').toLowerCase()}-${index}`}
                          name={`param_${param.name.replace(/\s+/g, '_').toLowerCase()}`}
                          value={param.value}
                          onChange={(e) => updateParameterValue(selectedStrategy.id, index, Number(e.target.value))}
                          min={param.min}
                          max={param.max}
                          step={param.step}
                          className="h-8"
                          aria-label={param.name}
                        />
                        {param.min !== undefined && param.max !== undefined && (
                          <div className="relative">
                            <div className="w-full rounded-full h-2" style={{ backgroundColor: "#d3e0fb" }}>
                              <div 
                                className="h-2 rounded-full relative"
                                style={{ 
                                  backgroundColor: "#2563eb",
                                  width: `${((param.value - param.min) / (param.max - param.min)) * 100}%` 
                                }}
                              >
                                <div 
                                  className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 bg-white rounded-full"
                                  style={{ 
                                    border: "1px solid #4e81ef",
                                    width: "17px",
                                    height: "17px"
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {param.type === 'boolean' && (
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id={`param-${param.name.replace(/\s+/g, '-').toLowerCase()}-${index}`}
                          name={`param_${param.name.replace(/\s+/g, '_').toLowerCase()}`}
                          checked={param.value} 
                          onCheckedChange={(checked) => updateParameterValue(selectedStrategy.id, index, checked)}
                          aria-label={param.name}
                        />
                        <span className="text-sm text-muted-foreground">
                          {param.value ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    )}
                    {param.type === 'select' && (
                      <Select 
                        value={param.value}
                        onValueChange={(value) => updateParameterValue(selectedStrategy.id, index, value)}
                      >
                        <SelectTrigger 
                          className="h-8"
                          id={`param-${param.name.replace(/\s+/g, '-').toLowerCase()}-${index}`}
                          name={`param_${param.name.replace(/\s+/g, '_').toLowerCase()}`}
                          aria-label={param.name}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {param.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {param.description && (
                      <p style={getTextStyle(`${param.description} (gray)`)} className="text-xs">{param.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Main Panel - Results and Analytics */}
        <div className="lg:col-span-3 space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p style={getTextStyle("Total Return")}>Total Return</p>
                  <p style={getTextStyle("+24.5% (performance)")}>+24.5%</p>
                </div>
                <TrendingUpIcon className="h-8 w-8" style={{ color: "#00c951" }} />
              </div>
              <div className="mt-2">
                <SparklineChart 
                  data={[100, 105, 103, 108, 112, 109, 115, 118, 124]} 
                  color="#10B981" 
                  width={120} 
                  height={40} 
                />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p style={getTextStyle("Sharpe Ratio")}>Sharpe Ratio</p>
                  <p style={getTextStyle("1.42")}>1.42</p>
                </div>
                <BarChart2 className="h-8 w-8" style={{ color: "#2b7fff" }} />
              </div>
              <div className="mt-2">
                <Progress value={71} className="h-2" />
                <p style={getTextStyle("Excellent")} className="mt-1">Excellent</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p style={getTextStyle("Max Drawdown")}>Max Drawdown</p>
                  <p style={getTextStyle("-8.3%")}>-8.3%</p>
                </div>
                <TrendingDown className="h-8 w-8" style={{ color: "#fb2c36" }} />
              </div>
              <div className="mt-2">
                <Progress value={17} className="h-2" />
                <p style={getTextStyle("Low Risk")} className="mt-1">Low Risk</p>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p style={getTextStyle("Win Rate")}>Win Rate</p>
                  <p style={getTextStyle("67.2%")}>67.2%</p>
                </div>
                <Target className="h-8 w-8" style={{ color: "#ad46ff" }} />
              </div>
              <div className="mt-2">
                <Progress value={67} className="h-2" />
                <p style={getTextStyle("156 trades")} className="mt-1">156 trades</p>
              </div>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" style={getTextStyle("Overview")}>Overview</TabsTrigger>
              <TabsTrigger value="results" style={getTextStyle("Results")}>Results</TabsTrigger>
              <TabsTrigger value="trades" style={getTextStyle("Trades")}>Trades</TabsTrigger>
              <TabsTrigger value="analytics" style={getTextStyle("Analytics")}>Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card className="p-6">
                <h3 style={getTextStyle("Equity Curve")} className="mb-4">Equity Curve</h3>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 mx-auto mb-2" style={{ color: "#737373" }} />
                    <p style={getTextStyle("Interactive equity curve chart would go here")}>Interactive equity curve chart would go here</p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 style={getTextStyle("Risk Metrics")} className="mb-3">Risk Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={getTextStyle("Value at Risk (95%)")}>Value at Risk (95%)</span>
                      <span style={getTextStyle("-2.1%")}>-2.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={getTextStyle("Calmar Ratio")}>Calmar Ratio</span>
                      <span style={getTextStyle("2.95")}>2.95</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={getTextStyle("Sortino Ratio")}>Sortino Ratio</span>
                      <span style={getTextStyle("1.87")}>1.87</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={getTextStyle("Beta")}>Beta</span>
                      <span style={getTextStyle("0.73")}>0.73</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 style={getTextStyle("Trade Statistics")} className="mb-3">Trade Statistics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span style={getTextStyle("Profit Factor")}>Profit Factor</span>
                      <span style={getTextStyle("1.85")}>1.85</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={getTextStyle("Average Win")}>Average Win</span>
                      <span style={getTextStyle("+2.1% (green)")}>+2.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={getTextStyle("Average Loss")}>Average Loss</span>
                      <span style={getTextStyle("-1.3% (red)")}>-1.3%</span>
                    </div>
                    <div className="flex justify-between">
                      <span style={getTextStyle("Largest Win")}>Largest Win</span>
                      <span style={getTextStyle("+8.7% (green)")}>+8.7%</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="results" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Backtest Results</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Strategy</TableHead>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Return</TableHead>
                      <TableHead>Sharpe</TableHead>
                      <TableHead>Drawdown</TableHead>
                      <TableHead>Win Rate</TableHead>
                      <TableHead>Trades</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backtestResults.map((result) => (
                      <TableRow key={result.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{result.strategy}</TableCell>
                        <TableCell>{result.symbol}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.startDate} - {result.endDate}
                        </TableCell>
                        <TableCell>
                          {result.status === 'completed' ? (
                            <span className={result.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'}>
                              {formatPercent(result.totalReturn)}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {result.status === 'completed' ? result.sharpeRatio.toFixed(2) : '-'}
                        </TableCell>
                        <TableCell>
                          {result.status === 'completed' ? (
                            <span className="text-red-500">{formatPercent(result.maxDrawdown)}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {result.status === 'completed' ? `${result.winRate.toFixed(1)}%` : '-'}
                        </TableCell>
                        <TableCell>
                          {result.status === 'completed' ? result.totalTrades : '-'}
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 ${getStatusColor(result.status)}`}>
                            {getStatusIcon(result.status)}
                            <span className="text-sm capitalize">{result.status}</span>
                            {result.status === 'running' && result.progress && (
                              <span className="text-xs">({result.progress.toFixed(0)}%)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="trades" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Trade History</h3>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Detailed trade history table would go here</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Monthly Returns</h4>
                  <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Monthly returns heatmap</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Drawdown Analysis</h4>
                  <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingDown className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Drawdown periods chart</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Performance Attribution</h4>
                <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Performance attribution analysis</p>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

export default BacktestingDashboard;