import React from 'react';
import { Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';

interface ModelLeaderboardProps {
  data: { name: string; value: number; confidence?: number }[];
}

export default function ModelLeaderboard({ data }: ModelLeaderboardProps) {
  // Sort by confidence, then by usage count
  const sortedData = [...data].sort((a, b) => {
    if (b.confidence !== a.confidence) {
      return (b.confidence || 0) - (a.confidence || 0);
    }
    return b.value - a.value;
  });

  const getBarColor = (index: number) => {
    const colors = ['#10B981', '#0EA5E9', '#F59E0B', '#8B5CF6'];
    return colors[index % colors.length];
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[var(--bg-surface)] border border-[var(--bg-border)] p-3 rounded-lg shadow-xl text-sm">
          <p className="font-bold text-[var(--text-primary)] mb-1">{data.name}</p>
          <p className="text-[var(--text-secondary)]">Avg Confidence: <span className="font-semibold text-[var(--text-primary)]">{data.confidence || 0}%</span></p>
          <p className="text-[var(--text-secondary)]">Usage Count: <span className="font-semibold text-[var(--text-primary)]">{data.value}</span></p>
        </div>
      );
    }
    return null;
  };

  if (!sortedData || sortedData.length === 0) {
    return <div className="text-center text-sm text-[var(--text-muted)] py-8">No model data available</div>;
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--bg-border)" opacity={0.3} />
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={11} tickLine={false} width={120} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-elevated)', opacity: 0.5 }} />
          <Bar dataKey="confidence" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={true} animationDuration={1000}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
