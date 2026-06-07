import { useState, useEffect } from 'react';
import { Search, Star, Trash2, ArrowUpRight, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { fetchWatchlist, removeFromWatchlist } from '../../services/api';
import { formatRelativeDate } from '../../utils/formatting';
import { DOMAIN_CATEGORIES } from '../../utils/constants';
import type { ViewName, WatchlistItem } from '../../types';

interface WatchlistProps {
  token: string;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onNavigate: (view: ViewName) => void;
  onPrefill: (term: string) => void;
}

export default function Watchlist({ token, onToast, onNavigate, onPrefill }: WatchlistProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchWatchlist();
        setItems(res.watchlist);
      } catch (err) {
        onToast('Failed to load watchlist', 'error');
      } finally {
        setLoading(false);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleDelete = async (id: string) => {
    try {
      await removeFromWatchlist(id);
      setItems(prev => prev.filter(w => w.id !== id));
      onToast('Removed from watchlist', 'info');
    } catch (err) {
      onToast('Failed to remove item', 'error');
    }
  };

  const handleReanalyze = (query: string) => {
    onPrefill(query);
    onNavigate('predictor');
  };

  const filteredItems = items.filter(item => 
    item.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          <Star className="w-6 h-6 inline mr-2 text-amber-400" />
          Smart Watchlist
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Track important trends and quickly re-analyze them</p>
      </div>

      <Card className="p-5">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-3 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search your watchlist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--bg-elevated)] border border-[var(--bg-border)] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-brand-primary)] transition"
          />
        </div>
        <div className="mt-3 text-center">
          <p className="text-xs font-mono text-[var(--text-muted)]">
            {items.length} / 10 Topics Tracked
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="col-span-full p-10 text-center">
            <AlertCircle className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-3" />
            <h4 className="text-base font-semibold text-[var(--text-primary)]">No topics watched</h4>
            <p className="text-sm text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
              Save trends from your prediction results to track them over time.
            </p>
            <Button
              className="mt-6"
              onClick={() => onNavigate('predictor')}
              icon={<ArrowUpRight className="w-4 h-4" />}
            >
              Go to Predictor
            </Button>
          </Card>
        ) : (
          filteredItems.map(item => {
            const domain = DOMAIN_CATEGORIES.find(d => d.id === item.category);
            return (
              <Card key={item.id} className="p-5 flex flex-col h-full relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-start gap-3 mb-4 pr-8">
                  <span className="text-2xl">{domain?.icon || '📊'}</span>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] line-clamp-2">{item.query}</h3>
                    <p className="text-[10px] font-mono text-[var(--text-muted)] mt-1 uppercase tracking-wider">
                      {item.category}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-[var(--bg-border)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-[var(--text-muted)]">Added {formatRelativeDate(item.addedAt)}</span>
                  </div>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleReanalyze(item.query)}
                    icon={<RefreshCw className="w-4 h-4" />}
                  >
                    Re-Analyze Now
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
