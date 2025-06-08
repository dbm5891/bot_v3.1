import React from 'react';
import { Box, Card, CardContent, Typography, alpha, useTheme, IconButton, Tooltip, Skeleton } from '@mui/material';
import AppIcon, { AppIconProps } from '../icons/AppIcon';

export interface StatCardProps {
  title: string;
  value: string | number;
  delta?: {
    value: string | number;
    isPositive: boolean;
  };
  icon?: AppIconProps['name'] | React.ReactNode;
  color?: string;
  description?: string;
  loading?: boolean;
  error?: string | null;
  onClick?: () => void;
  action?: {
    icon: AppIconProps['name'];
    label: string;
    onClick: () => void;
  };
  secondaryValue?: {
    label: string;
    value: string | number;
  };
  precision?: number;
  prefix?: string;
  suffix?: string;
  tooltip?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  delta,
  icon,
  color,
  description,
  loading = false,
  error = null,
  onClick,
  action,
  secondaryValue,
  precision = 2,
  prefix = '',
  suffix = '',
  tooltip,
  variant = 'default',
}) => {
  const theme = useTheme();
  
  // Format numeric values
  const formattedValue = typeof value === 'number'
    ? `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}${suffix}`
    : `${prefix}${value}${suffix}`;
  
  // Format delta values
  const formattedDelta = delta && typeof delta.value === 'number' 
    ? delta.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : delta?.value;

  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const positiveColor = theme.palette.success || theme.palette.secondary;
  const negativeColor = theme.palette.error;

  // Determine icon to use - improved handling
  const renderIcon = () => {
    if (!icon) return null;
    
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    if (typeof icon === 'string') {
      // Use AppIcon for string-based icon names
      return <AppIcon name={icon as AppIconProps['name']} size={24} color={color || theme.palette.text.primary} />;
    }
    
    return null;
  };

  const cardStyles = {
    height: '100%',
    backgroundColor: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
    cursor: onClick ? 'pointer' : 'default',
    ...(variant === 'outlined' && {
      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    }),
    ...(variant === 'elevated' && {
      boxShadow: theme.shadows[2],
    }),
    '&:hover': {
      transform: onClick ? 'translateY(-4px)' : 'none',
      boxShadow: onClick ? theme.shadows[4] : undefined,
    },
  };

  return (
    <Card
      sx={cardStyles}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3, position: 'relative', height: '100%' }}>
        {loading ? (
          <Box sx={{ width: '100%' }}>
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="70%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="60%" height={20} />
          </Box>
        ) : error ? (
          <Box sx={{ color: theme.palette.error.main }}>
            <Typography variant="subtitle2">{title}</Typography>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Tooltip title={tooltip || ''} arrow placement="top">
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ 
                    fontWeight: 500,
                    textTransform: 'capitalize',
                    letterSpacing: '0.02em',
                  }}
                  aria-label={tooltip}
                >
                  {title}
                </Typography>
              </Tooltip>
              
              {action && (
                <Tooltip title={action.label} arrow>
                  <IconButton 
                    size="small" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      action.onClick(); 
                    }}
                    aria-label={action.label}
                    sx={{ 
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: 1.5,
                      p: 0.5,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <AppIcon name={action.icon} size={16} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant="h4" 
                component="div"
                sx={{ 
                  fontWeight: 700,
                  mb: 1, 
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {formattedValue}
              </Typography>
              
              {delta && (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1,
                    color: delta.isPositive ? positiveColor.main : negativeColor.main,
                    backgroundColor: alpha(delta.isPositive ? positiveColor.main : negativeColor.main, 0.1),
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                    width: 'fit-content',
                  }}
                >
                  <AppIcon 
                    name={delta.isPositive ? 'TrendingUp' : 'TrendingDown'} 
                    size={16} 
                    style={{ marginRight: 4 }}
                  />
                  <Typography 
                    variant="body2" 
                    component="span"
                    sx={{ 
                      fontWeight: 600,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {delta.isPositive ? '+' : ''}{formattedDelta}%
                  </Typography>
                </Box>
              )}
              
              {description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ mt: 1, fontSize: '0.825rem' }}
                >
                  {description}
                </Typography>
              )}
              
              {secondaryValue && (
                <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    {secondaryValue.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {secondaryValue.value}
                  </Typography>
                </Box>
              )}
            </Box>
            
            {icon && (
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundImage: `linear-gradient(135deg, ${alpha(color || primaryColor, 0.2)}, ${alpha(color || secondaryColor, 0.1)})`,
                  color: color || primaryColor,
                  zIndex: 0,
                }}
              >
                {renderIcon()}
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;