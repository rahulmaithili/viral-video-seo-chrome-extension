import { jobRepo } from '../storage/repositories/jobRepo';
import { VideoJob } from '../types/queue';

export async function detectCrashState(): Promise<{ hasInterrupted: boolean; jobs: VideoJob[] }> {
  try {
    const interrupted = await jobRepo.getInterruptedJobs();
    return {
      hasInterrupted: interrupted.length > 0,
      jobs: interrupted,
    };
  } catch (err) {
    console.warn('Failed to inspect crash state from DB:', err);
    return { hasInterrupted: false, jobs: [] };
  }
}

export async function discardInterruptedBatch(): Promise<void> {
  const interrupted = await jobRepo.getInterruptedJobs();
  for (const job of interrupted) {
    await jobRepo.deleteJob(job.id);
  }
}
