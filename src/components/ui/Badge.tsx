import type { Direction } from '../../types';

const DIRECTION_CONFIG = {
  rising:  { icon: '📈', label: 'Rising',  colorClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', desc: 'Expected to grow' },
  falling: { icon: '📉', label: 'Falling', colorClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',    desc: 'Expected to decline' },
  stable:  { icon: '➡️', label: 'Stable',  colorClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30', desc: 'Expected to remain flat' },
};

interface BadgeProps {
  direction: Direction;
  showDescription?: boolean;
}

export default function Badge({ direction, showDescription = false }: BadgeProps) {
  const config = DIRECTION_CONFIG[direction] || DIRECTION_CONFIG.stable;
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${config.colorClass}`}
      title={config.desc}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {showDescription && <span className="opacity-70 text-[10px] ml-1">— {config.desc}</span>}
    </div>
  );
}
