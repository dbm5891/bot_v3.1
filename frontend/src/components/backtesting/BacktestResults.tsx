import * as React from "react"
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, Target } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Types
interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  date: string
  pnl: number
}

interface BacktestSummary {
  totalReturn: number
  totalTrades: number
  winRate: number
  sharpeRatio: number
  maxDrawdown: number
  startingCapital: number
  endingCapital: number
}

interface EquityPoint {
  date: string
  value: number
}

interface BacktestResultsProps {
  summary?: BacktestSummary
  trades?: Trade[]
  equityCurve?: EquityPoint[]
  statistics?: Record<string, number | string>
}

const BacktestResults = React.memo(function BacktestResults({
  summary = {
    totalReturn: 15.67,
    totalTrades: 142,
    winRate: 68.5,
    sharpeRatio: 1.42,
    maxDrawdown: -8.3,
    startingCapital: 100000,
    endingCapital: 115670,
  },
  trades = [
    {
      id: '1',
      symbol: 'AAPL',
      side: 'buy',
      quantity: 100,
      price: 150.25,
      date: '2024-01-15',
      pnl: 1250.50,
    },
    {
      id: '2',
      symbol: 'GOOGL',
      side: 'sell',
      quantity: 50,
      price: 2750.80,
      date: '2024-01-16',
      pnl: -320.75,
    },
    {
      id: '3',
      symbol: 'MSFT',
      side: 'buy',
      quantity: 75,
      price: 380.45,
      date: '2024-01-17',
      pnl: 890.25,
    },
  ],
  equityCurve = [
    { date: '2024-01-01', value: 100000 },
    { date: '2024-01-15', value: 105250 },
    { date: '2024-01-30', value: 108900 },
    { date: '2024-02-15', value: 112500 },
    { date: '2024-02-28', value: 115670 },
  ],
  statistics = {
    'Average Trade': '$245.67',
    'Best Trade': '$1,250.50',
    'Worst Trade': '-$520.30',
    'Profit Factor': '1.85',
    'Recovery Factor': '1.92',
    'Calmar Ratio': '1.89',
  },
}: BacktestResultsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="w-full space-y-6 p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Return</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(summary.totalReturn)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary.endingCapital - summary.startingCapital)} profit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTrades}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(summary.totalTrades * (summary.winRate / 100))} winning trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.winRate}%</div>
            <Badge variant="default" className="mt-1">
              High Performance
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sharpe Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.sharpeRatio}</div>
            <p className="text-xs text-muted-foreground">Risk-adjusted return</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatPercentage(summary.maxDrawdown)}
            </div>
            <p className="text-xs text-muted-foreground">Maximum loss from peak</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.endingCapital)}</div>
            <p className="text-xs text-muted-foreground">
              Started with {formatCurrency(summary.startingCapital)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Interface */}
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="equity" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="equity">Equity Curve</TabsTrigger>
              <TabsTrigger value="trades">Trades</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
            </TabsList>

            <TabsContent value="equity" className="space-y-4">
              <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/50">
                <div className="text-center space-y-2">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Equity curve visualization would be rendered here
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {equityCurve.length} data points from {equityCurve[0]?.date} to{' '}
                    {equityCurve[equityCurve.length - 1]?.date}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trades" className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={trade.side === 'buy' ? 'default' : 'secondary'}>
                          {trade.side.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>{formatCurrency(trade.price)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {trade.date}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            "font-medium",
                            trade.pnl > 0 ? "text-green-600" : "text-red-600"
                          )}
                        >
                          {formatCurrency(trade.pnl)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(statistics).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center p-4 border rounded-lg bg-card"
                  >
                    <span className="font-medium">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
})

export default BacktestResults