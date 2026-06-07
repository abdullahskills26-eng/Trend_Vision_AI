import React, { useMemo } from 'react';

interface HeatmapEntry {
  date: string;
  count: number;
}

interface HeatmapCalendarProps {
  data: HeatmapEntry[];
}

export default function HeatmapCalendar({ data }: HeatmapCalendarProps) {
  const { grid, maxCount, months } = useMemo(() => {
    // Generate last 90 days grid
    const today = new Date();
    const days = [];
    const dateMap = new Map(data.map(d => [d.date, d.count]));
    
    let currentMax = 0;
    
    for (let i = 89; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      const count = dateMap.get(dateStr) || 0;
      if (count > currentMax) currentMax = count;
      
      days.push({
        date: dateStr,
        dateObj: d,
        count
      });
    }

    // Map to weeks (cols) x days (rows)
    // 90 days = ~13 weeks
    const weeks: any[][] = [];
    let currentWeek: any[] = [];
    
    // Fill first week to start on correct day
    const firstDayIndex = days[0].dateObj.getDay(); // 0 = Sunday
    for (let i = 0; i < firstDayIndex; i++) {
      currentWeek.push(null);
    }

    days.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeks.push(currentWeek);
    }

    // Extract month labels
    const monthLabels: { label: string, colIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, i) => {
      const validDay = week.find(d => d !== null);
      if (validDay) {
        const m = validDay.dateObj.getMonth();
        if (m !== lastMonth) {
          monthLabels.push({
            label: validDay.dateObj.toLocaleString('default', { month: 'short' }),
            colIndex: i
          });
          lastMonth = m;
        }
      }
    });

    return { grid: weeks, maxCount: currentMax, months: monthLabels };
  }, [data]);

  const getColor = (count: number) => {
    if (count === 0) return 'bg-[var(--bg-elevated)] border border-[var(--bg-border)]/50';
    if (maxCount === 0) return 'bg-[var(--bg-elevated)] border border-[var(--bg-border)]/50';
    
    const intensity = count / maxCount;
    if (intensity < 0.25) return 'bg-sky-500/20 border border-sky-500/30';
    if (intensity < 0.5) return 'bg-sky-500/40 border border-sky-500/50';
    if (intensity < 0.75) return 'bg-sky-500/70 border border-sky-500/70';
    return 'bg-sky-500 border border-sky-600 shadow-[0_0_8px_rgba(14,165,233,0.5)]';
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="min-w-[600px] flex flex-col">
        {/* Months Row */}
        <div className="flex text-[10px] text-[var(--text-muted)] font-medium mb-1 pl-6 relative h-4">
          {months.map((m, idx) => (
            <span key={idx} className="absolute" style={{ left: `${(m.colIndex / grid.length) * 100}%` }}>
              {m.label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1 pl-6 relative">
          {/* Day Labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[9px] text-[var(--text-muted)] font-medium py-1">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {grid.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.map((day, dIdx) => (
                <div
                  key={`${wIdx}-${dIdx}`}
                  className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${day ? getColor(day.count) : 'opacity-0'}`}
                  title={day ? `${day.count} predictions on ${day.date}` : undefined}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-[var(--text-muted)] font-medium">
          <span>Less</span>
          <div className={`w-3 h-3 rounded-sm ${getColor(0)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColor(maxCount * 0.2)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColor(maxCount * 0.4)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColor(maxCount * 0.7)}`} />
          <div className={`w-3 h-3 rounded-sm ${getColor(maxCount)}`} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
