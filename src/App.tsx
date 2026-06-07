import React, { useState, useEffect, useCallback } from 'react';
import AuthScreen from './components/AuthScreen';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import Dashboard from './components/views/Dashboard';
import AIPredictor from './components/views/AIPredictor';
import ForecastArchive from './components/views/ForecastArchive';
import ProfileSetup from './components/views/ProfileSetup';
import Watchlist from './components/views/Watchlist';
import ToastContainer from './components/ui/Toast';

import { useAppState } from './hooks/useAppState';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import { fetchCurrentUser, fetchDashboardStats } from './services/api';
import type { UserProfile, DashboardStats, ViewName } from './types';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('trendvision_token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem('trendvision_user');
    return stored ? JSON.parse(stored) as UserProfile : null;
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [dashboardPrefill, setDashboardPrefill] = useState('');

  // Stable callbacks so child useEffects that depend on these never re-fire spuriously
  const clearPrefill = useCallback(() => setDashboardPrefill(''), []);
  const handlePrefill = useCallback((term: string) => setDashboardPrefill(term), []);

  // Custom Hooks
  const { currentView, navigate } = useAppState();
  const { theme, setTheme, changeTheme } = useTheme('dark');
  const { toasts, showToast, dismissToast } = useToast();

  // ─── Stable navigate handler wrapped in useCallback ───────────────────────
  // This ensures the navigate reference passed to children is stable and does
  // not trigger useEffect re-runs in child components.
  const stableNavigate = useCallback((view: ViewName) => {
    navigate(view);
  }, [navigate]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('trendvision_token');
    localStorage.removeItem('trendvision_user');
    setToken(null);
    setUser(null);
    // No navigate('dashboard') needed — setting token/user to null
    // causes App to render <AuthScreen>, and handleAuthSuccess sets
    // the view to 'dashboard' on next login.
  }, []);

  // Initial Authentication Check
  useEffect(() => {
    // Ignore flag prevents state updates after cleanup (React StrictMode
    // double-fires effects in dev, which can race two fetches).
    let ignore = false;
    async function initAuth() {
      if (!token) {
        setAppLoading(false);
        return;
      }
      try {
        const { user: userData } = await fetchCurrentUser();
        if (ignore) return;
        setUser(userData);
        localStorage.setItem('trendvision_user', JSON.stringify(userData));
        if (userData.themePreference) {
          setTheme(userData.themePreference);
        }
        const statsData = await fetchDashboardStats();
        if (ignore) return;
        setStats(statsData);
      } catch (err) {
        console.error('Auth check failed:', err);
        if (!ignore) handleLogout();
      } finally {
        if (!ignore) setAppLoading(false);
      }
    }
    initAuth();
    return () => { ignore = true; };
    // handleLogout and setTheme are referentially stable (useCallback/useState
    // with [] deps). Omitting them prevents spurious re-fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleThemeToggle = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : theme === 'light' ? 'gradient' : 'dark';
    changeTheme(nextTheme, token);
  }, [theme, token, changeTheme]);

  const handleAuthSuccess = useCallback((newToken: string, authenticatedUser: UserProfile) => {
    localStorage.setItem('trendvision_token', newToken);
    localStorage.setItem('trendvision_user', JSON.stringify(authenticatedUser));
    setToken(newToken);
    setUser(authenticatedUser);
    if (authenticatedUser.themePreference) {
      changeTheme(authenticatedUser.themePreference, null);
    }
    navigate('dashboard');
  }, [changeTheme, navigate]);

  // Apply theme attribute — done inside useEffect to prevent blocking and side-effects during render
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (appLoading) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">
          Initializing TrendVision AI...
        </p>
      </div>
    );
  }

  if (!user || !token) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} theme={theme} />;
  }

  return (
    <div className={`app-wrapper theme-${theme} min-h-screen text-(--text-primary) transition-colors duration-300 font-sans pb-20 md:pb-0`}>
      {/* Static background */}
      <div className="fixed inset-0 -z-10 bg-(--bg-base) transition-colors duration-300" />

      {theme !== 'light' && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-brand-primary)] opacity-5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--color-brand-secondary)] opacity-5 blur-[120px]" />
        </div>
      )}

      <Header
        currentView={currentView}
        onNavigate={stableNavigate}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        user={{ username: user.username, profilePicture: user.profilePicture }}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/*
          ┌─────────────────────────────────────────────────────────────────┐
          │  ALL VIEWS ARE PERMANENTLY MOUNTED.                             │
          │  Visibility is controlled by CSS display, NOT conditional       │
          │  rendering. This guarantees:                                    │
          │  • AIPredictor NEVER unmounts → prediction state is never lost  │
          │  • No component re-initialization on navigation                 │
          │  • No state reset from parent re-renders (toast, theme, etc.)   │
          └─────────────────────────────────────────────────────────────────┘
        */}

        <div style={{ display: currentView === 'dashboard' ? 'block' : 'none' }}>
          <Dashboard
            token={token}
            username={user.username}
            onNavigate={stableNavigate}
            onPrefill={handlePrefill}
          />
        </div>

        {/* AIPredictor is always mounted — prediction state is never destroyed */}
        <div style={{ display: currentView === 'predictor' ? 'block' : 'none' }}>
          <AIPredictor
            token={token}
            prefillQuery={dashboardPrefill}
            clearPrefill={clearPrefill}
            onToast={showToast}
            onNavigate={stableNavigate}
          />
        </div>

        <div style={{ display: currentView === 'archive' ? 'block' : 'none' }}>
          <ForecastArchive
            token={token}
            onToast={showToast}
          />
        </div>

        <div style={{ display: currentView === 'watchlist' ? 'block' : 'none' }}>
          <Watchlist
            token={token}
            onToast={showToast}
            onNavigate={stableNavigate}
            onPrefill={handlePrefill}
          />
        </div>

        <div style={{ display: currentView === 'profile' ? 'block' : 'none' }}>
          <ProfileSetup
            user={user}
            stats={stats}
            theme={theme}
            onThemeToggle={(newTheme) => changeTheme(newTheme, token)}
            onUserUpdate={setUser}
            onToast={showToast}
          />
        </div>
      </main>

      <MobileNav currentView={currentView} onNavigate={stableNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
