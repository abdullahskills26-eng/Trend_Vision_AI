interface ConfidenceBarProps {
  value: number;
}

export default function ConfidenceBar({ value }: ConfidenceBarProps) {
  const getLabel = (v: number) => {
    if (v >= 80) return { text: 'Very High Confidence', color: '#10B981' };
    if (v >= 60) return { text: 'High Confidence',      color: '#0EA5E9' };
    if (v >= 40) return { text: 'Moderate Confidence',   color: '#F59E0B' };
    return            { text: 'Low Confidence',          color: '#EF4444' };
  };

  const { text, color } = getLabel(value);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-[var(--text-secondary)]">{text}</span>
        <span className="text-xs font-bold text-[var(--text-primary)]">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
