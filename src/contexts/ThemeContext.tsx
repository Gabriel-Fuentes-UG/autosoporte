'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleDarkMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export function ThemeContextProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Cargar preferencia guardada
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      setDarkMode(saved === 'true');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: darkMode ? '#42a5f5' : '#2c3e50',
        light: darkMode ? '#64b5f6' : '#34495e',
        dark: darkMode ? '#1976d2' : '#1a252f',
      },
      secondary: {
        main: darkMode ? '#ab47bc' : '#3498db',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f7fa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#2c3e50',
        secondary: darkMode ? '#b0b0b0' : '#7f8c8d',
      },
      error: {
        main: '#e74c3c',
      },
      warning: {
        main: '#f39c12',
      },
      info: {
        main: '#3498db',
      },
      success: {
        main: '#27ae60',
      },
      divider: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    },
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(darkMode && {
              backgroundColor: '#1e1e1e',
              borderRadius: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }),
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            ...(darkMode && {
              backgroundColor: '#252525',
              borderRadius: 0,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            }),
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 0,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            ...(darkMode && {
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }),
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
