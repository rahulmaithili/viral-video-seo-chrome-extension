import React, { useEffect, useState } from 'react';
import {
  History as HistoryIcon,
  Search,
  Trash2,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { historyRepo, HistoryItem } from '../storage/repositories/historyRepo';
import { Badge } from '../components/common/Badge';

interface HistoryProps {
  onOpenWorkspace: (jobId: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onOpenWorkspace }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const items = await historyRepo.getAllHistory();
      setHistoryItems(items);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string) => {
    await historyRepo.deleteHistoryItem(id);
    await loadHistory();
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all history records?')) {
      await historyRepo.clearHistory();
      await loadHistory();
    }
  };

  // Get distinct categories
  const categories = ['ALL', ...Array.from(new Set(historyItems.map((h: HistoryItem) => h.category)))];

  // Filter items
  const filtered = historyItems.filter((item: HistoryItem) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.filename.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.niche.toLowerCase().includes(q) ||
        item.keywords.some((k: string) => k.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-900/80 border border-gray-800 rounded-2xl p-5">
        <div>
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">IndexedDB Deduplicated Store</span>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <HistoryIcon className="w-5 h-5 text-brand-400" />
            <span>Analysis History ({historyItems.length})</span>
          </h2>
        </div>

        {historyItems.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-rose-950/60 text-gray-300 hover:text-rose-400 text-xs font-medium border border-gray-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto max-w-xl pb-1">
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search history by topic/tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* History Items List */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading history records...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-gray-500 space-y-3 bg-gray-900/40 border border-gray-800/80 rounded-2xl">
          <HistoryIcon className="w-10 h-10 mx-auto text-gray-600 opacity-60" />
          <p className="text-sm">No analysis history found matching your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item: HistoryItem) => (
            <div
              key={item.id}
              className="bg-gray-900/80 border border-gray-800 hover:border-brand-500/50 rounded-2xl p-4 space-y-3 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="purple">{item.category}</Badge>
                  <div className="flex items-center space-x-1 text-xs text-orange-400 font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{item.viralScore}</span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">
                  {item.title}
                </h4>

                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                  {item.summary}
                </p>

                <div className="flex flex-wrap gap-1 pt-1">
                  {item.keywords.slice(0, 3).map((kw: string, i: number) => (
                    <span key={i} className="text-[10px] bg-gray-950 text-gray-400 px-2 py-0.5 rounded border border-gray-800">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-500">
                <span>{new Date(item.completedTime).toLocaleDateString()}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenWorkspace(item.id)}
                    className="text-brand-400 hover:text-brand-300 font-semibold flex items-center space-x-1"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-gray-500 hover:text-rose-400"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
