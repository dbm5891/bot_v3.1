import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Container,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  BarChart2 as BarChartIcon,
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from "@mui/icons-material";
import AppIcon from "../icons/AppIcon";
import { RootState } from "../../store";
import { toggleDarkMode } from "../../store/slices/uiSlice";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NavbarProps {
  logo?: React.ReactNode;
  navItems?: NavItem[];
  className?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo = (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box component="span" sx={{ mr: 1, color: "primary.main" }}>
        <AppIcon name="BarChart2" />
      </Box>
      <Typography
        variant="h6"
        component="span"
        sx={{
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: -0.5,
          background: (theme) => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "transparent",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          userSelect: "none",
        }}
      >
        Bot v3.1
      </Typography>
    </Box>
  ),
  navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <AppIcon name="LayoutDashboard" />,
    },
    {
      name: "Market Data",
      path: "/market-data",
      icon: <AppIcon name="TrendingUp" />,
    },
    {
      name: "Backtesting",
      path: "/backtesting",
      icon: <AppIcon name="BarChart2" />,
    },
    {
      name: "Strategies",
      path: "/strategies",
      icon: <AppIcon name="Code2" />,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <AppIcon name="PieChart" />,
    },
  ],
  className,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { darkMode } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if we've scrolled past threshold
      if (currentScrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      
      // Determine scroll direction for hiding/showing
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileDrawerOpen(false);
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleDarkMode());
  };

  const toggleDrawer = (open: boolean) => {
    setMobileDrawerOpen(open);
  };

  return (
    <motion.div
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: visible ? 0 : -100,
        opacity: visible ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <AppBar
        position="fixed"
        elevation={scrolled ? 2 : 0}
        sx={{
          backgroundColor: scrolled
            ? alpha(theme.palette.background.paper, 0.8)
            : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          transition: "all 0.3s ease",
          borderBottom: scrolled ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : "none",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 64 }}>
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", flexGrow: { xs: 1, md: 0 } }}>
              {logo}
            </Box>

            {/* Desktop Navigation */}
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", md: "flex" },
                justifyContent: "center",
                ml: 4,
              }}
            >
              {navItems.map((item, index) => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={index}
                    onClick={() => handleNavigation(item.path)}
                    sx={{
                      mx: 1,
                      color: isActive ? "primary.main" : "text.primary",
                      fontWeight: isActive ? 600 : 500,
                      position: "relative",
                      "&:after": isActive
                        ? {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: "20%",
                            width: "60%",
                            height: "3px",
                            borderRadius: "3px 3px 0 0",
                            backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          }
                        : {},
                      "&:hover": {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                    startIcon={item.icon}
                  >
                    {item.name}
                  </Button>
                );
              })}
            </Box>

            {/* Right side actions */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                color="inherit"
                onClick={handleThemeToggle}
                sx={{
                  ml: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
                size="small"
                aria-label="toggle theme"
              >
                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>

              <Button
                variant="outlined"
                startIcon={<SearchIcon />}
                sx={{
                  ml: 2,
                  display: { xs: "none", sm: "flex" },
                  borderRadius: "8px",
                }}
                size="small"
              >
                Search
              </Button>

              <Button
                variant="contained"
                sx={{
                  ml: 2,
                  display: { xs: "none", sm: "flex" },
                  borderRadius: "8px",
                  backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
                size="small"
              >
                Sign In
              </Button>

              {/* Mobile menu button */}
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={() => toggleDrawer(true)}
                sx={{ ml: 1, display: { md: "none" } }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => toggleDrawer(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280,
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {logo}
          <IconButton onClick={() => toggleDrawer(false)}>
            <ChevronRightIcon />
          </IconButton>
        </Box>
        <Divider />
        <List sx={{ py: 2 }}>
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    my: 0.5,
                    position: "relative",
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                    "&::before": isActive
                      ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "4px",
                          height: "60%",
                          borderRadius: "0 4px 4px 0",
                          backgroundImage: `linear-gradient(to bottom, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }
                      : {},
                    "&:hover": {
                      bgcolor: isActive
                        ? alpha(theme.palette.primary.main, 0.15)
                        : alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 40,
                      color: isActive ? "primary.main" : "text.secondary",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontSize: "0.95rem",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<SearchIcon />}
            sx={{ mb: 2, borderRadius: "8px" }}
          >
            Search
          </Button>
          <Button
            fullWidth
            variant="contained"
            sx={{
              borderRadius: "8px",
              backgroundImage: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            Sign In
          </Button>
        </Box>
      </Drawer>
    </motion.div>
  );
};

export default Navbar; 