import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

interface CategoryPieProps {
  data: { name: string; count: number }[];
}

export default function CategoryPie({ data }: CategoryPieProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[220px] flex flex-col items-center justify-center text-center">
        <span className="text-3xl mb-2">📊</span>
        <p className="text-xs text-[var(--text-muted)]">No category data to display yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4">
      <div className="w-full sm:w-1/2 h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={75}
              innerRadius={50}
              paddingAngle={4}
              strokeWidth={0}
              isAnimationActive={true}
              animationBegin={200}
              animationDuration={900}
            >
              {data.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--bg-elevated)',
                borderColor: 'var(--bg-border)',
                borderRadius: '0.75rem',
                fontSize: '12px',
                color: 'var(--text-primary)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full sm:w-1/2 space-y-2">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />
              <span className="text-[var(--text-secondary)]">{entry.name}</span>
            </div>
            <span className="font-mono font-medium text-[var(--text-muted)]">{entry.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
