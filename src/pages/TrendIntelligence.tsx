import React, { useState } from 'react';
import { TrendingUp, ShieldAlert, Search, AlertCircle } from 'lucide-react';
import { HonestTrendProvider } from '../trends/providers/mock';

export const TrendIntelligence: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<{
    term: string;
    searchVolume: number | null;
    trendScore: number | null;
    source: string;
  } | null>(null);

  const trendProvider = new HonestTrendProvider(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const res = await trendProvider.getTrendData(searchTerm);
    setSearchResult(res);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5">
        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Modular Trend Engine</span>
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-brand-400" />
          <span>Trend Intelligence & Keyword Verification</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Grounded trend analysis without fabricated metrics or fake viral ranks.
        </p>
      </div>

      {/* Strict Trend Honesty Notice */}
      <div className="bg-brand-950/30 border border-brand-800/40 rounded-2xl p-5 flex items-start space-x-4">
        <div className="p-2 rounded-xl bg-brand-900/50 text-brand-300 flex-shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs leading-relaxed">
          <h4 className="font-bold text-white text-sm">Strict Trend Honesty Architecture</h4>
          <p className="text-gray-300">
            Many AI tools fabricate viral trend scores, search volume percentages, or fake Google Trends metrics.
            <strong> Rahul Scripts Viral Video AI Studio strictly prohibits manufactured numbers.</strong>
          </p>
          <p className="text-gray-400">
            When an authorized live provider is not configured, the engine reports{' '}
            <code className="text-brand-300 font-mono text-[11px] bg-gray-950 px-1.5 py-0.5 rounded">
              Live trend data unavailable
            </code>{' '}
            and relies on <strong>high-precision factual relevance scoring (≥70%)</strong> to protect your channel from keyword spam.
          </p>
        </div>
      </div>

      {/* Live Provider Status */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Trend Provider Configuration</h3>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            No External Trend API Configured
          </span>
        </div>

        {/* Term Explorer Form */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Test keyword or topic trend availability (e.g. 'golden retriever', 'pizza recipe')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-brand-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-colors"
          >
            Check Keyword
          </button>
        </form>

        {searchResult && (
          <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm">&quot;{searchResult.term}&quot;</span>
              <span className="text-gray-400 font-mono text-[11px]">Source: {searchResult.source}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-gray-300 border-t border-gray-800/80">
              <div>Search Volume: <strong className="text-gray-400 font-mono">null (no fake data)</strong></div>
              <div>Trend Score: <strong className="text-gray-400 font-mono">null (no fake data)</strong></div>
              <div>Factual Fit: <strong className="text-emerald-400">Relevance Filter Active</strong></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
