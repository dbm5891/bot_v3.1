import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  alpha,
  useTheme,
  Tooltip,
  Divider
} from '@mui/material';
import AppIcon, { AppIconProps } from '../icons/AppIcon';

// Use the correct type from AppIconProps
type IconName = AppIconProps['name'];

interface NavItem {
  title: string;
  path: string;
  icon: IconName;
  description?: string;
}

interface NavMenuProps {
  items: NavItem[];
  onNavigation?: (path: string) => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ items = [], onNavigation }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleNavigation = (path: string) => {
    if (onNavigation) {
      onNavigation(path);
    } else {
      navigate(path);
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      <List>
        {items.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem 
              key={index} 
              disablePadding
              sx={{ 
                mb: 0.8,
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Tooltip title={item.description || item.title} placement="right" arrow>
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
                      minWidth: 36,
                      color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                    }}
                  >
                    <AppIcon name={item.icon} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      
      {items.length > 0 && (
        <Divider sx={{ my: 1.5, mx: 2, borderColor: alpha(theme.palette.divider, 0.5) }} />
      )}
    </Box>
  );
};

export default NavMenu; 