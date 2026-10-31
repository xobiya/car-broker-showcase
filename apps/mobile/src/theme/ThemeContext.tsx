import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ActiveTheme = 'light' | 'dark';

export const lightColors = {
  primary: '#FF5003',
  primaryLight: '#FFF2EB',
  primaryDark: '#E04200',
  ink: '#121217',
  muted: '#878E99',
  green: '#10B981',
  greenDark: '#059669',
  mint: '#EAF8F1',
  paper: '#FAFAFC',
  white: '#FFFFFF',
  line: '#ECEEF2',
  card: '#FFFFFF',
  cardBorder: '#ECEEF2',
  orange: '#FF5003',
  orangeLight: '#FFF2EB',
  red: '#FF4D4F',
  success: '#10B981',
  warning: '#FF9800',
  info: '#3B82F6',
  navy: '#121217',
  navySoft: '#FFFFFF',
  black: '#000000',
};

export const darkColors = {
  primary: '#FF5003',
  primaryLight: '#2C1B14',
  primaryDark: '#FF6A26',
  ink: '#F4F5F7',
  muted: '#9DA3AE',
  green: '#10B981',
  greenDark: '#059669',
  mint: '#152E22',
  paper: '#0F1117',
  white: '#1A1D26',
  line: '#282C37',
  card: '#1A1D26',
  cardBorder: '#282C37',
  orange: '#FF5003',
  orangeLight: '#2C1B14',
  red: '#FF5252',
  success: '#10B981',
  warning: '#FFB74D',
  info: '#60A5FA',
  navy: '#0F1117',
  navySoft: '#1A1D26',
  black: '#000000',
};

export type ThemeColors = typeof lightColors;

interface ThemeContextType {
  themeMode: ThemeMode;
  activeTheme: ActiveTheme;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const THEME_STORAGE_KEY = 'arif_theme_mode';
let memoryTheme: ThemeMode = 'system';

const ThemeContext = createContext<ThemeContextType>({
  themeMode: 'system',
  activeTheme: 'light',
  isDark: false,
  colors: lightColors,
  setThemeMode: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    async function loadTheme() {
      try {
        let stored: string | null = null;
        if (Platform.OS === 'web') {
          if (typeof window !== 'undefined' && window.localStorage) {
            stored = window.localStorage.getItem(THEME_STORAGE_KEY);
          } else {
            stored = memoryTheme;
          }
        } else {
          stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        }
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setThemeModeState(stored);
        }
      } catch {
        // Fallback to system
      }
    }
    void loadTheme();
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(THEME_STORAGE_KEY, mode);
        }
        memoryTheme = mode;
      } else {
        await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const activeTheme: ActiveTheme = useMemo(() => {
    if (themeMode === 'light') return 'light';
    if (themeMode === 'dark') return 'dark';
    return systemColorScheme === 'dark' ? 'dark' : 'light';
  }, [themeMode, systemColorScheme]);

  const isDark = activeTheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  const value = useMemo(
    () => ({
      themeMode,
      activeTheme,
      isDark,
      colors,
      setThemeMode,
    }),
    [themeMode, activeTheme, isDark, colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
