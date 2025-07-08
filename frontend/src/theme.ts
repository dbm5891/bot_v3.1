// Enhanced TradingView-inspired color palette with modern UI updates
const colors = {
  // Main colors - slightly improved for better contrast and accessibility
  primary: '#2962ff', // Blue - primary actions, focused elements
  secondary: '#26a69a', // Green - success, positive values
  error: '#ff4d4f', // Brightened red for better visibility
  warning: '#faad14', // Optimized warning orange for alerts
  info: '#1890ff', // Modern blue for information elements
  
  // Background colors with improved hierarchy and contrast
  background: {
    default: '#0d1117', // Darker main background for better contrast
    paper: '#161b22', // Elevated card/container background
    alt: '#21262d', // Alternative background (sidebars, headers)
    hover: '#2d333b', // Hover state background
    card: '#1c2030', // Card background for higher contrast
    tooltip: '#131722', // Tooltip background
    subtle: '#30363d', // Subtle background for secondary elements
  },
  
  // Text colors with improved contrast ratios
  text: {
    primary: '#ffffff', // Main text - bright white for maximum contrast
    secondary: '#a3adc2', // Improved secondary text for better readability
    disabled: '#6e7681', // Disabled text - improved from #434651
    highlight: '#58a6ff', // Modern blue highlight text
    subtle: '#c9d1d9', // Subtle but still highly readable
  },
  
  // Border colors
  border: '#30363d',
  divider: '#30363d',
  highlight: '#3d4352',
  
  // Chart specific colors - more vibrant for better data visualization
  chart: {
    grid: '#1c2030',
    line: '#2962ff',
    green: '#00b894', // Brighter, more modern green for up candles
    red: '#ff4d4f', // Brighter red for down candles
    volume: '#6b7280',
    ma20: '#f5c953', // Moving average lines
    ma50: '#ff9800', 
    ma200: '#e040fb',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(45deg, #2962ff, #1890ff)',
    success: 'linear-gradient(45deg, #26a69a, #00b894)',
    warning: 'linear-gradient(45deg, #ff9800, #faad14)',
    error: 'linear-gradient(45deg, #ef5350, #ff4d4f)',
  }
};

export { colors };