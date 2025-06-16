'use client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

// Create a minimal theme to prevent hydration issues
const theme = createTheme({
  palette: {
    mode: 'light',
  },
  typography: {
    fontFamily: 'inherit',
  },
  components: {
    // Disable ripple effects and animations that can cause hydration issues
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        // Prevent CssBaseline from interfering with app styles
        body: {
          margin: 0,
          padding: 0,
        },
      },
    },
  },
});

interface ThemeRegistryProps {
  children: ReactNode;
}

export default function ThemeRegistry({ children }: ThemeRegistryProps) {
  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
} 