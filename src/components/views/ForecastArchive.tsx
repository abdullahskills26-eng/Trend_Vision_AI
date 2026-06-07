import { useState, useEffect } from 'react';
import { Search, Trash2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ConfidenceBar from '../ui/ConfidenceBar';
import ProjectionChart from '../charts/ProjectionChart';
import { fetchPredictions, deletePrediction } from '../../services/api';
import { formatRelativeDate } from '../../utils/formatting';
import { DOMAIN_CATEGORIES } from '../../utils/constants';
import type { TrendPrediction } from '../../types';

interface ForecastArchiveProps {
  token: string;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export default function ForecastArchive({ token, onToast }: ForecastArchiveProps) {
  const [history, setHistory] = useState<TrendPrediction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await fetchPredictions(selectedCategory, searchTerm, page, 10);
      setHistory(data.predictions);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to fetch archive:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search input to avoid redundant API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    loadHistory();
  }, [token, selectedCategory, searchTerm, page]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this forecast? This cannot be undone.')) return;

    try {
      await deletePrediction(id);
      setHistory(prev => prev.filter(p => p.id !== id));
      setTotal(t => Math.max(0, t - 1));
      if (expandedId === id) setExpandedId(null);
      onToast('Forecast deleted', 'info');
      // ✅ NO navigation — user stays on archive page
    } catch (err) {
      onToast('Failed to delete forecast', 'error');
    }
  };

  const getDomainIcon = (category: string) => {
    const domain = DOMAIN_CATEGORIES.find(d => d.id.toLowerCase() === category.toLowerCase());
    return domain?.icon || '📊';
  };

  const filterCategories = ['all', ...DOMAIN_CATEGORIES.map(d => d.id)];

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">📚 Forecast Archive</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Browse and manage your saved predictions</p>
      </div>

      {/* Search + Filters */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search your forecasts..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition placeholder-[var(--text-muted)]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            {filterCategories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition
                  ${selectedCategory === cat
                    ? 'bg-[var(--color-brand-primary)] text-white shadow-sm'
                    : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--bg-border)]'
                  }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-[var(--color-brand-primary)] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm text-[var(--text-muted)]">Loading forecasts...</p>
          </div>
        ) : history.length === 0 ? (
          <Card className="p-10 text-center">
            <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No forecasts found</h4>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter to find what you\'re looking for.'
                : 'Run your first prediction to see it here!'}
            </p>
          </Card>
        ) : (
          history.map(pred => {
            const isExpanded = expandedId === pred.id;
            return (
              <Card
                key={pred.id}
                className="p-5 cursor-pointer"
                hover
                onClick={() => setExpandedId(isExpanded ? null : pred.id)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="text-2xl shrink-0">{getDomainIcon(pred.category)}</span>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[var(--text-primary)] truncate">{pred.query}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] text-[var(--text-muted)]">{formatRelativeDate(pred.createdAt)}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">•</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{pred.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge direction={pred.direction} />
                    <button
                      onClick={(e) => handleDelete(pred.id, e)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                  </div>
                </div>

                {/* Expanded Drawer */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-[var(--bg-border)] grid grid-cols-1 md:grid-cols-2 gap-5" onClick={(e) => e.stopPropagation()}>
                    <div>
                      <h5 className="text-xs font-bold text-[var(--text-primary)] mb-2">12-Month Projection</h5>
                      <ProjectionChart data={pred.forecastData} dataKey="value" color="#0EA5E9" height={160} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-[var(--text-primary)] mb-2">Summary</h5>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-3">{pred.summary}</p>
                      <ConfidenceBar value={pred.confidence} />
                      <div className="mt-3 space-y-1.5">
                        {pred.insights.slice(0, 3).map((ins, i) => (
                          <div key={i} className="text-xs text-[var(--text-muted)] flex gap-2">
                            <span className="text-[var(--color-brand-primary)]">•</span>
                            <p>{ins}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between mt-6 bg-[var(--bg-elevated)] p-4 rounded-xl border border-[var(--bg-border)]">
          <p className="text-sm text-[var(--text-muted)]">
            Showing <span className="font-semibold text-[var(--text-primary)]">{(page - 1) * 10 + 1}</span> to <span className="font-semibold text-[var(--text-primary)]">{Math.min(page * 10, total)}</span> of <span className="font-semibold text-[var(--text-primary)]">{total}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[var(--text-primary)] hover:bg-[var(--bg-border)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border border-[var(--color-brand-primary)]/20">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-[var(--bg-surface)] border border-[var(--bg-border)] text-[var(--text-primary)] hover:bg-[var(--bg-border)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
