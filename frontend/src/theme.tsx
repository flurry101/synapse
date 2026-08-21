import { createTheme } from '@mui/material/styles'

// Dark chalkboard theme for Synapse AI Hub
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#090d16',
      paper: '#111622',
    },
    primary: {
      light: '#e9d5ff',
      main: '#c084fc',
      dark: '#9333ea',
      contrastText: '#0f172a',
    },
    secondary: {
      light: '#7dd3fc',
      main: '#38bdf8',
      dark: '#0284c7',
      contrastText: '#0f172a',
    },
    success: {
      light: '#86efac',
      main: '#4ade80',
      dark: '#16a34a',
      contrastText: '#052e16',
    },
    warning: {
      light: '#fef08a',
      main: '#fde047',
      dark: '#ca8a04',
      contrastText: '#1c1917',
    },
    error: {
      light: '#fca5a5',
      main: '#f87171',
      dark: '#dc2626',
      contrastText: '#450a0a',
    },
    info: {
      light: '#93c5fd',
      main: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#0f172a',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: '#1e293b',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800, letterSpacing: '-0.03em' },
    h2: { fontWeight: 800, letterSpacing: '-0.025em' },
    h3: { fontWeight: 800, letterSpacing: '-0.02em' },
    h4: { fontWeight: 800, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#090d16',
          color: '#f8fafc',
          scrollbarColor: '#334155 #090d16',
          '&::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#090d16',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#334155',
            borderRadius: 4,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111622',
          border: '1px solid #1e293b',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#111622',
          border: '1px solid #1e293b',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:focus-visible': {
            outline: '2px solid #38bdf8',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#0d121c',
          '& fieldset': {
            borderColor: '#1e293b',
          },
          '&:hover fieldset': {
            borderColor: '#38bdf8',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#38bdf8',
            borderWidth: 2,
          },
        },
        input: {
          color: '#f8fafc',
          '&::placeholder': {
            color: '#64748b',
            opacity: 1,
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#94a3b8',
          '&.Mui-focused': {
            color: '#38bdf8',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#1e293b',
          color: '#f8fafc',
        },
        head: {
          fontWeight: 700,
          backgroundColor: '#0e1422',
          color: '#94a3b8',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#111622',
          border: '1px solid #2a3b54',
          borderRadius: 16,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#1e293b',
        },
      },
    },
  },
})

export default theme
