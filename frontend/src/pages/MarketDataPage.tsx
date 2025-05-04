import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import { 
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  Leaderboard as LeaderboardIcon,
} from '@mui/icons-material';

import CandlestickChart, { CandlestickData, IndicatorData } from '../components/charts/CandlestickChart';
import { LineStyle } from 'lightweight-charts';

const MarketDataPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [timeframe, setTimeframe] = useState<string>('1D');
  const [marketData, setMarketData] = useState<CandlestickData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Sample technical indicators
  const [smaData, setSmaData] = useState<IndicatorData[]>([]);
  const [emaData, setEmaData] = useState<IndicatorData[]>([]);
  
  // Available symbols (in a real app, this would come from your API)
  const availableSymbols = ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'GOOGL'];
  
  // Available timeframes
  const availableTimeframes = ['5m', '15m', '30m', '1H', '4H', '1D', '1W'];
  
  useEffect(() => {
    // In a real app, this would fetch data from your API based on the selected symbol and timeframe
    setIsLoading(true);
    
    // Simulate API fetch delay
    setTimeout(() => {
      // Generate sample candlestick data
      const sampleData = generateSampleData(selectedSymbol, timeframe, 200);
      setMarketData(sampleData);
      
      // Generate sample SMA indicator
      setSmaData(generateSMA(sampleData, 20));
      
      // Generate sample EMA indicator
      setEmaData(generateEMA(sampleData, 50));
      
      setIsLoading(false);
    }, 500);
    
  }, [selectedSymbol, timeframe]);
  
  // Helper function to generate sample candlestick data
  const generateSampleData = (symbol: string, timeframe: string, count: number): CandlestickData[] => {
    const data: CandlestickData[] = [];
    
    // Use different price ranges for different symbols
    const basePrices: Record<string, number> = {
      'AAPL': 180,
      'MSFT': 320,
      'TSLA': 240,
      'AMZN': 140,
      'GOOGL': 130
    };
    
    const basePrice = basePrices[symbol] || 100;
    const volatility = 0.02; // 2% daily volatility
    
    // Generate timestamp increments based on timeframe
    const getTimeIncrement = () => {
      switch(timeframe) {
        case '5m': return 5 * 60 * 1000;
        case '15m': return 15 * 60 * 1000;
        case '30m': return 30 * 60 * 1000;
        case '1H': return 60 * 60 * 1000;
        case '4H': return 4 * 60 * 60 * 1000;
        case '1D': return 24 * 60 * 60 * 1000;
        case '1W': return 7 * 24 * 60 * 60 * 1000;
        default: return 24 * 60 * 60 * 1000; // Default to daily
      }
    };
    
    const timeIncrement = getTimeIncrement();
    
    // Start from current time and go backwards
    let currentTime = new Date().getTime();
    let price = basePrice;
    
    for (let i = 0; i < count; i++) {
      // Generate realistic price movement
      const change = price * volatility * (Math.random() - 0.5);
      const open = price;
      const close = open + change;
      const high = Math.max(open, close) + Math.abs(change) * Math.random();
      const low = Math.min(open, close) - Math.abs(change) * Math.random();
      
      // Generate volume - higher on price movements
      const volume = Math.floor(basePrice * 10000 * (1 + Math.abs(change / price) * 5));
      
      // For the next iteration
      price = close;
      
      // Add data point
      data.unshift({
        time: currentTime / 1000, // Convert to seconds for lightweight-charts
        open,
        high,
        low,
        close,
        volume
      });
      
      currentTime -= timeIncrement;
    }
    
    return data;
  };
  
  // Generate Simple Moving Average
  const generateSMA = (data: CandlestickData[], period: number): IndicatorData[] => {
    if (data.length < period) return [];
    
    const sma: IndicatorData[] = [];
    
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        // Not enough data points yet
        continue;
      }
      
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      
      sma.push({
        time: data[i].time,
        value: sum / period
      });
    }
    
    return sma;
  };
  
  // Generate Exponential Moving Average
  const generateEMA = (data: CandlestickData[], period: number): IndicatorData[] => {
    if (data.length < period) return [];
    
    const ema: IndicatorData[] = [];
    const multiplier = 2 / (period + 1);
    
    // Calculate first EMA using SMA
    let initialSum = 0;
    for (let i = 0; i < period; i++) {
      initialSum += data[i].close;
    }
    
    let currentEMA = initialSum / period;
    
    ema.push({
      time: data[period - 1].time,
      value: currentEMA
    });
    
    // Calculate subsequent EMAs
    for (let i = period; i < data.length; i++) {
      currentEMA = (data[i].close - currentEMA) * multiplier + currentEMA;
      
      ema.push({
        time: data[i].time,
        value: currentEMA
      });
    }
    
    return ema;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Market Data</Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Chart Controls */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', py: 1 }}>
              <FormControl size="small" sx={{ width: 150 }}>
                <InputLabel>Symbol</InputLabel>
                <Select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value as string)}
                  label="Symbol"
                >
                  {availableSymbols.map((symbol) => (
                    <MenuItem key={symbol} value={symbol}>
                      {symbol}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <ToggleButtonGroup
                value={timeframe}
                exclusive
                onChange={(_, value) => value && setTimeframe(value)}
                size="small"
              >
                {availableTimeframes.map((tf) => (
                  <ToggleButton key={tf} value={tf}>
                    {tf}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
              
              <Box sx={{ flexGrow: 1 }} />
              
              <Tooltip title="View in TradingView (coming soon)">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ShowChartIcon />}
                >
                  TradingView
                </Button>
              </Tooltip>
              
              <Tooltip title="Download Data (coming soon)">
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<LeaderboardIcon />}
                >
                  Download
                </Button>
              </Tooltip>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Main Chart Area */}
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title={`${selectedSymbol} (${timeframe})`} 
              subheader={isLoading ? "Loading..." : "Last updated: " + new Date().toLocaleString()}
              action={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<TimelineIcon />}
                >
                  More Indicators
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ height: 600, p: 1 }}>
              {!isLoading && marketData.length > 0 && (
                <CandlestickChart 
                  data={marketData} 
                  title={`${selectedSymbol} (${timeframe})`}
                  height={550}
                  showVolume={true}
                  indicators={[
                    {
                      type: 'sma',
                      name: 'SMA 20',
                      data: smaData,
                      visible: true,
                      color: '#2962FF',
                      width: 1.5,
                      style: LineStyle.Solid,
                      periods: 20
                    },
                    {
                      type: 'ema',
                      name: 'EMA 50',
                      data: emaData,
                      visible: true,
                      color: '#FF6D00',
                      width: 1.5,
                      style: LineStyle.Dashed,
                      periods: 50
                    }
                  ]}
                />
              )}
              
              {isLoading && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100%',
                  }}
                >
                  <Typography variant="h6">Loading market data...</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MarketDataPage;