import { useState, useEffect } from 'react';
import { LOADING_STAGES } from '../../utils/constants';

export default function PredictionLoader() {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (stageIndex >= LOADING_STAGES.length - 1) return;
    const timer = setTimeout(() => {
      setStageIndex(i => i + 1);
    }, LOADING_STAGES[stageIndex].duration);
    return () => clearTimeout(timer);
  }, [stageIndex]);

  const stage = LOADING_STAGES[stageIndex];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {/* Animated spinner */}
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-[var(--bg-border)] border-t-[var(--color-brand-primary)] rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl animate-pulse">🧠</span>
        </div>
      </div>

      {/* Stage message */}
      <p className="text-lg font-semibold text-[var(--text-primary)] mb-4 transition-all duration-500">
        {stage.message}
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-md h-2.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-secondary)] transition-all duration-800 ease-out"
          style={{ width: `${stage.pct}%` }}
        />
      </div>

      <p className="text-xs text-[var(--text-muted)]">
        This usually takes 5–10 seconds
      </p>
    </div>
  );
}
