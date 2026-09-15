import { VideoJob } from '../types/queue';
import { AIProvider } from '../ai/providers/base';
import { runVideoPipeline } from '../content/pipeline';
import { videoRepo } from '../storage/repositories/videoRepo';
import { FingerprintWithRef } from '../video/duplicate/detector';
import { CompletePlatformPackage } from '../types/platform';
import { jobRepo } from '../storage/repositories/jobRepo';

export type QueueEventCallback = (jobs: VideoJob[]) => void;

export class QueueEngine {
  private jobs: Map<string, VideoJob> = new Map();
  private fileMap: Map<string, File> = new Map();
  private runningJobs: Set<string> = new Set();
  private isPaused = false;
  private concurrency = 3;
  private aiProvider: AIProvider;
  private listeners: Set<QueueEventCallback> = new Set();

  constructor(aiProvider: AIProvider, concurrency = 3) {
    this.aiProvider = aiProvider;
    this.concurrency = concurrency;
  }

  setAIProvider(provider: AIProvider) {
    this.aiProvider = provider;
  }

  setConcurrency(concurrency: 1 | 2 | 3 | 5) {
    this.concurrency = concurrency;
    this.processNext();
  }

  subscribe(cb: QueueEventCallback) {
    this.listeners.add(cb);
    cb(this.getJobs());
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify() {
    const list = this.getJobs();
    for (const cb of this.listeners) {
      cb(list);
    }
  }

  getJobs(): VideoJob[] {
    return Array.from(this.jobs.values());
  }

  getJob(id: string): VideoJob | undefined {
    return this.jobs.get(id);
  }

  addJobs(newJobs: { job: VideoJob; file: File }[]) {
    for (const { job, file } of newJobs) {
      this.jobs.set(job.id, job);
      this.fileMap.set(job.id, file);
      jobRepo.saveJob(job);
    }
    this.notify();
    this.processNext();
  }

  pause() {
    this.isPaused = true;
    for (const job of this.jobs.values()) {
      if (job.status === 'QUEUED') {
        job.status = 'PAUSED';
        jobRepo.saveJob(job);
      }
    }
    this.notify();
  }

  resume() {
    this.isPaused = false;
    for (const job of this.jobs.values()) {
      if (job.status === 'PAUSED') {
        job.status = 'QUEUED';
        jobRepo.saveJob(job);
      }
    }
    this.notify();
    this.processNext();
  }

  cancelJob(id: string) {
    const job = this.jobs.get(id);
    if (job) {
      job.status = 'CANCELLED';
      job.completedTime = Date.now();
      jobRepo.saveJob(job);
      this.runningJobs.delete(id);
      this.fileMap.delete(id);
      this.notify();
      this.processNext();
    }
  }

  deleteJob(id: string) {
    this.jobs.delete(id);
    this.runningJobs.delete(id);
    this.fileMap.delete(id);
    jobRepo.deleteJob(id);
    this.notify();
    this.processNext();
  }

  clearQueue() {
    this.jobs.clear();
    this.runningJobs.clear();
    this.fileMap.clear();
    jobRepo.clearAllJobs();
    this.notify();
  }

  retryFailed() {
    for (const job of this.jobs.values()) {
      if (job.status === 'FAILED' || job.status === 'CANCELLED') {
        job.status = 'QUEUED';
        job.error = null;
        job.progress = 0;
        job.currentStep = 0;
        jobRepo.saveJob(job);
      }
    }
    this.notify();
    this.processNext();
  }

  private async processNext() {
    if (this.isPaused) return;

    while (this.runningJobs.size < this.concurrency) {
      const nextJob = Array.from(this.jobs.values()).find((j) => j.status === 'QUEUED');
      if (!nextJob) break;

      const file = this.fileMap.get(nextJob.id);
      if (!file) {
        nextJob.status = 'FAILED';
        nextJob.error = 'Video file reference missing from memory.';
        jobRepo.saveJob(nextJob);
        this.notify();
        continue;
      }

      this.runningJobs.add(nextJob.id);
      this.runJob(nextJob, file);
    }
  }

  private async runJob(job: VideoJob, file: File) {
    try {
      // Gather existing fingerprints from DB and memory for duplicate check
      const dbFingerprints = await videoRepo.getAllFingerprints();
      const existingRefs: FingerprintWithRef[] = dbFingerprints.map((fp) => ({
        fingerprint: fp,
        filename: fp.id,
        videoId: fp.id,
      }));

      // Gather completed platform packages from current batch
      const existingPackages: CompletePlatformPackage[] = Array.from(this.jobs.values())
        .map((j) => j.platformPackage)
        .filter((p): p is CompletePlatformPackage => Boolean(p));

      await runVideoPipeline(
        job,
        file,
        this.aiProvider,
        existingRefs,
        existingPackages,
        (_step, _stepName, _pct) => {
          this.notify();
        }
      );
    } catch (err: unknown) {
      job.status = 'FAILED';
      job.error = err instanceof Error ? err.message : String(err);
      job.completedTime = Date.now();
      await jobRepo.saveJob(job);
    } finally {
      this.runningJobs.delete(job.id);
      this.notify();
      this.processNext();
    }
  }
}
