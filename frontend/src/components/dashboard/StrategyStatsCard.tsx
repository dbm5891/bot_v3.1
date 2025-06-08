import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Skeleton,
  Alert,
  useTheme,
  Grid,
  Button,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Loop as StrategyIcon,
  Timer as TimerIcon,
  CheckCircle as ActiveIcon,
  CalendarToday as CalendarIcon,
  Insights as InsightsIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';

// Utility to format date strings
const formatDateString = (dateStr: string | undefined, locale: string = 'en-US'): string => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'Invalid Date';
    // Simple relative time for recent dates, otherwise short date
    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const diffDays = Math.round(diffSeconds / (24 * 60 * 60));

    if (diffSeconds < 60) return 'just now';
    if (diffSeconds < 3600) return `${Math.round(diffSeconds / 60)} min ago`;
    if (diffSeconds < 86400) return `${Math.round(diffSeconds / 3600)} hr ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return 'Invalid Date';
  }
};

interface StrategyStats {
  id: string;
  name: string;
  isActive: boolean;
  returns: number;
  trades: number;
  winRate: number;
  lastUpdated: string;
  description?: string;
}

interface StrategyStatsCardProps {
  strategies: StrategyStats[];
  loading?: boolean;
  error?: string | null;
  onViewDetails: (id: string) => void;
  variant?: 'outlined' | 'elevation';
}

const StrategyStatsCard: React.FC<StrategyStatsCardProps> = ({
  strategies,
  loading = false,
  error = null,
  onViewDetails,
  variant = 'elevation',
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Card variant={variant} sx={{
        borderRadius: theme.shape.borderRadius,
        boxShadow: variant === 'elevation' ? theme.shadows[3] : 'none',
      }}>
        <CardHeader title="Active Strategies" titleTypographyProps={{ variant: 'h6' }} />
        <Divider />
        <CardContent>
          <Skeleton variant="rectangular" height={180} animation="wave" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant={variant} sx={{
        borderRadius: theme.shape.borderRadius,
        boxShadow: variant === 'elevation' ? theme.shadows[3] : 'none',
      }}>
        <CardHeader title="Active Strategies" titleTypographyProps={{ variant: 'h6' }} />
        <Divider />
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!strategies || strategies.length === 0) {
    return (
      <Card variant={variant} sx={{
        borderRadius: theme.shape.borderRadius,
        boxShadow: variant === 'elevation' ? theme.shadows[3] : 'none',
      }}>
        <CardHeader title="Active Strategies" titleTypographyProps={{ variant: 'h6' }} />
        <Divider />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{textAlign: 'center', p:2}}>No active strategies found.</Typography>
        </CardContent>
      </Card>
    );
  }

  const sortedStrategies = [...strategies].sort((a, b) => b.returns - a.returns);

  return (
    <Card variant={variant} sx={{
      borderRadius: theme.shape.borderRadius,
      boxShadow: variant === 'elevation' ? theme.shadows[3] : 'none',
      transition: theme.transitions.create(['transform', 'box-shadow'], { duration: theme.transitions.duration.short }),
      '&:hover': variant === 'elevation' ? {
          boxShadow: theme.shadows[6],
          transform: 'translateY(-2px)',
      } : {},
      height: '100%', // Ensure card takes full height for consistent layout if in grid
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardHeader
        title="Top Active Strategies"
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Button 
            size="small" 
            endIcon={<ArrowForwardIcon />} 
            onClick={() => onViewDetails('all')}
            aria-label="View all active strategies"
          >
            View All
          </Button>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0, flexGrow: 1, overflowY: 'auto' }}>
        <List sx={{ width: '100%', p: 0 }}>
          {sortedStrategies.map((strategy, index) => (
            <React.Fragment key={strategy.id}>
              {index > 0 && <Divider variant="inset" component="li" />}
              <ListItem
                button
                onClick={() => onViewDetails(strategy.id)}
                alignItems="flex-start"
                sx={{ 
                  px: 2, 
                  py: 1.5,
                  transition: 'background-color 0.2s ease',
                  '&:hover': { 
                    bgcolor: alpha(theme.palette.primary.main, 0.04) // Consistent hover with other cards
                  } 
                }}
              >
                <ListItemIcon sx={{ minWidth: '36px', mt: 0.5, color: strategy.isActive ? theme.palette.success.main : theme.palette.action.disabled }}>
                  <StrategyIcon fontSize="medium" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <Typography variant="subtitle1" component="span" sx={{ fontWeight: 500, mr: 1, flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {strategy.name}
                      </Typography>
                      {strategy.isActive && (
                        <Tooltip title="Strategy is active">
                          <Chip 
                            icon={<ActiveIcon sx={{ fontSize: '1rem'}}/>}
                            label="Active" 
                            size="small" 
                            color="success" 
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }} // Ensure secondary can host Grid
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      {strategy.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1}}>
                          {strategy.description.length > 70 ? `${strategy.description.substring(0, 70)}...` : strategy.description}
                        </Typography>
                      )}
                      <Grid container spacing={1} alignItems="center">
                        <Grid item xs={6} sm={3}>
                          <Tooltip title="Total Returns">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {strategy.returns >= 0 ? (
                                <TrendingUpIcon fontSize="small" sx={{ color: theme.palette.success.main }} />
                              ) : (
                                <TrendingDownIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                              )}
                              <Typography variant="body2" component="span" sx={{ color: strategy.returns >= 0 ? theme.palette.success.dark : theme.palette.error.dark, fontWeight: 'medium' }}>
                                {`${strategy.returns > 0 ? '+' : ''}${strategy.returns.toFixed(2)}%`}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                           <Tooltip title="Number of Trades">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <InsightsIcon fontSize="small" color="action" />
                              <Typography variant="body2" component="span" color="text.secondary">
                                {`${strategy.trades} trades`}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Tooltip title="Win Rate">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <TimerIcon fontSize="small" color="action" />
                              <Typography variant="body2" component="span" color="text.secondary">
                                {`${strategy.winRate.toFixed(0)}%`}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Tooltip title={`Last Updated: ${new Date(strategy.lastUpdated).toLocaleString()}`}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CalendarIcon fontSize="small" color="action" />
                              <Typography variant="caption" component="span" color="text.secondary">
                                {formatDateString(strategy.lastUpdated)}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Box>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default StrategyStatsCard; 