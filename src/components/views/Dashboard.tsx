import { useEffect, useState } from 'react';
import { ArrowUpRight, Award, Zap, BarChart3, TrendingUp, Clock, Activity, Target } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import SentimentBar from '../charts/SentimentBar';
import CategoryPie from '../charts/CategoryPie';
import HeatmapCalendar from '../charts/HeatmapCalendar';
import ModelLeaderboard from '../charts/ModelLeaderboard';
import { fetchDashboardStats, fetchPredictions, fetchHeatmap } from '../../services/api';
import { getGreeting, formatRelativeDate } from '../../utils/formatting';
import { SUGGESTED_TOPICS } from '../../utils/constants';
import type { ViewName, TrendPrediction, DashboardStats } from '../../types';

interface DashboardProps {
  token: string;
  username: string;
  onNavigate: (view: ViewName) => void;
  onPrefill: (term: string) => void;
}

export default function Dashboard({ token, username, onNavigate, onPrefill }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPredictions, setRecentPredictions] = useState<TrendPrediction[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, predData, heatData] = await Promise.all([
          fetchDashboardStats(),
          fetchPredictions(),
          fetchHeatmap(),
        ]);
        setStats(statsData);
        setRecentPredictions(predData.predictions.slice(0, 5));
        setHeatmapData(heatData.heatmap);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[var(--text-muted)]">Loading your dashboard...</p>
      </div>
    );
  }

  const avgConfidence = recentPredictions.length > 0
    ? Math.round(recentPredictions.reduce((sum, p) => sum + p.confidence, 0) / recentPredictions.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="p-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-full bg-gradient-to-l from-sky-500/10 via-indigo-500/5 to-transparent rounded-r-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
              👋 {getGreeting()}, {username}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              Here's your market intelligence today
            </p>
          </div>
          <button
            onClick={() => onNavigate('predictor')}
            className="self-start md:self-auto bg-[var(--color-brand-primary)] hover:brightness-110 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/20"
          >
            Run New Prediction
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Total Forecasts</p>
            <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">{stats?.predictionCount || 0}</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Avg Confidence</p>
            <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">{avgConfidence}%</h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Streak</p>
            <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">
              🔥 {stats?.streak || 0} <span className="text-xs font-normal text-[var(--text-muted)]">days</span>
            </h3>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wide">Badges Earned</p>
            <h3 className="text-2xl font-extrabold text-[var(--text-primary)]">🏆 {stats?.badges?.length || 0}</h3>
          </div>
        </Card>
      </div>

      {/* Heatmap Row */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          90-Day Activity Heatmap
        </h4>
        <HeatmapCalendar data={heatmapData} />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Leaderboard */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Target className="w-4 h-4 text-rose-400" />
            Model Leaderboard
          </h4>
          <ModelLeaderboard data={stats?.modelUsage || []} />
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            📊 Category Breakdown
          </h4>
          <CategoryPie data={stats?.categorySplit || []} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Forecasts */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--color-brand-primary)]" />
            Recent Forecasts
          </h4>
          {recentPredictions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--text-muted)]">No forecasts yet. Start predicting!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPredictions.map(pred => (
                <div key={pred.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--bg-border)]/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{pred.query}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{formatRelativeDate(pred.createdAt)}</p>
                  </div>
                  <Badge direction={pred.direction} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Sentiment Bar */}
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            🧭 Global Sentiment
          </h4>
          <SentimentBar
            rising={stats?.directionStats?.rising || 0}
            falling={stats?.directionStats?.falling || 0}
            stable={stats?.directionStats?.stable || 0}
          />
        </Card>
      </div>

      {/* Suggested Topics */}
      <Card className="p-5">
        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
          🔥 Suggested Topics
        </h4>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => { onPrefill(topic); onNavigate('predictor'); }}
              className="px-4 py-2 bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] text-xs font-medium rounded-lg hover:bg-[var(--color-brand-primary)]/20 border border-[var(--color-brand-primary)]/10 transition cursor-pointer active:scale-95"
            >
              {topic}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
