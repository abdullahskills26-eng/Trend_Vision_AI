import { useState, useCallback } from 'react';
import type { ViewName } from '../types';

export function useAppState() {
  // ✅ Navigation state is ISOLATED — never reset by data operations.
  // Persist the selected view through transient remounts or local reloads.
  const initialView = typeof window !== 'undefined'
    ? (sessionStorage.getItem('trendvision_view') as ViewName | null) ?? 'dashboard'
    : 'dashboard';

  const [currentView, setCurrentView] = useState<ViewName>(initialView);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useCallback((view: ViewName) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('trendvision_view', view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return { currentView, navigate, isLoading, setIsLoading };
}
