import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ZAxis
} from 'recharts';
// Accept any array so recharts generics and typed interfaces both work seamlessly
interface ProjectionChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  dataKey: string;
  color?: string;
  type?: 'line' | 'area' | 'bar' | 'scatter';
  domain?: [number, number];
  height?: number;
}

export default function ProjectionChart({
  data,
  dataKey,
  color = '#0EA5E9',
  type = 'line',
  domain = [0, 120],
  height = 240,
}: ProjectionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-(--text-muted)" style={{ height }}>
        No data available
      </div>
    );
  }

  const xKey = 'month' in data[0] ? 'month' : 'year';

  const tooltipStyle = {
    background: 'var(--bg-elevated)',
    borderColor: 'var(--bg-border)',
    borderRadius: '0.75rem',
    fontSize: '11px',
    color: 'var(--text-primary)',
  };

  const commonProps = {
    data,
    margin: { top: 10, right: 10, left: -20, bottom: 0 }
  };

  const commonAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" opacity={0.3} />
      <XAxis dataKey={xKey} stroke="var(--text-muted)" fontSize={10} tickLine={false} />
      <YAxis dataKey={dataKey} stroke="var(--text-muted)" fontSize={10} domain={domain} tickLine={false} />
      <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--bg-elevated)', opacity: 0.4 }} />
    </>
  );

  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {commonAxes}
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#gradient-${color.replace('#', '')})`}
              isAnimationActive={true}
              animationDuration={1400}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart {...commonProps}>
            {commonAxes}
            <Bar 
              dataKey={dataKey} 
              fill={color} 
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
              animationDuration={1200}
            />
          </BarChart>
        );
      case 'scatter':
        return (
          <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" opacity={0.3} />
            <XAxis dataKey={xKey} name={xKey} stroke="var(--text-muted)" fontSize={10} tickLine={false} type="category" />
            <YAxis dataKey={dataKey} name="Value" stroke="var(--text-muted)" fontSize={10} domain={domain} tickLine={false} type="number" />
            <ZAxis range={[60, 400]} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter 
              name="Values" 
              data={data as any[]} 
              fill={color} 
              isAnimationActive={true}
              animationDuration={1200}
            />
          </ScatterChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...commonProps}>
            {commonAxes}
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={3} 
              dot={{ r: 3, fill: color, strokeWidth: 2, stroke: 'var(--bg-base)' }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </LineChart>
        );
    }
  };

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
