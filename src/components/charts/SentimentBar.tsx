interface SentimentBarProps {
  rising: number;
  falling: number;
  stable: number;
}

export default function SentimentBar({ rising, falling, stable }: SentimentBarProps) {
  const total = rising + falling + stable;
  if (total === 0) {
    return (
      <div className="p-4 text-center text-sm text-[var(--text-muted)]">
        No predictions yet to show sentiment
      </div>
    );
  }

  const risingPct = Math.round((rising / total) * 100);
  const fallingPct = Math.round((falling / total) * 100);
  const stablePct = 100 - risingPct - fallingPct;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-[var(--text-primary)]">Market Sentiment</span>
        <span className="text-xs font-medium text-emerald-400">{risingPct}% Bullish</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden flex bg-[var(--bg-elevated)]">
        {risingPct > 0 && (
          <div
            className="h-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${risingPct}%` }}
            title={`Rising: ${risingPct}%`}
          />
        )}
        {stablePct > 0 && (
          <div
            className="h-full bg-amber-500 transition-all duration-700"
            style={{ width: `${stablePct}%` }}
            title={`Stable: ${stablePct}%`}
          />
        )}
        {fallingPct > 0 && (
          <div
            className="h-full bg-rose-500 transition-all duration-700"
            style={{ width: `${fallingPct}%` }}
            title={`Falling: ${fallingPct}%`}
          />
        )}
      </div>
      <div className="flex items-center justify-between mt-2 text-[10px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Rising ({rising})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
          Stable ({stable})
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
          Falling ({falling})
        </span>
      </div>
    </div>
  );
}
