import React from 'react';
import { Card, CardContent, CardHeader, Divider, Box, Typography, Chip, CircularProgress, alpha, useTheme } from '@mui/material';
import { Check as CheckIcon, Error as ErrorIcon, HourglassEmpty as LoadingIcon } from '@mui/icons-material';
import AppIcon from '../icons/AppIcon';

interface StatusProps {
  loading: boolean;
  error: string | null;
  warning?: string | null;
}

interface StatusCardProps {
  strategiesStatus: StatusProps;
  dataStatus: StatusProps;
  backtestingStatus: StatusProps;
  portfolioStatus: StatusProps;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  strategiesStatus,
  dataStatus,
  backtestingStatus,
  portfolioStatus,
}) => {
  const theme = useTheme();

  const getStatusDetails = (status: StatusProps): string => {
    if (status.loading) return 'Fetching latest data...';
    if (status.error) return status.error;
    if (status.warning) return status.warning;
    return 'Data synchronized and up to date.';
  };

  const getStatusChipProps = (status: StatusProps) => {
    if (status.loading) {
      return { 
        label: 'Loading', 
        color: 'default' as 'default', 
        icon: <AppIcon name="Loader" size={16} />,
      };
    }
    if (status.error) {
      return { 
        label: 'Error', 
        color: 'error' as 'error', 
        icon: <AppIcon name="AlertCircle" size={16} />,
      };
    }
    if (status.warning) {
      return {
        label: 'Warning',
        color: 'warning' as 'warning',
        icon: <AppIcon name="AlertTriangle" size={16} />,
      };
    }
    return {
      label: 'OK',
      color: 'success' as 'success',
      icon: <AppIcon name="Check" size={16} />,
    };
  };

  const statusItems = [
    {
      name: 'Strategies Definition',
      ...getStatusChipProps(strategiesStatus),
      details: getStatusDetails(strategiesStatus),
    },
    {
      name: 'Market Data Feeds',
      ...getStatusChipProps(dataStatus),
      details: getStatusDetails(dataStatus),
    },
    {
      name: 'Backtesting Engine',
      ...getStatusChipProps(backtestingStatus),
      details: getStatusDetails(backtestingStatus),
    },
    {
      name: 'Portfolio Tracking',
      ...getStatusChipProps(portfolioStatus),
      details: getStatusDetails(portfolioStatus),
    }
  ];

  return (
    <Card 
      variant="outlined"
      sx={{ 
        height: '100%',
      }}
      component="section"
      aria-labelledby="system-status-title"
    >
      <CardHeader 
        id="system-status-title" 
        title="System Status" 
        titleTypographyProps={{ variant: 'h5' }}
        sx={{
          pb: 1
        }}
      />
      <Divider />
      <CardContent sx={{ p: 0 }}>
        {statusItems.map((item, index) => (
          <Box 
            key={item.name}
            sx={{ 
              p: 2,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.1)
              },
              transition: 'background-color 0.2s ease'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
              }}
              component="article"
              aria-label={`${item.name} status`}
            >
              <Box>
                <Typography 
                  variant="body1" 
                  component="h3" 
                  sx={{ fontWeight: 500, mb: 0.5 }}
                >
                  {item.name}
                </Typography>
                {item.details && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    aria-live={item.color === 'error' ? 'assertive' : 'polite'}
                  >
                    {item.details}
                  </Typography>
                )}
              </Box>
              <Chip
                icon={item.icon}
                label={item.label}
                color={item.color}
                size="small"
                variant="outlined"
                sx={{ minWidth: 90 }}
                aria-label={`Status: ${item.label}`}
              />
            </Box>
            {index < statusItems.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default StatusCard;