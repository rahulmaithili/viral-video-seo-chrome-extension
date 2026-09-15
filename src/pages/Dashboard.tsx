import React, { useRef } from 'react';
import {
  Video,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Flame,
  Plus,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { useQueueStore } from '../state/queueStore';
import { useSettingsStore } from '../state/settingsStore';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { VideoJob } from '../types/queue';

interface DashboardProps {
  onNavigate: (tab: 'queue' | 'workspace' | 'settings') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { jobs, addVideos, selectJob, retryFailed } = useQueueStore();
  const { settings } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute metrics
  const totalProcessed = jobs.filter((j: VideoJob) => j.status === 'COMPLETED').length;
  const duplicatesCount = jobs.filter((j: VideoJob) => j.status === 'DUPLICATE').length;
  const failedCount = jobs.filter((j: VideoJob) => j.status === 'FAILED').length;
  const uniqueCount = totalProcessed;

  // Average viral score
  const completedJobsWithScores = jobs.filter((j: VideoJob) => j.analysis?.viralScore?.overallScore);
  const avgScore =
    completedJobsWithScores.length > 0
      ? Math.round(
          completedJobsWithScores.reduce((acc: number, j: VideoJob) => acc + (j.analysis?.viralScore.overallScore || 0), 0) /
            completedJobsWithScores.length
        )
      : 0;

  // Active batch progress
  const activeJobs = jobs.filter((j: VideoJob) =>
    ['QUEUED', 'PREPARING', 'FINGERPRINTING', 'DUPLICATE_CHECK', 'ANALYZING', 'GENERATING', 'VALIDATING'].includes(
      j.status
    )
  );
  const totalInBatch = jobs.length;
  const batchProgress = totalInBatch > 0 ? Math.round(((totalProcessed + duplicatesCount) / totalInBatch) * 100) : 0;

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addVideos(Array.from(e.target.files));
      onNavigate('queue');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addVideos(Array.from(e.dataTransfer.files));
      onNavigate('queue');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-950 via-purple-950 to-gray-900 border border-brand-800/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-brand-900/60 border border-brand-700/50 text-xs font-semibold text-brand-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Rahul Scripts High-Performance Architecture</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Viral Video AI Studio Pro
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Batch analyze videos with multi-level duplicate detection (SHA-256 & perceptual dHash),
              strict canonical fact extraction, and multi-platform optimization for YouTube, Facebook & Instagram.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesSelected}
              multiple
              accept="video/*,.mp4,.mov,.avi,.webm,.mkv"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-semibold text-sm shadow-xl shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Videos</span>
            </button>
            <button
              onClick={() => onNavigate('queue')}
              className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 hover:text-white border border-gray-700 font-medium text-sm transition-all"
            >
              <Layers className="w-4 h-4" />
              <span>Open Bulk Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Processed */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Processed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalProcessed}</div>
          <div className="text-[10px] text-gray-400 mt-1">Unique completed</div>
        </div>

        {/* Unique Videos */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Unique</span>
            <Video className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white">{uniqueCount}</div>
          <div className="text-[10px] text-gray-400 mt-1">Distinct content</div>
        </div>

        {/* Duplicates Detected */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Duplicates</span>
            <Copy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{duplicatesCount}</div>
          <div className="text-[10px] text-amber-400/80 mt-1">Skipped safely</div>
        </div>

        {/* Failed Jobs */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Failed</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">{failedCount}</div>
          <div className="text-[10px] text-rose-400/80 mt-1">
            {failedCount > 0 ? (
              <button onClick={retryFailed} className="underline hover:text-white">
                Retry failed
              </button>
            ) : (
              '0 errors'
            )}
          </div>
        </div>

        {/* Average Viral Score */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Avg Score</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">{avgScore > 0 ? avgScore : '--'}</div>
          <div className="text-[10px] text-gray-400 mt-1">Viral potential</div>
        </div>

        {/* Concurrency Limit */}
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">Concurrency</span>
            <Cpu className="w-4 h-4 text-brand-400" />
          </div>
          <div className="text-2xl font-black text-white">{settings.concurrency}x</div>
          <div className="text-[10px] text-gray-400 mt-1">Parallel workers</div>
        </div>

        {/* AI Engine Status */}
        <div
          onClick={() => onNavigate('settings')}
          className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-brand-600/50 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium">AI Engine</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-300">
            {settings.useMockAI ? 'Mock Mode' : 'Gemini Live'}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 truncate">
            {settings.useMockAI ? '100% Offline' : settings.geminiModel}
          </div>
        </div>
      </div>

      {/* Active Batch Progress Card (if jobs exist) */}
      {totalInBatch > 0 && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-white">Current Batch Progress</span>
              <Badge variant={activeJobs.length > 0 ? 'purple' : 'success'}>
                {activeJobs.length > 0 ? 'Processing' : 'Completed'}
              </Badge>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {totalProcessed + duplicatesCount} / {totalInBatch} Videos
            </span>
          </div>
          <ProgressBar progress={batchProgress} />
        </div>
      )}

      {/* Drag & Drop Quick Area & Recent Queue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Queue Table */}
        <div className="lg:col-span-2 bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-brand-400" />
              <span>Active Queue ({jobs.length})</span>
            </h3>
            <button
              onClick={() => onNavigate('queue')}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
            >
              <span>View Full Queue Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-3">
              <Video className="w-10 h-10 mx-auto text-gray-600 opacity-50" />
              <p className="text-sm">No videos in queue. Drag and drop video files to begin bulk processing.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/80 overflow-hidden">
              {jobs.slice(0, 5).map((job: VideoJob) => (
                <div
                  key={job.id}
                  onClick={() => {
                    selectJob(job.id);
                    onNavigate('workspace');
                  }}
                  className="py-3 px-2 flex items-center justify-between hover:bg-gray-800/40 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-10 h-10 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden border border-gray-700 flex items-center justify-center">
                      {job.metadata?.thumbnailUrl ? (
                        <img
                          src={job.metadata.thumbnailUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Video className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-gray-200 truncate">{job.filename}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {job.analysis?.category || 'Analyzing...'} • {job.language} • {job.targetUsa ? 'USA' : 'Global'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {job.analysis?.viralScore && (
                      <span className="text-xs font-bold text-brand-400 bg-brand-950/60 px-2 py-0.5 rounded border border-brand-800/50">
                        {job.analysis.viralScore.overallScore}
                      </span>
                    )}

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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Drag & Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-brand-500/70 bg-gray-900/30 hover:bg-brand-950/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-brand-950/80 border border-brand-800/60 flex items-center justify-center text-brand-400 mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">Upload Videos</h4>
          <p className="text-xs text-gray-400 max-w-xs mb-4">
            Drag and drop multiple video files here or click to browse.
          </p>
          <span className="text-[11px] text-gray-500">Supports MP4, MOV, WEBM, MKV</span>
        </div>
      </div>
    </div>
  );
};
