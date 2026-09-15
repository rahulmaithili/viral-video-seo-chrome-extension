import React, { useEffect, useRef } from 'react';
import {
  Zap,
  Layers,
  Plus,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useSettingsStore } from '../state/settingsStore';
import { useQueueStore } from '../state/queueStore';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { SupportedLanguage } from '../types/video';

export const PopupApp: React.FC = () => {
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const { jobs, initQueue, addVideos } = useQueueStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
    initQueue();
  }, [loadSettings, initQueue]);

  const total = jobs.length;
  const completed = jobs.filter((j) => j.status === 'COMPLETED').length;
  const duplicates = jobs.filter((j) => j.status === 'DUPLICATE').length;
  const active = jobs.filter((j) =>
    ['QUEUED', 'PREPARING', 'FINGERPRINTING', 'DUPLICATE_CHECK', 'ANALYZING', 'GENERATING', 'VALIDATING'].includes(
      j.status
    )
  ).length;

  const progressPercent = total > 0 ? Math.round(((completed + duplicates) / total) * 100) : 0;

  const openFullDashboard = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.runtime) {
      chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    } else {
      window.open('/index.html', '_blank');
    }
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addVideos(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-[380px] bg-[#0B0F19] text-gray-100 p-4 space-y-4 font-sans border border-gray-800 rounded-none select-none">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFiles}
        multiple
        accept="video/*,.mp4,.mov,.avi,.webm,.mkv"
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-purple-400 p-0.5 flex items-center justify-center shadow-md shadow-brand-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-[6px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-brand-400 fill-brand-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">Rahul Scripts</span>
              <span className="text-[9px] bg-brand-950 text-brand-300 border border-brand-800 px-1 rounded">3.0 PRO</span>
            </div>
            <h1 className="text-xs font-black text-white">Viral Video AI Studio</h1>
          </div>
        </div>

        <button
          onClick={openFullDashboard}
          className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
          title="Open Full Dashboard in Tab"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Controls Bar */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Language */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-2">
          <span className="text-[10px] text-gray-400 block mb-0.5">LANGUAGE</span>
          <select
            value={settings.defaultLanguage}
            onChange={(e) => updateSettings({ defaultLanguage: e.target.value as SupportedLanguage })}
            className="w-full bg-transparent text-white font-semibold outline-none cursor-pointer text-xs"
          >
            <option value="English" className="bg-gray-900">English</option>
            <option value="Hindi" className="bg-gray-900">Hindi (हिन्दी)</option>
            <option value="Hinglish" className="bg-gray-900">Hinglish</option>
          </select>
        </div>

        {/* USA Toggle */}
        <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-2">
          <span className="text-[10px] text-gray-400 block mb-0.5">TARGET USA</span>
          <button
            onClick={() => updateSettings({ defaultTargetUsa: !settings.defaultTargetUsa })}
            className={`w-full text-left font-bold transition-colors ${
              settings.defaultTargetUsa ? 'text-sky-400' : 'text-gray-400'
            }`}
          >
            {settings.defaultTargetUsa ? 'ON (US Audience)' : 'OFF (Global)'}
          </button>
        </div>
      </div>

      {/* Batch Overview & Progress */}
      <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-400" />
            <span>Active Queue</span>
          </span>
          <span className="text-gray-400 font-mono text-[11px]">
            {completed} / {total} Done
          </span>
        </div>

        <ProgressBar progress={progressPercent} showPercent={true} />

        <div className="grid grid-cols-3 gap-1 pt-1 text-center text-[10px] text-gray-400 border-t border-gray-800/60">
          <div>Queued: <strong className="text-white">{active}</strong></div>
          <div>Dups: <strong className="text-amber-400">{duplicates}</strong></div>
          <div>Mode: <strong className="text-brand-300">{settings.useMockAI ? 'Mock' : 'Gemini'}</strong></div>
        </div>
      </div>

      {/* Recent Queue Snippet */}
      {jobs.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Recent Videos</span>
          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
            {jobs.slice(0, 3).map((j) => (
              <div
                key={j.id}
                onClick={openFullDashboard}
                className="bg-gray-950/80 border border-gray-800/80 hover:border-gray-700 rounded-lg p-2 flex items-center justify-between cursor-pointer text-xs"
              >
                <div className="truncate max-w-[200px]">
                  <p className="font-medium text-white truncate text-[11px]">{j.filename}</p>
                  <span className="text-[9px] text-gray-400 block truncate">{j.currentStepDescription}</span>
                </div>
                <Badge
                  variant={
                    j.status === 'COMPLETED'
                      ? 'success'
                      : j.status === 'DUPLICATE'
                      ? 'warning'
                      : j.status === 'FAILED'
                      ? 'danger'
                      : 'purple'
                  }
                >
                  {j.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center space-x-1.5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-brand-600/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Videos To Queue</span>
        </button>

        <button
          onClick={openFullDashboard}
          className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold border border-gray-700 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Launch Full Studio Dashboard</span>
        </button>
      </div>
    </div>
  );
};
