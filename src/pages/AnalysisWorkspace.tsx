import React, { useState } from 'react';
import {
  Video,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Flame,
  ShieldCheck,
  FileText,
  Youtube,
  Facebook,
  Instagram,
} from 'lucide-react';
import { useQueueStore } from '../state/queueStore';
import { Badge } from '../components/common/Badge';
import { copyToClipboard } from '../export/clipboard';
import { exportJobToTXT } from '../export/txt';
import { TitleCandidate, TimelineScene } from '../types/ai';
import { VideoJob } from '../types/queue';

export const AnalysisWorkspace: React.FC = () => {
  const { jobs, selectedJobId, selectJob, updateJobPlatformPackage, queueEngine } = useQueueStore();
  const [platformTab, setPlatformTab] = useState<'youtube' | 'facebook' | 'instagram'>('youtube');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Find currently selected job, or default to first completed job
  const selectedJob =
    jobs.find((j: VideoJob) => j.id === selectedJobId) ||
    jobs.find((j: VideoJob) => j.status === 'COMPLETED') ||
    jobs[0];

  const handleCopy = async (text: string, fieldName: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleSelectTitle = (candidate: TitleCandidate) => {
    if (!selectedJob) return;
    updateJobPlatformPackage(selectedJob.id, (job: VideoJob) => {
      if (job.platformPackage) {
        job.platformPackage.youtube.bestTitle = candidate.title;
        job.platformPackage.youtube.titleCandidates.forEach((t: TitleCandidate) => {
          t.isBest = t.title === candidate.title;
        });
      }
    });
  };

  const handleRegenerateTitles = async () => {
    if (!selectedJob || !selectedJob.analysis || !queueEngine) return;
    setIsRegenerating(true);
    try {
      // Use queue engine's AI provider
      const aiProvider = (queueEngine as unknown as { aiProvider: { regenerateTitles: Function } }).aiProvider;
      if (aiProvider && aiProvider.regenerateTitles) {
        const newTitles = await aiProvider.regenerateTitles(
          selectedJob.analysis,
          selectedJob.language,
          selectedJob.targetUsa
        );
        if (newTitles && newTitles.length > 0) {
          updateJobPlatformPackage(selectedJob.id, (job: VideoJob) => {
            if (job.platformPackage) {
              job.platformPackage.youtube.titleCandidates = newTitles;
              job.platformPackage.youtube.bestTitle = newTitles[0].title;
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to regenerate titles:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!selectedJob) {
    return (
      <div className="py-20 text-center space-y-4">
        <Video className="w-12 h-12 mx-auto text-gray-600" />
        <h3 className="text-lg font-bold text-white">No Video Selected</h3>
        <p className="text-sm text-gray-400">Add videos to the queue or select one from the bulk table to view analysis.</p>
      </div>
    );
  }

  const pkg = selectedJob.platformPackage;
  const analysis = selectedJob.analysis;
  const facts = analysis?.facts;
  const score = analysis?.viralScore;

  return (
    <div className="space-y-4 pb-12">
      {/* Top Video Selector Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-900/80 border border-gray-800 rounded-xl px-4 py-3">
        <div className="flex items-center space-x-3 truncate">
          <div className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex items-center justify-center flex-shrink-0">
            {selectedJob.metadata?.thumbnailUrl ? (
              <img src={selectedJob.metadata.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <Video className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="truncate">
            <span className="text-xs font-bold text-white truncate block">{selectedJob.filename}</span>
            <span className="text-[11px] text-gray-400">
              {analysis?.category || 'Analyzing'} • {selectedJob.language} • {selectedJob.targetUsa ? 'USA ON' : 'GLOBAL'}
            </span>
          </div>
        </div>

        {/* Video switcher dropdown */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={selectedJob.id}
            onChange={(e) => selectJob(e.target.value)}
            className="w-full sm:w-64 bg-gray-950 border border-gray-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none"
          >
            {jobs.map((j: VideoJob) => (
              <option key={j.id} value={j.id}>
                {j.filename} ({j.status})
              </option>
            ))}
          </select>

          {pkg && (
            <button
              onClick={() => exportJobToTXT(selectedJob)}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition-colors whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Export TXT</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-PANEL MASTER WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ========================================================================= */}
        {/* PANEL 1: VIDEO PREVIEW & TIMELINE (3 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
              <Video className="w-4 h-4 text-brand-400" />
              <span>Video Preview</span>
            </h3>

            {/* Thumbnail / Player Preview */}
            <div className="aspect-video w-full rounded-xl bg-black border border-gray-800 overflow-hidden relative flex items-center justify-center">
              {selectedJob.metadata?.thumbnailUrl ? (
                <img src={selectedJob.metadata.thumbnailUrl} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <div className="text-center p-4">
                  <Video className="w-8 h-8 mx-auto text-gray-600 mb-1" />
                  <span className="text-xs text-gray-500">Video preview</span>
                </div>
              )}
            </div>

            {/* Technical Specs */}
            <div className="space-y-1.5 text-xs border-t border-gray-800/80 pt-3 text-gray-400">
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-medium text-white">{selectedJob.metadata?.duration ? `${selectedJob.metadata.duration.toFixed(1)}s` : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span>Resolution:</span>
                <span className="font-medium text-white">{selectedJob.metadata ? `${selectedJob.metadata.width}x${selectedJob.metadata.height}` : '--'}</span>
              </div>
              <div className="flex justify-between">
                <span>Aspect Ratio:</span>
                <span className="font-medium text-white">{selectedJob.metadata?.aspectRatio || '--'}</span>
              </div>
              <div className="flex justify-between">
                <span>File Size:</span>
                <span className="font-medium text-white">{(selectedJob.filesize / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>

            {/* Timeline Breakdown */}
            {analysis?.scenes && analysis.scenes.length > 0 && (
              <div className="border-t border-gray-800/80 pt-3 space-y-2">
                <span className="text-xs font-semibold text-gray-300 block">Scene Timeline:</span>
                <div className="space-y-2">
                  {analysis.scenes.map((scene: TimelineScene, idx: number) => (
                    <div key={idx} className="bg-gray-950/60 border border-gray-800 rounded-lg p-2 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-brand-400 font-semibold">{scene.timeRange}</span>
                        <Badge variant="purple">{scene.type}</Badge>
                      </div>
                      <p className="text-gray-300 text-[11px] leading-relaxed">{scene.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 2: AI UNDERSTANDING & CANONICAL FACTS (4 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Deep AI Analysis</span>
              </h3>
              {analysis && (
                <Badge variant={analysis.confidence === 'High' ? 'success' : 'warning'}>
                  {analysis.confidence} Confidence
                </Badge>
              )}
            </div>

            {/* Video Summary */}
            {analysis && (
              <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-3 text-xs space-y-1">
                <span className="text-gray-400 font-semibold uppercase text-[10px]">Factual Video Summary</span>
                <p className="text-gray-200 leading-relaxed">{analysis.summary}</p>
              </div>
            )}

            {/* Canonical Fact Object Grounding */}
            {facts && (
              <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-brand-400 font-bold uppercase text-[10px] flex items-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Canonical Fact Object</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">100% Grounded</span>
                </div>
                <div className="space-y-1 text-gray-300">
                  <p><span className="text-gray-500">Subject:</span> <strong className="text-white">{facts.subject}</strong></p>
                  <p><span className="text-gray-500">Action:</span> {facts.action}</p>
                  <p><span className="text-gray-500">Setting:</span> {facts.setting}</p>
                  <p><span className="text-gray-500">Emotions:</span> {facts.emotions.join(', ')}</p>
                  <p><span className="text-gray-500">Location:</span> {facts.location || 'None established (factual honesty)'}</p>
                </div>
              </div>
            )}

            {/* Viral Score Card */}
            {score && (
              <div className="bg-gradient-to-br from-brand-950/40 to-gray-950 border border-brand-800/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-white">Estimated Viral Score</span>
                  </div>
                  <span className="text-2xl font-black text-brand-400">{score.overallScore}</span>
                </div>
                <p className="text-[10px] text-gray-400 italic">AI ESTIMATE • NOT A GUARANTEE</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-300 pt-2 border-t border-gray-800/60">
                  <div>Hook Potential: <strong className="text-white">{score.hookPotential}%</strong></div>
                  <div>Retention: <strong className="text-white">{score.retentionPotential}%</strong></div>
                  <div>Clarity: <strong className="text-white">{score.clarity}%</strong></div>
                  <div>Shareability: <strong className="text-white">{score.shareability}%</strong></div>
                </div>
              </div>
            )}

            {/* Smart Explanation */}
            {analysis?.explanation && (
              <div className="space-y-2 text-xs border-t border-gray-800/80 pt-3">
                <span className="text-gray-400 font-semibold uppercase text-[10px] block">AI Reasoning</span>
                <div className="space-y-2 bg-gray-950/60 border border-gray-800 rounded-xl p-3 text-[11px]">
                  <p><strong className="text-gray-300">Why this title?</strong> <span className="text-gray-400">{analysis.explanation.whyThisTitle}</span></p>
                  <p><strong className="text-gray-300">Why these keywords?</strong> <span className="text-gray-400">{analysis.explanation.whyTheseKeywords}</span></p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PANEL 3: GENERATED SOCIAL METADATA PACKAGES (5 cols) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-4 space-y-4">
            {/* Platform Selector Tabs */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setPlatformTab('youtube')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    platformTab === 'youtube'
                      ? 'bg-red-950/80 text-red-400 border border-red-800/60'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5" />
                  <span>YouTube</span>
                </button>
                <button
                  onClick={() => setPlatformTab('facebook')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    platformTab === 'facebook'
                      ? 'bg-blue-950/80 text-blue-400 border border-blue-800/60'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Facebook className="w-3.5 h-3.5" />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => setPlatformTab('instagram')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    platformTab === 'instagram'
                      ? 'bg-pink-950/80 text-pink-400 border border-pink-800/60'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram</span>
                </button>
              </div>

              {pkg && (
                <button
                  onClick={() => {
                    const allText =
                      platformTab === 'youtube'
                        ? `${pkg.youtube.bestTitle}\n\n${pkg.youtube.shortDescription}\n\nTags: ${pkg.youtube.tags.join(', ')}`
                        : platformTab === 'facebook'
                        ? `${pkg.facebook.headline}\n\n${pkg.facebook.caption}`
                        : `${pkg.instagram.reelHook}\n\n${pkg.instagram.caption}`;
                    handleCopy(allText, 'all');
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 text-xs font-medium border border-brand-500/30 transition-colors"
                >
                  {copiedField === 'all' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedField === 'all' ? 'Copied!' : 'Copy All'}</span>
                </button>
              )}
            </div>

            {!pkg ? (
              <div className="py-12 text-center text-gray-500 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-gray-600 animate-spin" />
                <p className="text-xs">Generating platform content...</p>
              </div>
            ) : platformTab === 'youtube' ? (
              /* YOUTUBE PACKAGE */
              <div className="space-y-4 text-xs">
                {/* 10 Candidate Titles */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-300 text-xs">10 Scored Title Candidates</span>
                    <button
                      onClick={handleRegenerateTitles}
                      disabled={isRegenerating}
                      className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      <RotateCcw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                      <span>Regenerate Titles</span>
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                    {pkg.youtube.titleCandidates.map((cand: TitleCandidate, idx: number) => {
                      const isSelected = cand.title === pkg.youtube.bestTitle;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectTitle(cand)}
                          className={`p-2 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-brand-950/70 border-brand-500 text-white font-medium'
                              : 'bg-gray-950/60 border-gray-800 text-gray-300 hover:border-gray-700'
                          }`}
                        >
                          <span className="truncate max-w-[280px]">{cand.title}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-brand-300 ml-2">
                            {cand.overallScore}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Best Title (Editable) */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-400">Best Selected Title</span>
                    <button
                      onClick={() => handleCopy(pkg.youtube.bestTitle, 'title')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      {copiedField === 'title' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pkg.youtube.bestTitle}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateJobPlatformPackage(selectedJob.id, (j: VideoJob) => {
                        if (j.platformPackage) j.platformPackage.youtube.bestTitle = val;
                      });
                    }}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-xs text-white font-medium outline-none focus:border-brand-500"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-400">YouTube Description</span>
                    <button
                      onClick={() => handleCopy(pkg.youtube.shortDescription, 'desc')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      {copiedField === 'desc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={pkg.youtube.shortDescription}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateJobPlatformPackage(selectedJob.id, (j: VideoJob) => {
                        if (j.platformPackage) j.platformPackage.youtube.shortDescription = val;
                      });
                    }}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-gray-200 outline-none focus:border-brand-500"
                  />
                </div>

                {/* Tags & Hashtags */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-400">Tags ({pkg.youtube.tags.length})</span>
                    <button
                      onClick={() => handleCopy(pkg.youtube.tags.join(', '), 'tags')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      {copiedField === 'tags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Tags</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.youtube.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="bg-gray-950 border border-gray-800 text-gray-300 px-2 py-0.5 rounded text-[11px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : platformTab === 'facebook' ? (
              /* FACEBOOK PACKAGE */
              <div className="space-y-4 text-xs">
                {/* Headline */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-400">Facebook Headline</span>
                    <button
                      onClick={() => handleCopy(pkg.facebook.headline, 'fbHeadline')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      {copiedField === 'fbHeadline' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pkg.facebook.headline}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateJobPlatformPackage(selectedJob.id, (j: VideoJob) => {
                        if (j.platformPackage) j.platformPackage.facebook.headline = val;
                      });
                    }}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2.5 text-xs text-white font-medium outline-none"
                  />
                </div>

                {/* Caption */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-400">Conversational Caption</span>
                    <button
                      onClick={() => handleCopy(pkg.facebook.caption, 'fbCaption')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      {copiedField === 'fbCaption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    value={pkg.facebook.caption}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateJobPlatformPackage(selectedJob.id, (j: VideoJob) => {
                        if (j.platformPackage) j.platformPackage.facebook.caption = val;
                      });
                    }}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-gray-200 outline-none"
                  />
                </div>

                {/* Engagement Prompt */}
                <div className="bg-gray-950/60 border border-gray-800 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-400">Viral Engagement Prompt</span>
                  <p className="text-gray-300 text-xs">{pkg.facebook.engagementPrompt}</p>
                </div>
              </div>
            ) : (
              /* INSTAGRAM PACKAGE */
              <div className="space-y-4 text-xs">
                {/* Reel Hook */}
                <div className="bg-pink-950/40 border border-pink-800/40 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-pink-400">On-Screen Reel Hook</span>
                  <p className="text-white font-semibold text-xs">{pkg.instagram.reelHook}</p>
                </div>

                {/* Instagram Caption */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-400">Short-Form Discovery Caption</span>
                    <button
                      onClick={() => handleCopy(pkg.instagram.caption, 'igCaption')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      {copiedField === 'igCaption' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={pkg.instagram.caption}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateJobPlatformPackage(selectedJob.id, (j: VideoJob) => {
                        if (j.platformPackage) j.platformPackage.instagram.caption = val;
                      });
                    }}
                    className="w-full bg-gray-950 border border-gray-700 rounded-lg p-2 text-xs text-gray-200 outline-none"
                  />
                </div>

                {/* Hashtags */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-400">Reels Hashtags</span>
                    <button
                      onClick={() => handleCopy(pkg.instagram.hashtags.join(' '), 'igTags')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center space-x-1"
                    >
                      {copiedField === 'igTags' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pkg.instagram.hashtags.map((ht: string, idx: number) => (
                      <span key={idx} className="bg-gray-950 border border-gray-800 text-pink-300 px-2 py-0.5 rounded text-[11px]">
                        {ht}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
