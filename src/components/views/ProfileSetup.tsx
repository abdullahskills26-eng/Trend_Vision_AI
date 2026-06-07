import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, Trophy, Sparkles, Sun, Moon, TrendingUp, Target } from 'lucide-react';
import Card from '../ui/Card';
import { AVATAR_PRESETS } from '../../utils/constants';
import { updateProfile, fetchPredictions } from '../../services/api';
import ProjectionChart from '../charts/ProjectionChart';
import ModelLeaderboard from '../charts/ModelLeaderboard';
import type { UserProfile, ThemeName, DashboardStats, TrendPrediction } from '../../types';

interface ProfileSetupProps {
  user: UserProfile;
  stats: DashboardStats | null;
  theme: ThemeName;
  onThemeToggle: (theme: ThemeName) => void;
  onUserUpdate: (user: UserProfile) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ProfileSetup({ user, stats, theme, onThemeToggle, onUserUpdate, onToast }: ProfileSetupProps) {
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.profilePicture);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TrendPrediction[]>([]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await fetchPredictions();
        setHistory(data.predictions);
      } catch (err) {
        console.error('Failed to fetch predictions for profile chart', err);
      }
    }
    loadHistory();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await updateProfile({ username, profilePicture: avatar });
      onUserUpdate(res.user);
      onToast('Profile saved successfully! ✅', 'success');
    } catch (err: any) {
      onToast(err.message || 'Failed to save profile. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleThemeSelect = (selectedTheme: ThemeName) => {
    onThemeToggle(selectedTheme);
    onToast(`Theme changed to ${selectedTheme}`, 'info');
  };

  // Prepare confidence chart data (oldest to newest for the trend line)
  // Use 'month' key so ProjectionChart auto-detects the correct x-axis
  const confidenceData = [...history].reverse().slice(-15).map((p, i) => ({
    month: `P${i + 1}`,
    value: p.confidence
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: User Card & Stats */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6 text-center">
          <div className="relative inline-block mb-4">
            <img
              src={avatar || AVATAR_PRESETS[0]}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-2xl bg-[var(--bg-elevated)] p-2 border-2 border-[var(--color-brand-primary)]/50 object-cover shadow-lg mx-auto"
            />
            <span className="absolute -bottom-2 -right-2 bg-[var(--color-brand-primary)] text-white p-1 rounded-lg text-[10px] font-mono leading-none border border-[var(--bg-surface)] flex items-center gap-1 shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-3 h-3" /> Verified
            </span>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{user.username}</h3>
          <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{user.email}</p>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--bg-border)]">
            <div className="p-3 rounded-xl bg-orange-500/10">
              <span className="block text-[10px] font-mono text-[var(--text-muted)] uppercase">Streak</span>
              <span className="text-xl font-extrabold text-orange-400 font-sans mt-1">
                🔥 {stats?.streak || user.streak || 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10">
              <span className="block text-[10px] font-mono text-[var(--text-muted)] uppercase">Forecasts</span>
              <span className="text-xl font-extrabold text-indigo-400 font-sans mt-1">
                📊 {stats?.predictionCount || user.predictionCount || 0}
              </span>
            </div>
          </div>
        </Card>

        {/* Badges Card */}
        <Card className="p-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Earned Badges
          </h4>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {(stats?.badges || user.badges || []).map(badge => (
              <div key={badge} className="p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--bg-border)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-primary)]/20 flex items-center justify-center text-sm font-bold text-[var(--color-brand-primary)]">
                  ★
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-[var(--text-primary)]">{badge}</h5>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase">Unlocked Award</span>
                </div>
              </div>
            ))}
            {!(stats?.badges || user.badges)?.length && (
              <p className="text-xs text-[var(--text-muted)] italic text-center py-4">No badges yet. Start forecasting!</p>
            )}
          </div>
        </Card>
      </div>

      {/* Right Column: Settings */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Confidence Trend Line */}
          <Card className="p-6">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Confidence Trend
            </h4>
            {confidenceData.length > 0 ? (
              <ProjectionChart data={confidenceData} dataKey="value" color="#10B981" domain={[0, 100]} />
            ) : (
              <div className="h-[200px] flex items-center justify-center text-xs text-[var(--text-muted)]">
                Not enough data yet
              </div>
            )}
          </Card>

          {/* Model Leaderboard */}
          <Card className="p-6">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-rose-400" />
              Model Leaderboard
            </h4>
            <ModelLeaderboard data={stats?.modelUsage || []} />
          </Card>
        </div>

        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-6 flex items-center gap-2 text-[var(--text-primary)]">
            <Sparkles className="w-5 h-5 text-[var(--color-brand-primary)]" /> Profile Customization
          </h4>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 font-mono uppercase tracking-wide">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl pl-11 pr-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition"
                />
              </div>
            </div>

            {/* Avatar Grid */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 font-mono uppercase tracking-wide">
                Select Avatar
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                {AVATAR_PRESETS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`p-1.5 rounded-xl border-2 transition-all cursor-pointer bg-[var(--bg-elevated)]
                      ${avatar === preset
                        ? 'border-[var(--color-brand-primary)] scale-110 shadow-lg shadow-sky-500/20'
                        : 'border-[var(--bg-border)] hover:border-[var(--color-brand-primary)]/50'
                      }`}
                  >
                    <img src={preset} alt="Avatar option" className="w-full h-10 object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector - Visual Swatches */}
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-2 font-mono uppercase tracking-wide">
                Color Theme
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Dark Swatch */}
                <button
                  type="button"
                  onClick={() => handleThemeSelect('dark')}
                  className={`p-4 rounded-xl text-left border cursor-pointer transition-all
                    ${theme === 'dark'
                      ? 'border-[var(--color-brand-primary)] shadow-lg shadow-sky-500/10'
                      : 'border-[var(--bg-border)] hover:border-[var(--text-muted)]'
                    } bg-[#0A0F1E]`}
                >
                  <Moon className="w-5 h-5 text-indigo-400 mb-2" />
                  <span className="block text-sm font-bold text-[#F1F5F9]">Deep Ocean</span>
                  <span className="text-xs text-[#94A3B8]">Default dark mode</span>
                </button>

                {/* Light Swatch */}
                <button
                  type="button"
                  onClick={() => handleThemeSelect('light')}
                  className={`p-4 rounded-xl text-left border cursor-pointer transition-all
                    ${theme === 'light'
                      ? 'border-[var(--color-brand-primary)] shadow-lg shadow-sky-500/10'
                      : 'border-[var(--bg-border)] hover:border-[var(--text-muted)]'
                    } bg-[#F0F4FF]`}
                >
                  <Sun className="w-5 h-5 text-amber-500 mb-2" />
                  <span className="block text-sm font-bold text-[#0A0F1E]">Daylight</span>
                  <span className="text-xs text-[#64748B]">Clean light mode</span>
                </button>

                {/* Gradient Swatch */}
                <button
                  type="button"
                  onClick={() => handleThemeSelect('gradient')}
                  className={`p-4 rounded-xl text-left border cursor-pointer transition-all
                    ${theme === 'gradient'
                      ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'border-[var(--bg-border)] hover:border-[var(--text-muted)]'
                    } bg-gradient-to-br from-[#0A0F1E] to-[#1e1b4b]`}
                >
                  <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
                  <span className="block text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">Cosmic</span>
                  <span className="text-xs text-purple-200/70">Vibrant gradient</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--bg-border)]">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[var(--color-brand-primary)] hover:brightness-110 text-white font-bold text-sm rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
