import { VideoJob } from '../types/queue';
import { extractVideoMetadata } from '../video/metadata/extractor';
import { sampleVideoFrames } from '../video/frames/sampler';
import { generateVideoFingerprint } from '../video/fingerprint/engine';
import { checkDuplicate, FingerprintWithRef } from '../video/duplicate/detector';
import { AIProvider } from '../ai/providers/base';
import { HonestTrendProvider } from '../trends/providers/mock';
import { filterAndScoreKeywords } from '../keywords/engine';
import { validateFactuality } from './validation/factValidator';
import { validateLanguage } from './validation/languageValidator';
import { checkDuplicateOutput } from './validation/duplicateOutputValidator';
import { videoRepo } from '../storage/repositories/videoRepo';
import { analysisRepo } from '../storage/repositories/analysisRepo';
import { historyRepo } from '../storage/repositories/historyRepo';
import { jobRepo } from '../storage/repositories/jobRepo';
import { CompletePlatformPackage } from '../types/platform';

export interface PipelineProgressCallback {
  (step: number, stepName: string, progress: number): void;
}

export async function runVideoPipeline(
  job: VideoJob,
  file: File,
  aiProvider: AIProvider,
  existingFingerprints: FingerprintWithRef[],
  existingBatchPackages: CompletePlatformPackage[],
  onProgress?: PipelineProgressCallback
): Promise<VideoJob> {
  const startTime = Date.now();

  const updateStep = (step: number, stepName: string, pct: number) => {
    job.currentStep = step;
    job.currentStepDescription = stepName;
    job.progress = pct;
    if (onProgress) {
      onProgress(step, stepName, pct);
    }
  };

  try {
    // STEP 01: INGEST
    updateStep(1, 'Ingesting video file and technical containers', 5);
    job.status = 'PREPARING';

    // STEP 02: VALIDATE
    updateStep(2, 'Validating file integrity and container format', 8);
    const metadata = await extractVideoMetadata(file);
    job.metadata = metadata;
    await videoRepo.saveVideo(job.videoId, metadata);

    // STEP 03: FINGERPRINT
    updateStep(3, 'Generating multi-level fingerprint (SHA-256, metadata, dHash)', 15);
    job.status = 'FINGERPRINTING';
    const samples = await sampleVideoFrames(file, metadata.duration, 5);
    if (samples.length > 0) {
      metadata.thumbnailUrl = samples[0].dataUrl;
    }
    const fingerprint = await generateVideoFingerprint(job.videoId, file, metadata, samples);
    job.fingerprint = fingerprint;
    await videoRepo.saveFingerprint(fingerprint);

    // STEP 04: DUPLICATE CHECK
    updateStep(4, 'Scanning duplicate database and current batch', 22);
    job.status = 'DUPLICATE_CHECK';
    const duplicateMatch = checkDuplicate(fingerprint, existingFingerprints, 90);
    job.duplicateInfo = duplicateMatch;

    if (duplicateMatch.isDuplicate) {
      job.status = 'DUPLICATE';
      job.progress = 100;
      job.completedTime = Date.now();
      await jobRepo.saveJob(job);
      return job;
    }

    // STEP 05 - 08: VIDEO UNDERSTANDING, FACTS, CATEGORY, AUDIENCE
    updateStep(5, 'Deep video understanding & frame analysis', 35);
    job.status = 'ANALYZING';
    const analysis = await aiProvider.analyzeVideo({
      videoId: job.videoId,
      filename: job.filename,
      duration: metadata.duration,
      aspectRatio: metadata.aspectRatio,
      frames: samples.map((s) => ({ timestamp: s.timestamp, dataUrl: s.dataUrl })),
      language: job.language,
      targetUsa: job.targetUsa,
      customInstructions: job.customInstructions,
      templateStyle: job.templateStyle,
    });
    job.analysis = analysis;

    // STEP 09: TREND INTELLIGENCE
    updateStep(9, 'Querying honest trend provider (No fake data)', 45);
    const trendProvider = new HonestTrendProvider(false);
    await trendProvider.getTrendData(job.filename);

    // STEP 10 - 11: KEYWORDS & RELEVANCE FILTER
    updateStep(10, 'Filtering keywords against canonical facts (Score >= 70)', 52);
    analysis.keywords = filterAndScoreKeywords(
      analysis.keywords,
      analysis.facts,
      analysis.category,
      70
    );

    // STEP 12 - 20: VIRAL ANGLE, TITLES, CAPTIONS, PLATFORMS, LANGUAGE, USA TARGETING
    updateStep(13, 'Generating platform packages (YouTube, Facebook, Instagram)', 65);
    job.status = 'GENERATING';
    const platformPkg = await aiProvider.generatePlatformPackage(
      analysis,
      job.language,
      job.targetUsa,
      job.customInstructions,
      job.templateStyle
    );
    job.platformPackage = platformPkg;

    // STEP 21 - 24: VALIDATION PASSES
    updateStep(21, 'Running secondary validation: Fact, Language & Keyword integrity', 80);
    job.status = 'VALIDATING';

    const factVal = validateFactuality(platformPkg, analysis.facts);
    const langVal = validateLanguage(platformPkg, job.language);
    const dupOutputVal = checkDuplicateOutput(platformPkg, existingBatchPackages, 0.85);

    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    if (!factVal.passed) {
      validationWarnings.push(...factVal.violations);
    }
    if (!langVal.passed) {
      validationErrors.push(langVal.error || 'Language mismatch detected.');
    }
    if (dupOutputVal.isDuplicateOutput) {
      validationWarnings.push(`Generated titles closely match existing video in batch (${dupOutputVal.maxSimilarity}% similarity).`);
    }

    job.validationFeedback = {
      isValid: validationErrors.length === 0,
      score: Math.min(factVal.score, langVal.score),
      errors: validationErrors,
      warnings: validationWarnings,
      needsReview: validationErrors.length > 0 || validationWarnings.length > 0,
    };

    // Retry once if language validation failed
    if (!langVal.passed && job.retryCount < job.maxRetries) {
      job.retryCount++;
      updateStep(19, `Regenerating package to fix language adherence (Attempt ${job.retryCount})`, 85);
      const retryPkg = await aiProvider.generatePlatformPackage(
        analysis,
        job.language,
        job.targetUsa,
        job.customInstructions,
        job.templateStyle
      );
      job.platformPackage = retryPkg;
      const retryLangVal = validateLanguage(retryPkg, job.language);
      if (retryLangVal.passed) {
        job.validationFeedback.errors = [];
        job.validationFeedback.isValid = true;
      }
    }

    // STEP 25 - 27: QUALITY SCORE, VIRAL SCORE, SAVE
    updateStep(27, 'Saving analysis, platform outputs & history to IndexedDB', 95);
    await analysisRepo.saveAnalysis(analysis);
    await analysisRepo.savePackage(job.platformPackage);
    await historyRepo.saveHistoryItem(job);

    job.latencyMs = Date.now() - startTime;
    job.completedTime = Date.now();
    job.status = job.validationFeedback.needsReview && !job.validationFeedback.isValid ? 'NEEDS_REVIEW' : 'COMPLETED';
    job.progress = 100;
    updateStep(30, 'Ready for User Review, Copy & Export', 100);

    await jobRepo.saveJob(job);
    return job;
  } catch (err: unknown) {
    job.status = 'FAILED';
    job.error = err instanceof Error ? err.message : String(err);
    job.completedTime = Date.now();
    job.latencyMs = Date.now() - startTime;
    await jobRepo.saveJob(job);
    return job;
  }
}
