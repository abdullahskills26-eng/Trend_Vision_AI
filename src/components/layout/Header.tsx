import { BarChart3, Sparkles, LogOut, Sun, Moon } from 'lucide-react';
import type { ViewName, ThemeName } from '../../types';

interface HeaderProps {
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
  theme: ThemeName;
  onThemeToggle: () => void;
  user: { username: string; profilePicture: string } | null;
  onLogout: () => void;
}

const NAV_ITEMS: { id: ViewName; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'predictor', label: 'Predict' },
  { id: 'archive',   label: 'Archive' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'profile',   label: 'Profile' },
];

export default function Header({ currentView, onNavigate, theme, onThemeToggle, user, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-[var(--bg-surface)]/80 backdrop-blur-xl border-b border-[var(--bg-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[var(--text-primary)] leading-none">
              TrendVision AI
            </h1>
            <span className="text-[9px] font-mono text-[var(--text-muted)] leading-none">
              Predictive Analytics
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 relative
                ${currentView === item.id
                  ? 'text-[var(--color-brand-primary)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              {item.label}
              {currentView === item.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[var(--color-brand-primary)] rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-border)] text-[var(--text-secondary)] transition cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* User Info */}
          {user && (
            <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-[var(--bg-border)]">
              <div className="text-right">
                <p className="text-[10px] text-[var(--text-muted)]">Welcome back,</p>
                <p className="text-xs font-bold text-[var(--text-primary)]">{user.username}</p>
              </div>
              <img
                src={user.profilePicture || 'https://api.dicebear.com/7.x/bottts/svg?seed=Trendexplorer'}
                alt="Avatar"
                className="w-9 h-9 rounded-xl bg-[var(--bg-elevated)] border border-[var(--bg-border)] p-0.5 object-cover"
              />
            </div>
          )}

          {/* Logout */}
          <button
            id="logout-button"
            onClick={onLogout}
            className="p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-rose-500/15 text-[var(--text-muted)] hover:text-rose-400 border border-[var(--bg-border)] transition cursor-pointer"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
