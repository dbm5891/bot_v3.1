import { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Avatar,
  Box, 
  CssBaseline, 
  Divider, 
  Drawer,
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Stack,
  Toolbar, 
  Tooltip,
  Typography,
  alpha,
  useTheme,
  Menu,
  MenuItem,
  Collapse
} from '@mui/material';

import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  ShowChart as BacktestIcon,
  Code as StrategiesIcon,
  Storage as DataIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  TrendingUp as MarketDataIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

import { RootState } from '../store';
import { toggleSidebar, toggleDarkMode } from '../store/slices/uiSlice';
import AppIcon from '../components/icons/AppIcon';
import React, { useState } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import Navbar from '../components/common/Navbar';

const drawerWidth = 240;

interface NavItem {
  title: string;
  path: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: <AppIcon name="LayoutDashboard" /> },
  { title: 'Market Data', path: '/market-data', icon: <AppIcon name="TrendingUp" /> },
  { title: 'Backtesting', path: '/backtesting', icon: <AppIcon name="BarChart2" /> },
  { title: 'Strategies', path: '/strategies', icon: <AppIcon name="Code2" /> },
  { title: 'Data Management', path: '/data', icon: <AppIcon name="Database" /> },
  { title: 'Analytics', path: '/analytics', icon: <AppIcon name="PieChart" /> },
  { title: 'Settings', path: '/settings', icon: <AppIcon name="Settings" /> },
];

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, darkMode } = useSelector((state: RootState) => state.ui);
  const [isProTipsOpen, setIsProTipsOpen] = useState(true);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    dispatch(toggleSidebar());
  };

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const activeColor = theme.palette.primary.main;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: theme.palette.background.default }}>
      <CssBaseline />
      
      <Navbar />
      
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={sidebarOpen}
        onClose={handleDrawerToggle}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: theme.shadows[4],
            backgroundColor: alpha(theme.palette.background.paper, 0.98),
            backdropFilter: 'blur(8px)',
            transition: theme.transitions.create(['width', 'transform'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: [1],
            minHeight: '64px',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <Box component="span" sx={{ mr: 1, color: theme.palette.primary.main }}>
              <AppIcon name="BarChart2" />
            </Box>
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: -0.5,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'transparent',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                userSelect: 'none',
              }}
            >
              Bot v3.1
            </Typography>
          </Box>
          <IconButton 
            onClick={handleDrawerToggle} 
            aria-label="close sidebar"
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: 1.5,
              transition: 'all 0.2s',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                transform: 'translateY(-50%) scale(1.05)',
              }
            }}
          >
            {theme.direction === 'rtl' ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </Toolbar>

        <Box sx={{ overflow: 'auto', py: 2 }}>
          <List>
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem 
                  key={index} 
                  disablePadding
                  sx={{ 
                    mb: 0.5,
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      borderRadius: 2,
                      mx: 1,
                      position: 'relative',
                      py: 1.2,
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                      '&::before': isActive ? {
                        content: '""',
                        position: 'absolute',
                        left: '-8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '4px',
                        height: '60%',
                        borderRadius: '0 4px 4px 0',
                        backgroundImage: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      } : {},
                      '&:hover': {
                        bgcolor: isActive 
                          ? alpha(theme.palette.primary.main, 0.15) 
                          : alpha(theme.palette.primary.main, 0.05),
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.title}
                      primaryTypographyProps={{
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 600 : 500,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          
          <Divider sx={{ my: 2, mx: 2, borderColor: alpha(theme.palette.divider, 0.5) }} />
          
          <Box sx={{ px: 3, mt: 2 }}>
            <Box 
              sx={{
                p: 2, 
                borderRadius: 3,
                backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.4)}, ${alpha(theme.palette.primary.main, 0.2)})`,
                backdropFilter: 'blur(8px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" color="primary.main" fontWeight={600} gutterBottom sx={{ mb: 0 }}>
                  Pro Tips
                </Typography>
                <IconButton 
                  onClick={() => setIsProTipsOpen(!isProTipsOpen)} 
                  size="small"
                  aria-label={isProTipsOpen ? "Collapse pro tips" : "Expand pro tips"}
                >
                  {isProTipsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={isProTipsOpen}>
                <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
                  Use keyboard shortcuts for faster navigation and improved workflow
                </Typography>
              </Collapse>
            </Box>
          </Box>
        </Box>
      </Drawer>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          mt: 8,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Box 
          sx={{ 
            flexGrow: 1, 
            animation: 'fadeIn 0.3s ease-in-out',
            pt: 1
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
} 