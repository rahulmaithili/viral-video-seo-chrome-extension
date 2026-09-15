import { create } from 'zustand';
import { VideoJob } from '../types/queue';
import { QueueEngine } from '../queue/engine';
import { GeminiProvider } from '../ai/providers/gemini';
import { MockAIProvider } from '../ai/providers/mock';
import { useSettingsStore } from './settingsStore';
import { jobRepo } from '../storage/repositories/jobRepo';

interface QueueState {
  jobs: VideoJob[];
  selectedJobId: string | null;
  filterStatus: string;
  searchQuery: string;
  queueEngine: QueueEngine | null;
  interruptedJobs: VideoJob[];
  showCrashRecoveryModal: boolean;

  initQueue: () => Promise<void>;
  addVideos: (files: File[]) => void;
  selectJob: (id: string | null) => void;
  setFilterStatus: (status: string) => void;
  setSearchQuery: (query: string) => void;
  pauseQueue: () => void;
  resumeQueue: () => void;
  retryFailed: () => void;
  deleteJob: (id: string) => void;
  clearAll: () => void;
  updateJobPlatformPackage: (jobId: string, mutator: (job: VideoJob) => void) => void;
  dismissCrashModal: () => void;
  resumeCrashJobs: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  jobs: [],
  selectedJobId: null,
  filterStatus: 'ALL',
  searchQuery: '',
  queueEngine: null,
  interruptedJobs: [],
  showCrashRecoveryModal: false,

  initQueue: async () => {
    const settings = useSettingsStore.getState().settings;

    const aiProvider =
      settings.useMockAI || !settings.geminiApiKey
        ? new MockAIProvider()
        : new GeminiProvider(settings.geminiApiKey, settings.geminiModel);

    const engine = new QueueEngine(aiProvider, settings.concurrency);

    engine.subscribe((jobsList) => {
      set({ jobs: [...jobsList] });
    });

    // Check if there are jobs stored in DB from previous session
    const storedJobs = await jobRepo.getAllJobs();
    const activeStates = ['PREPARING', 'FINGERPRINTING', 'DUPLICATE_CHECK', 'UPLOADING', 'ANALYZING', 'GENERATING', 'VALIDATING'];
    const interrupted = storedJobs.filter((j) => activeStates.includes(j.status));

    set({
      queueEngine: engine,
      interruptedJobs: interrupted,
      showCrashRecoveryModal: interrupted.length > 0,
      jobs: storedJobs,
    });
  },

  addVideos: (files: File[]) => {
    const { queueEngine } = get();
    if (!queueEngine) return;

    const settings = useSettingsStore.getState().settings;

    const newEntries = files.map((file) => {
      const videoId = 'vid_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      const job: VideoJob = {
        id: 'job_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
        videoId,
        filename: file.name,
        filesize: file.size,
        status: 'QUEUED',
        progress: 0,
        currentStep: 0,
        currentStepDescription: 'Queued for processing',
        retryCount: 0,
        maxRetries: settings.maxRetries,
        error: null,
        startedTime: Date.now(),
        completedTime: null,
        language: settings.defaultLanguage,
        targetUsa: settings.defaultTargetUsa,
        selectedPlatforms: settings.defaultPlatforms,
        customInstructions: settings.customInstructions,
        templateStyle: settings.defaultTemplateStyle,
      };

      return { job, file };
    });

    queueEngine.addJobs(newEntries);
  },

  selectJob: (id) => set({ selectedJobId: id }),

  setFilterStatus: (status) => set({ filterStatus: status }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  pauseQueue: () => {
    get().queueEngine?.pause();
  },

  resumeQueue: () => {
    get().queueEngine?.resume();
  },

  retryFailed: () => {
    get().queueEngine?.retryFailed();
  },

  deleteJob: (id) => {
    get().queueEngine?.deleteJob(id);
    if (get().selectedJobId === id) {
      set({ selectedJobId: null });
    }
  },

  clearAll: () => {
    get().queueEngine?.clearQueue();
    set({ selectedJobId: null });
  },

  updateJobPlatformPackage: (jobId, mutator) => {
    const jobs = get().jobs.map((j) => {
      if (j.id === jobId) {
        const copy = { ...j };
        mutator(copy);
        jobRepo.saveJob(copy);
        return copy;
      }
      return j;
    });
    set({ jobs });
  },

  dismissCrashModal: () => {
    set({ showCrashRecoveryModal: false });
  },

  resumeCrashJobs: () => {
    const { interruptedJobs } = get();
    for (const j of interruptedJobs) {
      j.status = 'QUEUED';
      j.progress = 0;
      jobRepo.saveJob(j);
    }
    set({ showCrashRecoveryModal: false });
  },
}));
