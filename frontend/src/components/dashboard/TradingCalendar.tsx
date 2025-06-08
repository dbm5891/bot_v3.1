import React, { useEffect } from 'react';
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
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  useTheme,
  alpha,
  Button,
} from '@mui/material';
import {
  Event as EventIcon,
  DateRange as DateRangeIcon,
  Notifications as NotificationsIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Announcement as AnnouncementIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchCalendarEvents, CalendarEvent, clearCalendarError } from '../../store/slices/tradingCalendarSlice';

interface TradingCalendarProps {
  onViewAll?: () => void;
  variant?: 'outlined' | 'elevation';
  daysToFetch?: number;
}

const TradingCalendar: React.FC<TradingCalendarProps> = ({
  onViewAll,
  variant = 'elevation',
  daysToFetch = 14,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();

  const { 
    events: calendarEvents, 
    loading,
    error,
    lastUpdated 
  } = useSelector((state: RootState) => state.tradingCalendar);

  const handleRefresh = () => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysToFetch);
    dispatch(fetchCalendarEvents({ from: today, to: futureDate }));
  };

  useEffect(() => {
    if (!lastUpdated && !loading) {
      handleRefresh();
    }
  }, [dispatch, lastUpdated, loading, daysToFetch]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getEventIconAndColor = (type: CalendarEvent['type'], impact?: CalendarEvent['impact']) => {
    let icon;
    let color;

    switch (type) {
      case 'earnings':
        icon = <AnnouncementIcon fontSize="small" />;
        color = theme.palette.info.main;
        break;
      case 'economic':
        icon = impact === 'high' ? <WarningIcon fontSize="small" /> : <InfoIcon fontSize="small" />;
        color = impact === 'high' ? theme.palette.warning.main : theme.palette.primary.light;
        break;
      case 'holiday':
        icon = <DateRangeIcon fontSize="small" />;
        color = theme.palette.success.main;
        break;
      case 'dividend':
        icon = <EventIcon fontSize="small" />;
        color = theme.palette.secondary.main;
        break;
      case 'ipo':
        icon = <NotificationsIcon fontSize="small" />;
        color = theme.palette.warning.dark;
        break;
      default:
        icon = <EventIcon fontSize="small" />;
        color = theme.palette.grey[500];
    }

    return { icon, color };
  };

  if (loading && calendarEvents.length === 0) {
    return (
      <Card variant={variant} sx={{ height: '100%' }}>
        <CardHeader 
          title="Trading Calendar" 
          action={
            <Tooltip title="Refresh Calendar">
              <span>
                <IconButton size="small" onClick={handleRefresh} disabled={loading} aria-label="Refresh calendar data">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent>
          <Skeleton variant="rectangular" height={200} animation="wave" />
          <Skeleton variant="text" sx={{ mt: 1 }} animation="wave" />
          <Skeleton variant="text" width="60%" animation="wave" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card variant={variant} sx={{ height: '100%' }}>
        <CardHeader 
          title="Trading Calendar" 
          action={
            <Tooltip title="Refresh Calendar">
              <span>
                <IconButton size="small" onClick={handleRefresh} aria-label="Refresh calendar data">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          }
        />
        <Divider />
        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p:2 }}>
          <Alert severity="error" variant="filled" sx={{mb:1, width: '100%'}}>{error}</Alert>
          <Button 
            onClick={() => {
              dispatch(clearCalendarError());
              handleRefresh();
            }}
            variant="outlined" 
            size="small"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant={variant} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title="Trading Calendar"
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Tooltip title="Refresh Calendar">
              <span>
                <IconButton 
                    size="small" 
                    onClick={handleRefresh} 
                    disabled={loading}
                    aria-label="Refresh calendar" 
                    color="primary"
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            {onViewAll && (
              <Tooltip title="View all events">
                <IconButton
                  size="small"
                  onClick={onViewAll}
                  aria-label="View all calendar events"
                >
                  <ArrowForwardIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      <Divider />
      <CardContent sx={{ p: 0, flexGrow: 1, overflowY: 'auto' }}>
        {calendarEvents.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center', display: 'flex', alignItems:'center', justifyContent:'center', height: '100%' }}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              No upcoming trading events for the selected period.
              <br />
              {onViewAll 
                ? <>
                    Try refreshing, or use the 
                    <ArrowForwardIcon sx={{ verticalAlign: 'bottom', fontSize: '1.1rem', mx: 0.5 }} /> 
                    button to view all events and adjust filters.
                  </>
                : (lastUpdated ? 'Try refreshing or consider broadening your filter criteria.' : 'Fetching events...')}
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {calendarEvents.slice(0, 5).map((event, index) => {
              const { icon, color } = getEventIconAndColor(event.type, event.impact);
              return (
                <React.Fragment key={event.id}>
                  <ListItem
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.action.hover, 0.04),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        mr: 1.5,
                        minWidth: '70px',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                        {formatDate(event.date).split(', ')[0]}
                      </Typography>
                       <Typography variant="body2" color="text.secondary">
                        {formatDate(event.date).split(', ')[1]}
                      </Typography>
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                          <Chip
                            icon={icon}
                            label={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: alpha(color, 0.15),
                              color: color,
                              borderColor: color,
                            }}
                            variant="outlined"
                          />
                          <Typography variant="body1" component="span" sx={{ fontWeight: 500, flexGrow: 1, mr: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</Typography>
                          {event.impact && (
                            <Chip
                              label={`${event.impact.charAt(0).toUpperCase() + event.impact.slice(1)} Impact`}
                              size="small"
                              color={event.impact === 'high' ? 'error' : event.impact === 'medium' ? 'warning' : 'default'}
                              sx={{ height: 20, fontSize: '0.7rem' }}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={event.description}
                      secondaryTypographyProps={{ variant: 'caption', mt: 0.5 }}
                    />
                  </ListItem>
                  {index < calendarEvents.slice(0, 5).length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              );
            })}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default TradingCalendar; 