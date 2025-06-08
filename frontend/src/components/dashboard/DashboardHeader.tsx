import { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Menu,
  MenuItem,
  alpha,
  useTheme,
  Button
} from '@mui/material';
import AppIcon from '../icons/AppIcon';

interface DashboardHeaderProps {
  onRefresh: () => void;
  lastRefreshed?: string;
  autoRefreshInterval?: number;
  onAutoRefreshIntervalChange: (interval: number | undefined) => void;
  countdownSeconds?: number;
  loading?: boolean;
  showBenchmark?: boolean;
  handleBenchmarkToggle?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AUTO_REFRESH_OPTIONS = [
  { label: 'Off', value: undefined },
  { label: '30 seconds', value: 30 },
  { label: '1 minute', value: 60 },
  { label: '5 minutes', value: 300 },
  { label: '15 minutes', value: 900 },
  { label: '30 minutes', value: 1800 },
];

const DashboardHeader = ({ 
  onRefresh, 
  lastRefreshed, 
  autoRefreshInterval, 
  onAutoRefreshIntervalChange,
  countdownSeconds,
  loading = false,
  showBenchmark = false,
  handleBenchmarkToggle
}: DashboardHeaderProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const refreshMenuOpen = Boolean(anchorEl);

  const handleRefreshClick = () => {
    if (!loading) {
      onRefresh();
    }
  };

  const handleRefreshMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleRefreshMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRefreshOptionClick = (interval: number | undefined) => {
    onAutoRefreshIntervalChange(interval);
    handleRefreshMenuClose();
  };

  const getRefreshIntervalLabel = () => {
    const option = AUTO_REFRESH_OPTIONS.find(option => option.value === autoRefreshInterval);
    return option ? option.label : 'Auto-refresh';
  };

  return (
    <Box 
      sx={{ 
        mb: 3,
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2
      }}
    >
      <Box>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom={false}
          sx={{ 
            fontWeight: 700,
            mb: 0.5,
            backgroundImage: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'inherit',
            WebkitTextFillColor: 'unset',
          }}
        >
          Dashboard
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          {lastRefreshed && (
            <>
              <AppIcon name="Clock" size={14} />
              Last updated: {lastRefreshed}
            </>
          )}
        </Typography>
      </Box>

      <Stack 
        direction="row" 
        spacing={1.5} 
        alignItems="center"
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)',
          borderRadius: 2,
          p: 0.5,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.shadows[1],
        }}
      >
        {handleBenchmarkToggle && (
          <Tooltip title="Compare with market benchmark" arrow placement="top">
            <FormControlLabel
              control={
                <Switch
                  checked={showBenchmark}
                  onChange={handleBenchmarkToggle}
                  size="small"
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: theme.palette.primary.main,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.5),
                    },
                  }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Benchmark
                </Typography>
              }
              sx={{ mr: 1 }}
            />
          </Tooltip>
        )}

        <Box sx={{ position: 'relative' }}>
          <Button
            id="refresh-button"
            aria-controls={refreshMenuOpen ? 'refresh-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={refreshMenuOpen ? 'true' : undefined}
            onClick={handleRefreshMenuClick}
            variant="text"
            color="primary"
            size="small"
            endIcon={<AppIcon name="ChevronDown" size={16} />}
            sx={{ 
              fontWeight: 500,
              textTransform: 'none',
              minWidth: 'auto',
              borderRadius: 1.5,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          >
            {countdownSeconds !== undefined ? `${countdownSeconds}s` : getRefreshIntervalLabel()}
          </Button>
          <Menu
            id="refresh-menu"
            anchorEl={anchorEl}
            open={refreshMenuOpen}
            onClose={handleRefreshMenuClose}
            MenuListProps={{
              'aria-labelledby': 'refresh-button',
              dense: true,
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 0.5,
                minWidth: 120,
                borderRadius: 2,
                backdropFilter: 'blur(8px)',
                backgroundColor: alpha(theme.palette.background.paper, 0.9),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }
            }}
          >
            {AUTO_REFRESH_OPTIONS.map((option) => (
              <MenuItem 
                key={option.label} 
                onClick={() => handleRefreshOptionClick(option.value)}
                selected={option.value === autoRefreshInterval}
                sx={{
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                  fontSize: '0.875rem',
                  fontWeight: option.value === autoRefreshInterval ? 600 : 400,
                  color: option.value === autoRefreshInterval ? theme.palette.primary.main : 'inherit',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                  '&.Mui-selected': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                    }
                  }
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>

        <Tooltip title="Refresh data" arrow placement="top">
          <span style={{ display: 'inline-flex' }}>
            <IconButton 
              onClick={handleRefreshClick}
              color="primary"
              aria-label="refresh dashboard data"
              disabled={loading}
              sx={{
                animation: loading ? 'spin 1s linear infinite' : 'none',
                transition: 'background-color 0.3s',
              }}
            >
              <AppIcon name="RefreshCw" size={20} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
};

export default DashboardHeader; 