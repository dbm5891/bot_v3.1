import { createTheme } from '@mui/material/styles';

// TradingView-inspired color palette
const colors = {
  // Main colors
  primary: '#2962ff', // Blue - primary actions, focused elements
  secondary: '#26a69a', // Green - success, positive values
  error: '#ef5350', // Red - errors, negative values
  warning: '#ff9800', // Orange - warnings, alerts
  info: '#42a5f5', // Light blue - informational elements
  
  // Background colors
  background: {
    default: '#131722', // Main background
    paper: '#1e222d', // Card/container background
    alt: '#2a2e39', // Alternative background (sidebars, headers)
    hover: '#2c3040', // Hover state background
  },
  
  // Text colors
  text: {
    primary: '#d1d4dc', // Main text
    secondary: '#787b86', // Secondary/muted text
    disabled: '#434651', // Disabled text
  },
  
  // Border colors
  border: '#2a2e39',
  
  // Chart specific colors
  chart: {
    grid: '#1c2030',
    line: '#2962ff',
    green: '#26a69a', // Up candle/positive
    red: '#ef5350', // Down candle/negative
    volume: '#5f6368',
    ma20: '#f5c953', // Moving average lines
    ma50: '#ff9800',
    ma200: '#e040fb',
  }
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
    },
    secondary: {
      main: colors.secondary,
    },
    error: {
      main: colors.error,
    },
    warning: {
      main: colors.warning,
    },
    info: {
      main: colors.info,
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    divider: colors.border,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${colors.background.alt} ${colors.background.default}`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: colors.background.default,
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: colors.background.alt,
            border: 'none',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#4a4f57',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          fontWeight: 500,
          '&:hover': {
            boxShadow: 'none',
          },
          padding: '6px 16px',
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#1a56f0',
          },
        },
        containedSecondary: {
          backgroundColor: colors.secondary,
          '&:hover': {
            backgroundColor: '#1d9384',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.15)',
          border: `1px solid ${colors.border}`,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)',
          },
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
        },
        title: {
          fontSize: '1rem',
          fontWeight: 500,
        },
        subheader: {
          fontSize: '0.85rem',
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '12px 20px 20px',
          '&:last-child': {
            paddingBottom: '20px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.border}`,
          padding: '10px 16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: colors.background.alt,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.background.hover,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.9rem',
          minWidth: 100,
          '&.Mui-selected': {
            fontWeight: 600,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.alt,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.border,
        },
      },
    },
  },
});

export { colors };
export default theme;