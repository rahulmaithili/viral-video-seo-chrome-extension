import { CompletePlatformPackage } from '../../types/platform';

/**
 * Calculates simple Jaccard word similarity between two strings.
 */
function jaccardSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const set2 = new Set(str2.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export interface DuplicateOutputCheckResult {
  isDuplicateOutput: boolean;
  maxSimilarity: number;
  matchedTitle?: string;
}

export function checkDuplicateOutput(
  candidatePkg: CompletePlatformPackage,
  existingPackages: CompletePlatformPackage[],
  threshold = 0.85
): DuplicateOutputCheckResult {
  const candidateTitle = candidatePkg.youtube.bestTitle;

  for (const existing of existingPackages) {
    if (existing.videoId === candidatePkg.videoId) continue;

    const existingTitle = existing.youtube.bestTitle;
    const similarity = jaccardSimilarity(candidateTitle, existingTitle);

    if (similarity >= threshold) {
      return {
        isDuplicateOutput: true,
        maxSimilarity: Math.round(similarity * 100),
        matchedTitle: existingTitle,
      };
    }
  }

  return {
    isDuplicateOutput: false,
    maxSimilarity: 0,
  };
}
