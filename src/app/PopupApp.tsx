import React, { useEffect, useRef, useState } from 'react';
import {
  Zap,
  Layers,
  Plus,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Download,
} from 'lucide-react';
import { useSettingsStore } from '../state/settingsStore';
import { useQueueStore } from '../state/queueStore';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { SupportedLanguage } from '../types/video';
import { NichePreset } from '../types/settings';
import { DEFAULT_NICHE_PRESETS } from '../config/defaults';

interface UpdateInfo {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  name?: string;
  changelog: string;
  downloadUrl: string;
  repoUrl: string;
  releaseDate?: string;
  lastChecked: number;
}

export const PopupApp: React.FC = () => {
  const { settings, loadSettings, updateSettings } = useSettingsStore();
  const { jobs, initQueue, addVideos } = useQueueStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTabInfo, setActiveTabInfo] = useState<{ isFb: boolean; isMetaBulk: boolean; tabId?: number }>({
    isFb: false,
    isMetaBulk: false,
  });
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerStatus, setTriggerStatus] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isEditorExpanded, setIsEditorExpanded] = useState<boolean>(true);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState<boolean>(false);
  const [updateStatusBanner, setUpdateStatusBanner] = useState<string | null>(null);

  const checkUpdateStatus = (manual = false) => {
    setIsCheckingUpdate(true);
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'CHECK_FOR_UPDATES' }, (res) => {
        setIsCheckingUpdate(false);
        if (res && res.success && res.data) {
          setUpdateInfo(res.data);
          if (manual) {
            if (res.data.hasUpdate) {
              setUpdateStatusBanner(`🎉 New version v${res.data.latestVersion} Available!`);
            } else {
              setUpdateStatusBanner(`✓ You are on the latest version (v${res.data.currentVersion})!`);
            }
            setTimeout(() => setUpdateStatusBanner(null), 3500);
          }
        }
      });
    } else {
      setIsCheckingUpdate(false);
    }
  };

  useEffect(() => {
    loadSettings();
    initQueue();
    checkUpdateStatus(false);

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = tabs[0]?.url || '';
        const isFb = url.includes('facebook.com') || url.includes('meta.com');
        const isMetaBulk = url.includes('bulk_upload_composer');
        setActiveTabInfo({ isFb, isMetaBulk, tabId: tabs[0]?.id });
      });
    }
  }, [loadSettings, initQueue]);

  const triggerInPageAutoFill = () => {
    if (activeTabInfo.tabId && typeof chrome !== 'undefined' && chrome.tabs) {
      setIsTriggering(true);
      setTriggerStatus('Generating on Page...');
      chrome.tabs.sendMessage(activeTabInfo.tabId, { type: 'TRIGGER_AUTO_FILL_ALL' }, () => {
        setIsTriggering(false);
        setTriggerStatus('✓ Generated on Page!');
        setTimeout(() => setTriggerStatus(null), 3500);
      });
    }
  };

  const presets: NichePreset[] =
    settings.nichePresets && settings.nichePresets.length > 0 ? settings.nichePresets : DEFAULT_NICHE_PRESETS;
  const activePresetId = settings.activePresetId || presets[0]?.id || 'bhakti';
  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];

  const handleSelectPreset = (id: string) => {
    updateSettings({ activePresetId: id });
    setSaveFeedback('✓ Prompt enabled for Facebook!');
    setTimeout(() => setSaveFeedback(null), 2500);
  };

  const handleUpdateActivePresetField = (field: keyof NichePreset, value: any) => {
    const updated = presets.map((p) => {
      if (p.id === activePresetId) {
        return { ...p, [field]: value };
      }
      return p;
    });
    updateSettings({ nichePresets: updated });
    setSaveFeedback('✓ Auto-saved');
    setTimeout(() => setSaveFeedback(null), 2000);
  };

  const handleAddNewPreset = () => {
    const newId = `custom_${Date.now()}`;
    const newPreset: NichePreset = {
      id: newId,
      name: `Page / Niche #${presets.length + 1}`,
      pageKeywords: [],
      masterPrompt: 'Devotional / Funny / Informative reel hook, relatable caption, viral hashtags...',
      language: settings.defaultLanguage || 'Hindi',
      targetUsa: !!settings.defaultTargetUsa,
      fixedHashtags: '#TrendingReels #ViralReels',
    };
    const updated = [...presets, newPreset];
    updateSettings({ nichePresets: updated, activePresetId: newId });
    setIsEditorExpanded(true);
    setSaveFeedback('✓ New Prompt Created & Enabled!');
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleDeletePreset = (id: string) => {
    const filtered = presets.filter((p) => p.id !== id);
    const nextActive = activePresetId === id ? filtered[0]?.id || 'bhakti' : activePresetId;
    updateSettings({ nichePresets: filtered, activePresetId: nextActive });
    setSaveFeedback('✓ Prompt deleted');
    setTimeout(() => setSaveFeedback(null), 2000);
  };

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
    <div className="w-[380px] max-h-[600px] overflow-y-auto bg-[#0B0F19] text-gray-100 p-3.5 space-y-3 font-sans border border-gray-800 select-none">
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
      <div className="flex items-center justify-between border-b border-gray-800 pb-2.5">
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

        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => checkUpdateStatus(true)}
            disabled={isCheckingUpdate}
            className="flex items-center space-x-1 text-[9px] bg-brand-950 text-brand-300 hover:text-white border border-brand-800 hover:border-brand-500 px-1.5 py-1 rounded transition-all active:scale-95 cursor-pointer"
            title="Check for Remote GitHub Updates"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${isCheckingUpdate ? 'animate-spin text-yellow-300' : ''}`} />
            <span>v3.0.0</span>
          </button>
          <button
            onClick={openFullDashboard}
            className="p-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition-colors"
            title="Open Full Dashboard in Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Update Feedback Toast */}
      {updateStatusBanner && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-[11px] px-2.5 py-1.5 rounded-lg text-center font-bold">
          {updateStatusBanner}
        </div>
      )}

      {/* New Update Available Glowing Banner */}
      {updateInfo && updateInfo.hasUpdate && (
        <div className="bg-gradient-to-r from-amber-950 via-purple-950 to-indigo-950 border-2 border-amber-400 rounded-xl p-3 space-y-2 shadow-lg shadow-amber-500/30 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black text-white">
                🚀 New Update Available: v{updateInfo.latestVersion}
              </span>
            </div>
            <span className="text-[9px] bg-amber-400 text-black font-black px-1.5 py-0.5 rounded">
              UPDATE
            </span>
          </div>
          <p className="text-[11px] text-amber-100/90 leading-snug">
            {updateInfo.changelog}
          </p>
          <div className="flex items-center gap-2 pt-0.5">
            <a
              href={updateInfo.downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1 active:scale-95 text-center"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Update (ZIP)</span>
            </a>
            <a
              href={updateInfo.repoUrl}
              target="_blank"
              rel="noreferrer"
              className="py-1.5 px-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold border border-gray-700 text-center"
            >
              GitHub
            </a>
          </div>
          <span className="text-[9px] text-gray-400 block text-center">
            Tip: Extract ZIP & click Reload in chrome://extensions
          </span>
        </div>
      )}

      {/* Live Facebook / Meta In-Page Detector Card */}
      {activeTabInfo.isFb && (
        <div className="bg-gradient-to-r from-brand-950 via-purple-950 to-indigo-950 border-2 border-brand-500/80 rounded-xl p-3 space-y-2 shadow-lg shadow-brand-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-xs font-black text-white">
                {activeTabInfo.isMetaBulk ? 'Meta Bulk Upload Reels' : 'Facebook Video Creator'}
              </span>
            </div>
            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
              CONNECTED
            </span>
          </div>
          <p className="text-[11px] text-brand-200 leading-snug">
            {activeTabInfo.isMetaBulk
              ? 'Bulk reels detected on this tab! Generate title & hashtags for all reels with 1 click.'
              : 'Reels detected! Click below to auto-fill title, caption & tags on this page.'}
          </p>
          <button
            onClick={triggerInPageAutoFill}
            disabled={isTriggering}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-75"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
            <span>{triggerStatus || (activeTabInfo.isMetaBulk ? '⚡ Auto-Fill All Bulk Reels Now' : '⚡ Auto-Fill Reel on Page')}</span>
          </button>
        </div>
      )}

      {/* Master Prompts & Radio Selection */}
      <div className="bg-gradient-to-b from-gray-900 via-gray-900/90 to-[#0F172A] border border-purple-500/50 rounded-xl p-3 space-y-2.5 shadow-lg shadow-purple-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="text-sm">🎯</span>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">Master Prompts (Radio Select)</h2>
              <span className="text-[9px] text-purple-300 block">Jo radio button ON hoga, AI usi prompt se metadata banayega</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddNewPreset}
            className="text-[10px] bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/50 px-2 py-1 rounded-md font-bold transition-all flex items-center gap-1 active:scale-95"
            title="Naya Page Niche / Prompt Add Karein"
          >
            <span>+ Add Prompt</span>
          </button>
        </div>

        {/* Radio List */}
        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {presets.map((p) => {
            const isSelected = p.id === activePresetId;
            return (
              <label
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                  isSelected
                    ? 'bg-purple-950/60 border-purple-500 text-white shadow-sm shadow-purple-500/20'
                    : 'bg-gray-950/60 border-gray-800 text-gray-300 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <input
                    type="radio"
                    name="master_prompt_radio"
                    checked={isSelected}
                    onChange={() => handleSelectPreset(p.id)}
                    className="w-3.5 h-3.5 text-purple-600 bg-gray-900 border-gray-700 focus:ring-purple-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold truncate">{p.name}</span>
                </div>
                <div className="flex items-center space-x-1.5 flex-shrink-0">
                  {isSelected ? (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> ENABLED
                    </span>
                  ) : (
                    <span className="text-[9px] text-gray-500">Enable</span>
                  )}
                  {p.id.startsWith('custom_') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(p.id);
                      }}
                      className="text-gray-500 hover:text-red-400 px-1 font-bold"
                      title="Delete Prompt"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </label>
            );
          })}
        </div>

        {/* Active Prompt Editor Box */}
        {activePreset && (
          <div className="bg-[#050811] border border-purple-900/60 rounded-lg p-2.5 space-y-2">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-1.5">
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1 truncate">
                <span>✍️</span> Edit Active Master Prompt ({activePreset.name})
              </span>
              <button
                type="button"
                onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                className="text-[10px] text-gray-400 hover:text-white flex-shrink-0"
              >
                {isEditorExpanded ? 'Collapse ▲' : 'Expand ▼'}
              </button>
            </div>

            {isEditorExpanded && (
              <div className="space-y-2 pt-0.5">
                <div>
                  <label className="text-[9px] text-gray-400 block mb-1 font-semibold">
                    PAGE / NICHE NAME:
                  </label>
                  <input
                    type="text"
                    value={activePreset.name}
                    onChange={(e) => handleUpdateActivePresetField('name', e.target.value)}
                    placeholder="e.g. Mahadev Bhakti 24/7 or Cute Puppy Videos"
                    className="w-full bg-[#0B0F19] border border-gray-700 focus:border-purple-500 rounded-md py-1 px-2 text-xs text-white outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-400 block mb-1 font-semibold">
                    MASTER PROMPT (AI Instructions for this Page):
                  </label>
                  <textarea
                    value={activePreset.masterPrompt}
                    onChange={(e) => handleUpdateActivePresetField('masterPrompt', e.target.value)}
                    rows={3}
                    placeholder="Apna master prompt yahan likhein (e.g. Bhakti hook, emotional voiceover, comment call to action...)"
                    className="w-full bg-[#0B0F19] border border-gray-700 focus:border-purple-500 rounded-md p-2 text-xs text-white outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-[9px] text-gray-400 block mb-1 font-semibold">
                    FIXED HASHTAGS (Reels me automatic judenge):
                  </label>
                  <input
                    type="text"
                    value={activePreset.fixedHashtags || ''}
                    onChange={(e) => handleUpdateActivePresetField('fixedHashtags', e.target.value)}
                    placeholder="#Bhakti #JaiShreeRam #ViralReels"
                    className="w-full bg-[#0B0F19] border border-gray-700 focus:border-purple-500 rounded-md py-1 px-2 text-xs text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="bg-[#0B0F19] border border-gray-800 rounded p-1.5">
                    <span className="text-[9px] text-gray-400 block mb-0.5">LANGUAGE</span>
                    <select
                      value={activePreset.language || 'Hindi'}
                      onChange={(e) => handleUpdateActivePresetField('language', e.target.value as SupportedLanguage)}
                      className="w-full bg-transparent text-white font-semibold outline-none cursor-pointer text-xs"
                    >
                      <option value="Hindi" className="bg-gray-900">Hindi (हिन्दी)</option>
                      <option value="Hinglish" className="bg-gray-900">Hinglish</option>
                      <option value="English" className="bg-gray-900">English</option>
                    </select>
                  </div>

                  <div className="bg-[#0B0F19] border border-gray-800 rounded p-1.5">
                    <span className="text-[9px] text-gray-400 block mb-0.5">AUDIENCE</span>
                    <button
                      type="button"
                      onClick={() => handleUpdateActivePresetField('targetUsa', !activePreset.targetUsa)}
                      className={`w-full text-left font-bold text-xs transition-colors ${
                        activePreset.targetUsa ? 'text-sky-400' : 'text-gray-400'
                      }`}
                    >
                      {activePreset.targetUsa ? 'USA Audience' : 'Global / India'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-gray-800/60">
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {saveFeedback || '✓ Active & Synced with Facebook'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSaveFeedback('✓ All Changes Saved!');
                      setTimeout(() => setSaveFeedback(null), 2500);
                    }}
                    className="text-[10px] bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1 rounded transition-all active:scale-95 shadow-sm"
                  >
                    💾 Save Prompt
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
