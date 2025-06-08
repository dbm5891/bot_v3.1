import { createTheme, Theme } from '@mui/material/styles';

// Enhanced TradingView-inspired color palette with modern UI updates
const colors = {
  // Main colors - slightly improved for better contrast and accessibility
  primary: '#2962ff', // Blue - primary actions, focused elements
  secondary: '#26a69a', // Green - success, positive values
  error: '#ff4d4f', // Brightened red for better visibility
  warning: '#faad14', // Optimized warning orange for alerts
  info: '#1890ff', // Modern blue for information elements
  
  // Background colors with improved hierarchy and contrast
  background: {
    default: '#0d1117', // Darker main background for better contrast
    paper: '#161b22', // Elevated card/container background
    alt: '#21262d', // Alternative background (sidebars, headers)
    hover: '#2d333b', // Hover state background
    card: '#1c2030', // Card background for higher contrast
    tooltip: '#131722', // Tooltip background
    subtle: '#30363d', // Subtle background for secondary elements
  },
  
  // Text colors with improved contrast ratios
  text: {
    primary: '#ffffff', // Main text - bright white for maximum contrast
    secondary: '#a3adc2', // Improved secondary text for better readability
    disabled: '#6e7681', // Disabled text - improved from #434651
    highlight: '#58a6ff', // Modern blue highlight text
    subtle: '#c9d1d9', // Subtle but still highly readable
  },
  
  // Border colors
  border: '#30363d',
  divider: '#30363d',
  highlight: '#3d4352',
  
  // Chart specific colors - more vibrant for better data visualization
  chart: {
    grid: '#1c2030',
    line: '#2962ff',
    green: '#00b894', // Brighter, more modern green for up candles
    red: '#ff4d4f', // Brighter red for down candles
    volume: '#6b7280',
    ma20: '#f5c953', // Moving average lines
    ma50: '#ff9800', 
    ma200: '#e040fb',
  },
  
  // Gradients
  gradients: {
    primary: 'linear-gradient(45deg, #2962ff, #1890ff)',
    success: 'linear-gradient(45deg, #26a69a, #00b894)',
    warning: 'linear-gradient(45deg, #ff9800, #faad14)',
    error: 'linear-gradient(45deg, #ef5350, #ff4d4f)',
  }
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: colors.primary,
      light: '#5b83ff',
      dark: '#0039cb',
    },
    secondary: {
      main: colors.secondary,
      light: '#64d8cb',
      dark: '#00766c',
    },
    error: {
      main: colors.error,
      light: '#ff7875',
      dark: '#d9363e',
    },
    warning: {
      main: colors.warning,
      light: '#ffd666',
      dark: '#d48806',
    },
    info: {
      main: colors.info,
      light: '#69c0ff',
      dark: '#096dd9',
    },
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
    },
    divider: colors.divider,
    action: {
      active: colors.text.primary,
      hover: 'rgba(255, 255, 255, 0.08)',
      selected: 'rgba(255, 255, 255, 0.12)',
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.8rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h3: {
      fontSize: '1.55rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.35rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
    },
    h5: {
      fontSize: '1.15rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
    },
    h6: {
      fontSize: '0.95rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    // Improve body text for better readability
    body1: {
      fontSize: '0.95rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.825rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: '0.95rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize: '0.825rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8, // Slightly increased for a more modern look
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px rgba(0,0,0,0.15)', // elevation 1 - improved subtlety
    '0px 2px 4px rgba(0,0,0,0.1), 0px 2px 5px rgba(0,0,0,0.15)', // elevation 2
    '0px 3px 5px rgba(0,0,0,0.1), 0px 3px 6px rgba(0,0,0,0.15)', // elevation 3
    '0px 3px 6px rgba(0,0,0,0.1), 0px 4px 8px rgba(0,0,0,0.15)', // elevation 4
    '0px 4px 7px rgba(0,0,0,0.1), 0px 5px 10px rgba(0,0,0,0.15)', // elevation 5
    '0px 5px 8px rgba(0,0,0,0.1), 0px 6px 12px rgba(0,0,0,0.15)', // elevation 6
    '0px 5px 10px rgba(0,0,0,0.1), 0px 7px 14px rgba(0,0,0,0.15)', // elevation 7
    '0px 6px 12px rgba(0,0,0,0.1), 0px 8px 16px rgba(0,0,0,0.15)', // elevation 8
    '0px 7px 14px rgba(0,0,0,0.1), 0px 9px 18px rgba(0,0,0,0.15)', // elevation 9
    '0px 8px 16px rgba(0,0,0,0.1), 0px 10px 20px rgba(0,0,0,0.15)', // elevation 10
    '0px 9px 18px rgba(0,0,0,0.1), 0px 11px 22px rgba(0,0,0,0.15)', // elevation 11
    '0px 10px 20px rgba(0,0,0,0.1), 0px 12px 24px rgba(0,0,0,0.15)', // elevation 12
    '0px 11px 22px rgba(0,0,0,0.1), 0px 13px 26px rgba(0,0,0,0.15)', // elevation 13
    '0px 12px 24px rgba(0,0,0,0.1), 0px 14px 28px rgba(0,0,0,0.15)', // elevation 14
    '0px 13px 26px rgba(0,0,0,0.1), 0px 15px 30px rgba(0,0,0,0.15)', // elevation 15
    '0px 14px 28px rgba(0,0,0,0.1), 0px 16px 32px rgba(0,0,0,0.15)', // elevation 16
    '0px 15px 30px rgba(0,0,0,0.1), 0px 17px 34px rgba(0,0,0,0.15)', // elevation 17
    '0px 16px 32px rgba(0,0,0,0.1), 0px 18px 36px rgba(0,0,0,0.15)', // elevation 18
    '0px 17px 34px rgba(0,0,0,0.1), 0px 19px 38px rgba(0,0,0,0.15)', // elevation 19
    '0px 18px 36px rgba(0,0,0,0.1), 0px 20px 40px rgba(0,0,0,0.15)', // elevation 20
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: `${colors.background.subtle} ${colors.background.default}`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: colors.background.default,
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 6,
            backgroundColor: colors.background.subtle,
            border: 'none',
          },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#4a4f57',
          },
          overscrollBehavior: 'none',
        },
        '@keyframes spin': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
          },
          '100%': {
            opacity: 1,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          textTransform: 'none',
          boxShadow: 'none',
          fontWeight: 600,
          borderRadius: '8px',
          minHeight: 38,
          '&:hover': {
            boxShadow: 'none',
            transform: 'translateY(-1px)',
            transition: 'transform 0.2s',
          },
          padding: '8px 20px',
          '&.Mui-focusVisible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          },
          transition: 'all 0.2s',
        }),
        contained: {
          '&.Mui-disabled': {
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            color: 'rgba(255, 255, 255, 0.3)',
          },
        },
        containedPrimary: {
          background: colors.gradients.primary,
          '&:hover': {
            background: colors.gradients.primary,
            boxShadow: '0 4px 10px rgba(41, 98, 255, 0.3)',
          },
        },
        containedSecondary: {
          background: colors.gradients.success,
          '&:hover': {
            background: colors.gradients.success,
            boxShadow: '0 4px 10px rgba(38, 166, 154, 0.3)',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
          },
        },
        outlinedPrimary: {
          borderColor: colors.primary,
        },
        sizeSmall: {
          padding: '4px 12px',
          minHeight: 32,
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '8px 22px',
          minHeight: 44,
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme, ownerState }: { theme: Theme; ownerState: { variant?: string } }) => {
          const isOutlined = ownerState.variant === 'outlined';
          return {
            backgroundColor: colors.background.card,
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${isOutlined ? theme.palette.divider : colors.border}`,
            boxShadow: isOutlined ? 'none' : theme.shadows[3],
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isOutlined ? 'none' : theme.shadows[6],
              borderColor: isOutlined ? theme.palette.primary.main : colors.highlight,
            },
          };
        },
      },
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '16px 20px',
          borderBottom: `1px solid ${colors.border}`,
        },
        title: {
          fontSize: '1.1rem',
          fontWeight: 600,
        },
        subheader: {
          fontSize: '0.85rem',
          color: colors.text.secondary,
          marginTop: 4,
        },
        action: {
          marginTop: 0,
          marginRight: 0,
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '16px 20px 20px',
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
          padding: '12px 16px',
        },
        head: {
          fontWeight: 600,
          backgroundColor: colors.background.alt,
          color: colors.text.primary,
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
          fontWeight: 600,
          fontSize: '0.9rem',
          minWidth: 100,
          '&.Mui-selected': {
            color: colors.text.highlight,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
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
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation0: { // MUI usually doesn't have elevation0, but good to define if needed
          boxShadow: 'none', // theme.shadows[0]
        },
        elevation1: {
          boxShadow: '0px 1px 2px rgba(0,0,0,0.06), 0px 1px 3px rgba(0,0,0,0.1)', // theme.shadows[1]
        },
        elevation2: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.07), 0px 2px 5px rgba(0,0,0,0.08)', // theme.shadows[2]
        },
        elevation3: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.07), 0px 3px 6px rgba(0,0,0,0.08)', // theme.shadows[3]
        },
        elevation4: {
          boxShadow: '0px 3px 5px rgba(0,0,0,0.07), 0px 4px 8px rgba(0,0,0,0.08)', // theme.shadows[4]
        },
        elevation8: {
          boxShadow: '0px 6px 12px rgba(0,0,0,0.07), 0px 8px 16px rgba(0,0,0,0.08)', // theme.shadows[8]
        },
        elevation12: {
          boxShadow: '0px 10px 20px rgba(0,0,0,0.07), 0px 12px 24px rgba(0,0,0,0.08)', // theme.shadows[12]
        },
        elevation16: { // Example for a deeper shadow
          boxShadow: '0px 10px 20px rgba(0,0,0,0.07), 0px 12px 24px rgba(0,0,0,0.08)', // theme.shadows[16] or higher if defined
        },
        elevation24: { // Example for the deepest shadow
          boxShadow: '0px 10px 20px rgba(0,0,0,0.07), 0px 12px 24px rgba(0,0,0,0.08)', // theme.shadows[24] or highest defined
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }: { theme: Theme }) => ({
          borderRadius: theme.shape.borderRadius,
          fontWeight: 500,
        }),
        filled: {
          backgroundColor: colors.background.alt,
        },
        outlined: {
          borderWidth: 1.5,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: ({ theme }: { theme: Theme }) => ({
          backgroundColor: colors.background.tooltip,
          color: colors.text.primary,
          fontSize: '0.75rem',
          fontWeight: 400,
          boxShadow: theme.shadows[2],
          border: `1px solid ${colors.border}`,
          padding: '8px 12px',
          borderRadius: theme.shape.borderRadius,
        }),
        arrow: {
          color: colors.background.tooltip,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
          backgroundImage: 'none',
          backgroundColor: colors.background.default,
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.default,
          borderRight: `1px solid ${colors.border}`,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': {
            color: colors.secondary,
            '&:hover': {
              backgroundColor: 'rgba(38, 166, 154, 0.08)',
            },
          },
          '&.Mui-checked + .MuiSwitch-track': {
            backgroundColor: colors.secondary,
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        circle: {
          strokeLinecap: 'round',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          height: 6,
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
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
        standardInfo: {
          backgroundColor: 'rgba(66, 165, 245, 0.15)',
          color: '#42a5f5',
        },
        standardSuccess: {
          backgroundColor: 'rgba(38, 166, 154, 0.15)',
          color: '#26a69a',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 152, 0, 0.15)',
          color: '#ff9800',
        },
        standardError: {
          backgroundColor: 'rgba(239, 83, 80, 0.15)',
          color: '#ef5350',
        },
      },
    },
  },
});

export { colors };
export default theme;