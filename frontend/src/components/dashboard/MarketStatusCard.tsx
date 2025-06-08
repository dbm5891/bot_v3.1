import React, { useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  Grid,
  Chip,
  Skeleton,
  Alert,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
  Button,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  ArrowDropUp as ArrowUpIcon,
  ArrowDropDown as ArrowDownIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchIndexQuotes, IndexQuote } from '../../store/slices/marketDataSlice';
import AppIcon from '../icons/AppIcon';

interface MarketStatusCardProps {
  onRefreshProp?: () => void;
  variant?: 'outlined' | 'elevation';
}

const MarketStatusCard: React.FC<MarketStatusCardProps> = ({
  onRefreshProp,
  variant = 'elevation',
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { 
    indices, 
    loading: marketDataLoading, 
    error: marketDataError, 
    lastUpdated 
  } = useSelector((state: RootState) => state.marketData);

  const handleRefresh = useCallback(() => {
    dispatch(fetchIndexQuotes());
    if (onRefreshProp) {
      onRefreshProp();
    }
  }, [dispatch, onRefreshProp]);

  useEffect(() => {
    if (!lastUpdated) {
        dispatch(fetchIndexQuotes());
    }
  }, [dispatch, lastUpdated]);

  const formatTimestamp = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString();
  };

  const isLoading = marketDataLoading;
  const displayError = marketDataError;

  if (isLoading && indices.length === 0) {
    return (
      <Card 
        variant={variant}
        sx={{ borderRadius: `${theme.shape.borderRadius}px`, height: '100%' }}
      >
        <CardHeader 
          title="Market Status"
          action={
            <Tooltip title="Refresh market data">
              <span>
                <IconButton size="small" onClick={handleRefresh} disabled={isLoading} aria-label="Refresh market data" color="primary">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Skeleton variant="rectangular" height={150} animation="wave" />
          <Skeleton variant="text" sx={{ mt: 1 }} animation="wave" />
          <Skeleton variant="text" width="60%" animation="wave" />
        </CardContent>
      </Card>
    );
  }

  if (displayError) {
    let detailedErrorMessage = 'An unexpected error occurred.';
    if (typeof displayError === 'string' && displayError.includes("Invalid API KEY")) {
      detailedErrorMessage = "Invalid API Key. Please verify your API key in application settings.";
    } else if (typeof displayError === 'object' && displayError !== null && (displayError as any).message) {
      detailedErrorMessage = (displayError as any).message;
      if (detailedErrorMessage.includes("Invalid API KEY")) {
        detailedErrorMessage = "Invalid API Key. Please verify your API key in application settings.";
      }
    } else if (typeof displayError === 'string') {
      detailedErrorMessage = displayError;
    }

    return (
      <Card 
        variant={variant}
        sx={{ borderRadius: `${theme.shape.borderRadius}px`, height: '100%' }}
      >
        <CardHeader 
          title="Market Status"
           action={
            <Tooltip title="Refresh market data">
              <span>
                <IconButton size="small" onClick={handleRefresh} aria-label="Refresh market data" color="primary">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Alert severity="error" variant="filled" sx={{mb:1}}>
            Market Data Connection Issue
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {detailedErrorMessage}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              If the issue persists, you can also visit the <a href="https://site.financialmodelingprep.com/faqs?search=why-is-my-api-key-invalid" target="_blank" rel="noopener noreferrer" style={{color: theme.palette.error.contrastText}}>FinancialModelingPrep FAQ</a>.
            </Typography>
          </Alert>
          <Button onClick={handleRefresh} variant="outlined" size="small" sx={{ mt: 1 }}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }
  
  const displayedIndices = indices.slice(0, 4);

  return (
    <Card 
      variant={variant}
      sx={{ borderRadius: `${theme.shape.borderRadius}px`, height: '100%' }}
    >
      <CardHeader
        title="Market Status"
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {lastUpdated && (
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  mr: 1,
                }}
              >
                <ScheduleIcon fontSize="small" color="primary" sx={{ mr: 0.5, fontSize: '1rem' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatTimestamp(lastUpdated)}
                </Typography>
              </Box>
            )}
            <Tooltip title="Refresh market data">
              <span style={{ display: 'inline-flex' }}>
                <IconButton 
                  size="small" 
                  onClick={handleRefresh} 
                  aria-label="Refresh market data"
                  color="primary"
                  disabled={isLoading}
                  sx={{ 
                    animation: isLoading ? 'spin 0.8s linear infinite' : 'none',
                    backgroundColor: isLoading ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    },
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {displayedIndices.length === 0 && !isLoading ? (
          <Box sx={{ p:2, textAlign: 'center', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Typography variant="body2" color="text.secondary">
              No market index data available.
              <br />
              Please check your API key or network connection.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={0} sx={{ flexGrow: 1 }}>
            {displayedIndices.map((indexData: IndexQuote, arrayIndex) => {
              const isPositive = indexData.change >= 0;
              const changeColor = isPositive ? theme.palette.success.main : theme.palette.error.main;
              
              return (
                <Grid item xs={6} sm={12} md={6} key={indexData.symbol} sx={{ display: 'flex' }}>
                  <Box
                    sx={{
                      p: 2,
                      flexGrow: 1,
                      borderBottom: (arrayIndex < displayedIndices.length - (displayedIndices.length % 2 === 0 ? 2 : 1) ) ? `1px solid ${theme.palette.divider}` : 'none',
                      borderRight: (arrayIndex % 2 === 0 && displayedIndices.length > 1) ? `1px solid ${theme.palette.divider}` : 'none',
                      transition: 'background-color 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.04),
                      },
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                      <Box>
                        <Typography 
                          variant="subtitle2" 
                          component="div"
                          sx={{ fontWeight: 500, lineHeight: 1.3 }}
                          gutterBottom
                        >
                          {indexData.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" component="div">
                          {indexData.symbol}
                        </Typography>
                      </Box>
                      <Chip 
                        icon={<AppIcon name={isPositive ? 'ArrowUp' : 'ArrowDown'} size={18} />}
                        label={
                          typeof indexData.changesPercentage === 'number' && isFinite(indexData.changesPercentage)
                            ? `${indexData.changesPercentage.toFixed(2)}%`
                            : 'N/A'
                        }
                        size="small"
                        color={isPositive ? "success" : "error"}
                        variant="filled"
                        sx={{
                          fontWeight: 'medium',
                          height: 22,
                          fontSize: '0.7rem',
                          '.MuiChip-icon': { fontSize: '1.2rem' }
                        }}
                      />
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'medium' }}>
                        {typeof indexData.price === 'number' && isFinite(indexData.price)
                          ? indexData.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})
                          : 'N/A'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ color: changeColor }}
                      >
                        {typeof indexData.change === 'number' && isFinite(indexData.change)
                          ? `${isPositive ? '+' : ''}${indexData.change.toFixed(2)}`
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketStatusCard; 