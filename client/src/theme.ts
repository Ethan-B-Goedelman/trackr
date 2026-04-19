import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#fbbf24',
      light: '#fcd34d',
      dark: '#d97706',
      contrastText: '#1a1a1a',
    },
    secondary: {
      main: '#d97706',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    status: {
      applied: '#64748b',
      phoneScreen: '#0ea5e9',
      technical: '#8b5cf6',
      onsite: '#f59e0b',
      offer: '#10b981',
      accepted: '#059669',
      rejected: '#ef4444',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
