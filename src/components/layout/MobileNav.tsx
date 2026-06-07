import { BarChart3, Sparkles, Database, UserCircle, Star } from 'lucide-react';
import type { ViewName } from '../../types';

interface MobileNavProps {
  currentView: ViewName;
  onNavigate: (view: ViewName) => void;
}

const NAV_ITEMS: { id: ViewName; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Home',    icon: BarChart3 },
  { id: 'predictor', label: 'Predict', icon: Sparkles },
  { id: 'archive',   label: 'Archive', icon: Database },
  { id: 'watchlist', label: 'Watch',   icon: Star },
  { id: 'profile',   label: 'Profile', icon: UserCircle },
];

export default function MobileNav({ currentView, onNavigate }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--bg-border)] safe-area-bottom">
      <div className="flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer min-w-[64px]
                ${isActive
                  ? 'text-[var(--color-brand-primary)]'
                  : 'text-[var(--text-muted)]'
                }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
