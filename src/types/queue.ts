import { SupportedLanguage, VideoMetadata, VideoFingerprint, DuplicateMatch } from './video';
import { VideoAnalysis, ValidationFeedback } from './ai';
import { CompletePlatformPackage } from './platform';

export type JobStatus =
  | 'QUEUED'
  | 'PREPARING'
  | 'FINGERPRINTING'
  | 'DUPLICATE_CHECK'
  | 'UPLOADING'
  | 'ANALYZING'
  | 'GENERATING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'DUPLICATE'
  | 'FAILED'
  | 'CANCELLED'
  | 'PAUSED'
  | 'NEEDS_REVIEW';

export interface VideoJob {
  id: string; // Unique job ID
  videoId: string;
  filename: string;
  filesize: number;
  status: JobStatus;
  progress: number; // 0 to 100
  currentStep: number; // 1 to 30
  currentStepDescription: string;
  retryCount: number;
  maxRetries: number;
  error: string | null;
  startedTime: number;
  completedTime: number | null;
  
  // Settings / Overrides for this specific video
  language: SupportedLanguage;
  targetUsa: boolean;
  selectedPlatforms: ('youtube' | 'facebook' | 'instagram')[];
  customInstructions?: string;
  templateStyle?: string;
  
  // Attached results
  metadata?: VideoMetadata;
  fingerprint?: VideoFingerprint;
  duplicateInfo?: DuplicateMatch;
  analysis?: VideoAnalysis;
  platformPackage?: CompletePlatformPackage;
  validationFeedback?: ValidationFeedback;
  latencyMs?: number;
}

export interface BatchSummary {
  batchId: string;
  total: number;
  completed: number;
  failed: number;
  duplicates: number;
  unique: number;
  averageScore: number;
  startTime: number;
  endTime?: number;
}
