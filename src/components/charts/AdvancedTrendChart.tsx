import React, { useMemo } from 'react';
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Treemap,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import ProjectionChart from './ProjectionChart';
import type { TrendPrediction, ChartType } from '../../types';

interface AdvancedTrendChartProps {
  prediction: TrendPrediction;
  chartType: ChartType;
  height?: number;
}

function buildHistogramData(data: any[]) {
  const values = data.map((item) => item.value ?? item.interest).filter((value) => typeof value === 'number');
  if (!values.length) return [];

  const min = Math.min(...values);
  const max = Math.max(...values);
  const bucketCount = 6;
  const bucketSize = (max - min) / bucketCount || 1;
  const buckets = Array.from({ length: bucketCount }, (_, idx) => ({
    name: `${Math.round(min + idx * bucketSize)}–${Math.round(min + (idx + 1) * bucketSize)}`,
    value: 0,
  }));

  values.forEach((value) => {
    const index = Math.min(Math.floor((value - min) / bucketSize), bucketCount - 1);
    buckets[index].value += 1;
  });

  return buckets;
}

function buildBoxPlotData(data: any[]) {
  const values = data.map((item) => item.value ?? item.interest).filter((value) => typeof value === 'number').sort((a, b) => a - b);
  if (!values.length) return [];

  const quantile = (q: number) => {
    const pos = (values.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (values[base + 1] !== undefined) {
      return values[base] + rest * (values[base + 1] - values[base]);
    }
    return values[base];
  };

  return [
    { name: 'Min', value: values[0] },
    { name: 'Q1', value: quantile(0.25) },
    { name: 'Median', value: quantile(0.5) },
    { name: 'Q3', value: quantile(0.75) },
    { name: 'Max', value: values[values.length - 1] },
  ];
}

function buildRadarData(prediction: TrendPrediction) {
  if (prediction.featureImportance && prediction.featureImportance.length) {
    return prediction.featureImportance.slice(0, 6).map((item) => ({
      feature: item.feature,
      value: Math.round(item.importance * 100),
      fullMark: 100,
    }));
  }

  return prediction.keywords.slice(0, 6).map((item) => ({
    feature: item.word,
    value: Math.min(Math.round(item.weight * 20), 100),
    fullMark: 100,
  }));
}

function buildTreemapData(prediction: TrendPrediction) {
  if (prediction.featureImportance && prediction.featureImportance.length) {
    return prediction.featureImportance.slice(0, 10).map((item) => ({
      name: item.feature,
      size: Math.max(1, Math.round(item.importance * 100)),
    }));
  }

  return prediction.keywords.slice(0, 10).map((item) => ({
    name: item.word,
    size: Math.max(1, Math.round(item.weight * 20)),
  }));
}

function buildHeatmapData(prediction: TrendPrediction) {
  const data: any[] = prediction.forecastData || [];
  return data.map((item, index) => ({
    x: index % 6,
    y: Math.floor(index / 6),
    value: item.value ?? item.interest,
    label: item.month ?? item.year,
  }));
}

const AdvancedTrendChart = ({ prediction, chartType, height = 260 }: AdvancedTrendChartProps) => {
  const histogramData = useMemo(() => buildHistogramData(prediction.forecastData), [prediction.forecastData]);
  const boxPlotData = useMemo(() => buildBoxPlotData(prediction.forecastData), [prediction.forecastData]);
  const radarData = useMemo(() => buildRadarData(prediction), [prediction]);
  const treemapData = useMemo(() => buildTreemapData(prediction), [prediction]);
  const heatmapData = useMemo(() => buildHeatmapData(prediction), [prediction]);
  const confidenceData = useMemo(
    () =>
      prediction.confidenceInterval ??
      prediction.forecastData.map((entry: any) => {
        const value = entry.value ?? entry.interest ?? 0;
        return {
          month: entry.month ?? entry.year,
          lower: entry.confidenceLower ?? Math.max(0, value * 0.9),
          upper: entry.confidenceUpper ?? value * 1.1,
        };
      }),
    [prediction],
  );
  const residualData = useMemo(
    () =>
      prediction.residuals ??
      prediction.forecastData.map((entry: any, idx: number) => {
        const value = entry.value ?? entry.interest ?? 0;
        const previousValue = (prediction.forecastData[idx - 1] as any)?.value ?? (prediction.forecastData[idx - 1] as any)?.interest ?? value;
        return {
          month: entry.month ?? entry.year,
          residual: idx === 0 ? 0 : (value - previousValue) / 2,
        };
      }),
    [prediction],
  );

  const tooltipStyle = {
    background: 'var(--bg-elevated)',
    borderColor: 'var(--bg-border)',
    borderRadius: '0.75rem',
    fontSize: '11px',
    color: 'var(--text-primary)',
  };

  switch (chartType) {
    case 'histogram':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    case 'heatmap':
      return (
        <div style={{ height }} className="p-2">
          <div className="mb-2 text-xs text-[var(--text-muted)]">Heatmap intensity reflects projected strength in each bucket.</div>
          <div className="grid grid-cols-6 gap-1 h-full">
            {heatmapData.map((entry, idx) => {
              const intensity = Math.min(1, Math.max(0, (entry.value ?? 0) / Math.max(...heatmapData.map((d) => d.value || 0), 1)));
              const shade = intensity < 0.25 ? 'bg-sky-500/10' : intensity < 0.5 ? 'bg-sky-500/30' : intensity < 0.75 ? 'bg-sky-500/60' : 'bg-sky-500';
              return (
                <div key={idx} className={`${shade} rounded-lg border border-white/10 flex flex-col justify-center items-center text-[10px] text-[var(--text-primary)]`}>
                  <span className="font-semibold">{entry.label}</span>
                  <span>{Math.round(entry.value ?? 0)}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    case 'box':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={boxPlotData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="#9333EA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    case 'treemap':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={treemapData}
              dataKey="size"
              stroke="#fff"
              fill="#0EA5E9"
              content={<CustomizedTreemapContent />}
            />
          </ResponsiveContainer>
        </div>
      );
    case 'radar':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <PolarGrid stroke="var(--bg-border)" />
              <PolarAngleAxis dataKey="feature" stroke="var(--text-muted)" fontSize={10} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar name="Importance" dataKey="value" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.3} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    case 'confidence':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={confidenceData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" opacity={0.3} />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="upper" stroke="#10B981" fill="#10B981" fillOpacity={0.2} />
              <Area type="monotone" dataKey="lower" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    case 'residual':
      return (
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bg-border)" opacity={0.3} />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={10} tickLine={false} type="category" />
              <YAxis dataKey="residual" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Scatter data={residualData} fill="#EF4444" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      );
    case 'line':
    case 'area':
    case 'bar':
    case 'scatter':
    default:
      return <ProjectionChart data={prediction.forecastData} dataKey="value" color="#0EA5E9" type={chartType === 'line' ? 'line' : chartType === 'area' ? 'area' : chartType === 'bar' ? 'bar' : chartType === 'scatter' ? 'scatter' : 'line'} />;
  }
};

function CustomizedTreemapContent({ root, depth, x, y, width, height, index, colors }: any) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} stroke="#fff" fill={depth < 2 ? '#0EA5E9' : '#38BDF8'} />
      {width > 60 && height > 40 ? (
        <text x={x + 6} y={y + 18} fill="#fff" fontSize={11} fontWeight="600">
          {root.name}
        </text>
      ) : null}
      {width > 60 && height > 56 ? (
        <text x={x + 6} y={y + 34} fill="#fff" fontSize={10}>
          {root.value}
        </text>
      ) : null}
    </g>
  );
}

export default AdvancedTrendChart;
