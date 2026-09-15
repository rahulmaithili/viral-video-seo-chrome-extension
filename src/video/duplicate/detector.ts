import { VideoFingerprint, DuplicateMatch } from '../../types/video';
import { hammingDistanceHex } from '../frames/sampler';

export interface FingerprintWithRef {
  fingerprint: VideoFingerprint;
  filename: string;
  videoId: string;
}

/**
 * Compares a candidate video fingerprint against existing fingerprints.
 */
export function checkDuplicate(
  candidate: VideoFingerprint,
  existingList: FingerprintWithRef[],
  threshold = 90
): DuplicateMatch {
  for (const item of existingList) {
    // Don't compare against itself
    if (item.fingerprint.id === candidate.id || item.videoId === candidate.id) {
      continue;
    }

    // LEVEL 1: Exact SHA-256 binary match
    if (candidate.sha256 && item.fingerprint.sha256 && candidate.sha256 === item.fingerprint.sha256) {
      return {
        isDuplicate: true,
        score: 100,
        matchedVideoId: item.videoId,
        matchedFilename: item.filename,
        reason: `Exact binary match (identical SHA-256 hash). Matches "${item.filename}".`,
        level: 1,
      };
    }

    // LEVEL 2 & 3: Metadata & Perceptual dHash comparison
    if (
      candidate.perceptualHashes &&
      candidate.perceptualHashes.length > 0 &&
      item.fingerprint.perceptualHashes &&
      item.fingerprint.perceptualHashes.length > 0
    ) {
      const minLen = Math.min(candidate.perceptualHashes.length, item.fingerprint.perceptualHashes.length);
      let totalDist = 0;

      for (let i = 0; i < minLen; i++) {
        totalDist += hammingDistanceHex(candidate.perceptualHashes[i], item.fingerprint.perceptualHashes[i]);
      }

      const avgDist = totalDist / minLen; // 0 to 64
      // Max possible distance is 64; 0 distance = 100% similarity
      const visualSimilarity = Math.max(0, Math.min(100, Math.round((1 - avgDist / 64) * 100)));

      // If metadata signature is identical (same duration, resolution, size)
      const isMetaExact = candidate.metadataSignature === item.fingerprint.metadataSignature;
      const combinedScore = isMetaExact ? Math.max(visualSimilarity, 96) : visualSimilarity;

      if (combinedScore >= threshold) {
        return {
          isDuplicate: true,
          score: combinedScore,
          matchedVideoId: item.videoId,
          matchedFilename: item.filename,
          reason: `High perceptual visual similarity (${combinedScore}%). Matches "${item.filename}".`,
          level: 3,
        };
      } else if (combinedScore >= 75) {
        // High similarity warning but below hard duplicate threshold
        return {
          isDuplicate: false,
          score: combinedScore,
          matchedVideoId: item.videoId,
          matchedFilename: item.filename,
          reason: `Possible visual similarity (${combinedScore}%). Matches "${item.filename}".`,
          level: 3,
        };
      }
    }
  }

  return {
    isDuplicate: false,
    score: 0,
    reason: 'Unique video content.',
    level: 1,
  };
}
