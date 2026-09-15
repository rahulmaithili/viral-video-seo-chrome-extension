import React, { useRef, useState } from 'react';
import {
  Plus,
  Play,
  Pause,
  RotateCcw,
  Download,
  Trash2,
  Search,
  Layers,
  ChevronRight,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';
import { useQueueStore } from '../state/queueStore';
import { useSettingsStore } from '../state/settingsStore';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { exportBatchToCSV } from '../export/csv';
import { exportBatchToJSON } from '../export/json';
import { SupportedLanguage } from '../types/video';
import { VideoJob } from '../types/queue';

interface BulkQueueProps {
  onOpenWorkspace: (jobId: string) => void;
}

export const BulkQueue: React.FC<BulkQueueProps> = ({ onOpenWorkspace }) => {
  const {
    jobs,
    addVideos,
    pauseQueue,
    resumeQueue,
    retryFailed,
    clearAll,
    deleteJob,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    showCrashRecoveryModal,
    dismissCrashModal,
    resumeCrashJobs,
  } = useQueueStore();

  const { settings, updateSettings } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Compute batch metrics
  const total = jobs.length;
  const completed = jobs.filter((j: VideoJob) => j.status === 'COMPLETED').length;
  const duplicates = jobs.filter((j: VideoJob) => j.status === 'DUPLICATE').length;
  const failed = jobs.filter((j: VideoJob) => j.status === 'FAILED').length;
  const queued = jobs.filter((j: VideoJob) =>
    ['QUEUED', 'PREPARING', 'FINGERPRINTING', 'DUPLICATE_CHECK', 'ANALYZING', 'GENERATING', 'VALIDATING'].includes(
      j.status
    )
  ).length;
  const progressPercent = total > 0 ? Math.round(((completed + duplicates) / total) * 100) : 0;

  // Filtered jobs list
  const filteredJobs = jobs.filter((job: VideoJob) => {
    // Status filter
    if (filterStatus !== 'ALL' && job.status !== filterStatus) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = job.filename.toLowerCase().includes(q);
      const matchCategory = job.analysis?.category.toLowerCase().includes(q) || false;
      const matchNiche = job.analysis?.niche.toLowerCase().includes(q) || false;
      if (!matchName && !matchCategory && !matchNiche) return false;
    }

    return true;
  });

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addVideos(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addVideos(Array.from(e.dataTransfer.files));
    }
  };

  const togglePauseResume = () => {
    if (isPaused) {
      resumeQueue();
      setIsPaused(false);
    } else {
      pauseQueue();
      setIsPaused(true);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Crash Recovery Notification Banner */}
      {showCrashRecoveryModal && (
        <div className="bg-amber-950/80 border border-amber-600/60 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-950/30">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-amber-200">Interrupted Batch Detected</h4>
              <p className="text-xs text-amber-300/80">
                A previous video batch was interrupted by extension reload or browser close.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resumeCrashJobs}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-colors"
            >
              Resume Batch
            </button>
            <button
              onClick={dismissCrashModal}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Bulk Controls Header */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-brand-400 tracking-wider uppercase">Rahul Scripts Engine</span>
            <h2 className="text-xl font-black text-white">Bulk Video AI Analysis Queue</h2>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFiles}
              multiple
              accept="video/*,.mp4,.mov,.avi,.webm,.mkv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Select Videos</span>
            </button>

            {jobs.length > 0 && (
              <>
                <button
                  onClick={togglePauseResume}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition-colors"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>

                <button
                  onClick={retryFailed}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                  <span>Retry Failed</span>
                </button>

                <button
                  onClick={() => exportBatchToCSV(jobs)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-medium border border-emerald-800/60 transition-colors"
                  title="Export all completed metadata to CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => exportBatchToJSON(jobs)}
                  className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition-colors"
                  title="Export full raw data to JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>

                <button
                  onClick={clearAll}
                  className="p-2 rounded-xl bg-gray-800 hover:bg-rose-950/60 text-gray-400 hover:text-rose-400 border border-gray-700 hover:border-rose-800/60 transition-colors"
                  title="Clear entire queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Global Video Settings Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-3 border-t border-gray-800/80 text-xs">
          {/* Language Selector */}
          <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-2.5">
            <span className="text-gray-400 block mb-1 font-medium">CONTENT LANGUAGE</span>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => updateSettings({ defaultLanguage: e.target.value as SupportedLanguage })}
              className="w-full bg-gray-900 text-white rounded px-2 py-1 border border-gray-700 outline-none text-xs"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi (हिन्दी)</option>
              <option value="Hinglish">Hinglish</option>
            </select>
          </div>

          {/* USA Target Switch */}
          <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-2.5">
            <span className="text-gray-400 block mb-1 font-medium">TARGET USA AUDIENCE</span>
            <button
              onClick={() => updateSettings({ defaultTargetUsa: !settings.defaultTargetUsa })}
              className={`w-full py-1 rounded font-bold text-xs border transition-colors ${
                settings.defaultTargetUsa
                  ? 'bg-sky-900/60 text-sky-300 border-sky-600/60'
                  : 'bg-gray-900 text-gray-400 border-gray-700'
              }`}
            >
              USA {settings.defaultTargetUsa ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Platforms Checkboxes */}
          <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-2.5 col-span-2 sm:col-span-1">
            <span className="text-gray-400 block mb-1 font-medium">PLATFORMS</span>
            <div className="flex items-center space-x-2 text-[11px] text-gray-300">
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.defaultPlatforms.includes('youtube')}
                  onChange={(e) => {
                    const list = e.target.checked
                      ? [...settings.defaultPlatforms, 'youtube']
                      : settings.defaultPlatforms.filter((p: string) => p !== 'youtube');
                    updateSettings({ defaultPlatforms: list as ('youtube' | 'facebook' | 'instagram')[] });
                  }}
                  className="accent-brand-500"
                />
                <span>YT</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.defaultPlatforms.includes('facebook')}
                  onChange={(e) => {
                    const list = e.target.checked
                      ? [...settings.defaultPlatforms, 'facebook']
                      : settings.defaultPlatforms.filter((p: string) => p !== 'facebook');
                    updateSettings({ defaultPlatforms: list as ('youtube' | 'facebook' | 'instagram')[] });
                  }}
                  className="accent-brand-500"
                />
                <span>FB</span>
              </label>
              <label className="flex items-center space-x-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.defaultPlatforms.includes('instagram')}
                  onChange={(e) => {
                    const list = e.target.checked
                      ? [...settings.defaultPlatforms, 'instagram']
                      : settings.defaultPlatforms.filter((p: string) => p !== 'instagram');
                    updateSettings({ defaultPlatforms: list as ('youtube' | 'facebook' | 'instagram')[] });
                  }}
                  className="accent-brand-500"
                />
                <span>IG</span>
              </label>
            </div>
          </div>

          {/* Keyword Mode */}
          <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-2.5">
            <span className="text-gray-400 block mb-1 font-medium">KEYWORD MODE</span>
            <span className="font-semibold text-brand-300 block py-1">Relevance First (≥70)</span>
          </div>

          {/* Concurrency Selector */}
          <div className="bg-gray-950/60 border border-gray-800 rounded-lg p-2.5">
            <span className="text-gray-400 block mb-1 font-medium">CONCURRENCY</span>
            <select
              value={settings.concurrency}
              onChange={(e) => updateSettings({ concurrency: Number(e.target.value) as 1 | 2 | 3 | 5 })}
              className="w-full bg-gray-900 text-white rounded px-2 py-1 border border-gray-700 outline-none text-xs"
            >
              <option value="1">1 Worker</option>
              <option value="2">2 Workers</option>
              <option value="3">3 Workers (Default)</option>
              <option value="5">5 Workers (High)</option>
            </select>
          </div>
        </div>

        {/* Batch Progress Bar */}
        {total > 0 && (
          <div className="pt-2">
            <ProgressBar
              progress={progressPercent}
              label={`${completed} / ${total} COMPLETE (${queued} in progress, ${duplicates} duplicates, ${failed} failed)`}
            />
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['ALL', 'QUEUED', 'COMPLETED', 'DUPLICATE', 'FAILED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filterStatus === status
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search filename or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-900/90 border border-gray-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Drag & Drop Upload Zone if queue is empty */}
      {jobs.length === 0 ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-brand-500/70 bg-gray-900/30 hover:bg-brand-950/10 rounded-2xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
        >
          <div className="w-16 h-16 rounded-2xl bg-brand-950/80 border border-brand-800/60 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-110 transition-transform">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Drag & Drop Videos To Start Bulk Analysis</h3>
          <p className="text-sm text-gray-400 max-w-md mb-6">
            Upload 1, 10, 50, or 100+ videos. The engine automatically handles SHA-256 binary and perceptual
            duplicate checking, concurrency pooling, and error isolation.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-lg shadow-brand-600/30 transition-all">
            Browse Video Files
          </button>
        </div>
      ) : (
        /* Professional Bulk Data Table */
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-950/80 text-gray-400 uppercase tracking-wider border-b border-gray-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Video</th>
                  <th className="py-3.5 px-4">Category / Niche</th>
                  <th className="py-3.5 px-4">Viral Score</th>
                  <th className="py-3.5 px-4">Target</th>
                  <th className="py-3.5 px-4">Duplicate</th>
                  <th className="py-3.5 px-4">Status & Step</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-gray-300">
                {filteredJobs.map((job: VideoJob) => {
                  const isDup = job.duplicateInfo?.isDuplicate;
                  const dupScore = job.duplicateInfo?.score || 0;

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-gray-800/40 transition-colors group cursor-pointer"
                      onClick={() => onOpenWorkspace(job.id)}
                    >
                      {/* Video Filename & Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-800 border border-gray-700/60 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {job.metadata?.thumbnailUrl ? (
                              <img src={job.metadata.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Layers className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="max-w-[180px] sm:max-w-xs truncate">
                            <span className="font-semibold text-white block truncate" title={job.filename}>
                              {job.filename}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {(job.filesize / (1024 * 1024)).toFixed(1)} MB
                              {job.metadata?.duration ? ` • ${Math.round(job.metadata.duration)}s` : ''}
                              {job.metadata?.aspectRatio ? ` • ${job.metadata.aspectRatio}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category / Niche */}
                      <td className="py-3.5 px-4">
                        {job.analysis ? (
                          <div>
                            <span className="font-medium text-gray-200 block">{job.analysis.category}</span>
                            <span className="text-[11px] text-gray-400">{job.analysis.niche}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">Auto-detecting...</span>
                        )}
                      </td>

                      {/* Viral Score */}
                      <td className="py-3.5 px-4">
                        {job.analysis?.viralScore ? (
                          <div className="flex items-center space-x-1.5">
                            <span className="text-sm font-extrabold text-brand-400 bg-brand-950/70 border border-brand-800/60 px-2 py-0.5 rounded">
                              {job.analysis.viralScore.overallScore}
                            </span>
                            <span className="text-[10px] text-gray-400">/ 100</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">--</span>
                        )}
                      </td>

                      {/* Target Language & USA */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className="text-gray-300 font-medium block">{job.language}</span>
                          <span className="text-[10px] text-sky-400 font-semibold">
                            {job.targetUsa ? 'USA ON' : 'GLOBAL'}
                          </span>
                        </div>
                      </td>

                      {/* Duplicate Status */}
                      <td className="py-3.5 px-4">
                        {isDup ? (
                          <div className="space-y-0.5">
                            <Badge variant="warning">
                              ⚠ {dupScore}% Match
                            </Badge>
                            <span className="text-[10px] text-amber-400/80 block truncate max-w-[130px]">
                              {job.duplicateInfo?.matchedFilename}
                            </span>
                          </div>
                        ) : job.duplicateInfo?.score && job.duplicateInfo.score > 70 ? (
                          <Badge variant="info">
                            {job.duplicateInfo.score}% Similarity
                          </Badge>
                        ) : (
                          <span className="text-emerald-400/90 text-xs font-medium">✓ Unique</span>
                        )}
                      </td>

                      {/* Status & Step */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5 min-w-[140px]">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                job.status === 'COMPLETED'
                                  ? 'success'
                                  : job.status === 'DUPLICATE'
                                  ? 'warning'
                                  : job.status === 'FAILED'
                                  ? 'danger'
                                  : 'purple'
                              }
                            >
                              {job.status}
                            </Badge>
                            {job.latencyMs && (
                              <span className="text-[10px] text-gray-500">{(job.latencyMs / 1000).toFixed(1)}s</span>
                            )}
                          </div>
                          {job.status !== 'COMPLETED' && job.status !== 'DUPLICATE' && job.status !== 'FAILED' && (
                            <ProgressBar progress={job.progress} showPercent={false} />
                          )}
                          <span className="text-[10px] text-gray-400 block truncate max-w-[180px]">
                            {job.currentStepDescription}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onOpenWorkspace(job.id)}
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-brand-600 text-gray-300 hover:text-white transition-colors"
                            title="Open Analysis Workspace"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteJob(job.id)}
                            className="p-1.5 rounded-lg bg-gray-800 hover:bg-rose-900/60 text-gray-400 hover:text-rose-300 transition-colors"
                            title="Remove Video"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
