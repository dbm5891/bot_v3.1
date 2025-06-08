import { ReactNode, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Avatar,
  Box, 
  CssBaseline, 
  IconButton, 
  Stack,
  Toolbar, 
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Badge,
  Button
} from '@mui/material';

import AppIcon from '../components/icons/AppIcon';
import { RootState } from '../store';
import { toggleDarkMode } from '../store/slices/uiSlice';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode } = useSelector((state: RootState) => state.ui);
  const [notificationCount] = useState(3); // Mock notification count

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const headerGradient = darkMode 
    ? 'linear-gradient(180deg, #1E222D 0%, #131722 100%)' 
    : 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F5 100%)';
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: '100%',
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
          background: headerGradient,
        }}
      >
        <Toolbar sx={{ justifyContent: 'flex-end', minHeight: '64px' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Tooltip title="Notifications" arrow>
              <IconButton 
                color="inherit" 
                size="medium"
                sx={{ 
                  borderRadius: theme.shape.borderRadius,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                  }
                }}
                aria-label="notifications"
              >
                <Badge badgeContent={notificationCount} color="error">
                  <AppIcon name="Bell" />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"} arrow>
              <IconButton 
                color="inherit" 
                onClick={handleThemeToggle} 
                size="medium"
                sx={{ 
                  borderRadius: theme.shape.borderRadius,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                  }
                }}
                aria-label={darkMode ? "switch to light mode" : "switch to dark mode"}
              >
                {darkMode ? <AppIcon name="Sun" /> : <AppIcon name="Moon" />}
              </IconButton>
            </Tooltip>
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center',
                borderRadius: theme.shape.borderRadius,
                px: 1.5,
                py: 0.5,
                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.background.paper, 0.8)
                },
                cursor: 'pointer'
              }}
            >
              <Avatar 
                sx={{ 
                  width: 28, 
                  height: 28,
                  bgcolor: alpha(theme.palette.primary.main, 0.9),
                  mr: 1
                }}
              >
                <AppIcon name="User" fontSize="small" />
              </Avatar>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  mr: 0.5 
                }}
              >
                User
              </Typography>
              <Box component="span" sx={{ color: theme.palette.text.secondary }}>
                <AppIcon name="ChevronDown" fontSize="small" />
              </Box>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: '64px',
          height: 'calc(100vh - 64px)',
          overflow: 'auto',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}