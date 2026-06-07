import { useState, useCallback } from 'react';
import type { ThemeName } from '../types';
import { updateProfile } from '../services/api';

export function useTheme(initialTheme: ThemeName = 'dark') {
  const [theme, setTheme] = useState<ThemeName>(initialTheme);

  const changeTheme = useCallback(async (newTheme: ThemeName, token?: string | null) => {
    setTheme(newTheme);
    // Persist to server if authenticated
    if (token) {
      try {
        await updateProfile({ themePreference: newTheme });
      } catch (err) {
        console.error('Theme sync failed:', err);
      }
    }
  }, []);

  return { theme, setTheme, changeTheme };
}
