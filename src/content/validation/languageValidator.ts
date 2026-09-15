import { SupportedLanguage } from '../../types/video';
import { CompletePlatformPackage } from '../../types/platform';

export interface LanguageValidationResult {
  passed: boolean;
  score: number;
  detectedLanguage: string;
  error?: string;
}

const DEVANAGARI_REGEX = /[\u0900-\u097F]/g;

// Common Roman Hinglish vocabulary markers
const HINGLISH_MARKERS = new Set([
  'hai', 'karega', 'karo', 'dekho', 'kya', 'kaise', 'mein', 'yeh', 'iska',
  'dekhkar', 'kar', 'raha', 'rahe', 'hoga', 'wali', 'wala', 'nahi', 'bahut', 'sabse'
]);

export function validateLanguage(
  pkg: CompletePlatformPackage,
  targetLanguage: SupportedLanguage
): LanguageValidationResult {
  const sample = `${pkg.youtube.bestTitle} ${pkg.facebook.caption} ${pkg.instagram.caption}`;

  if (targetLanguage === 'Hindi') {
    const devanagariMatches = sample.match(DEVANAGARI_REGEX) || [];
    const devanagariCount = devanagariMatches.length;

    // Must have a significant amount of Devanagari characters
    if (devanagariCount < 10) {
      return {
        passed: false,
        score: 20,
        detectedLanguage: 'English or Roman script',
        error: 'Target language is Hindi, but output lacks proper Devanagari script (हिन्दी).',
      };
    }

    return {
      passed: true,
      score: 100,
      detectedLanguage: 'Hindi (Devanagari)',
    };
  }

  if (targetLanguage === 'Hinglish') {
    // Should NOT be pure Devanagari
    const devanagariMatches = sample.match(DEVANAGARI_REGEX) || [];
    if (devanagariMatches.length > 15) {
      return {
        passed: false,
        score: 30,
        detectedLanguage: 'Hindi (Devanagari)',
        error: 'Target language is Hinglish (Roman Hindi), but output contains Devanagari characters.',
      };
    }

    // Check for presence of Roman Hinglish words
    const tokens = sample.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
    let markerCount = 0;
    for (const t of tokens) {
      if (HINGLISH_MARKERS.has(t)) markerCount++;
    }

    if (markerCount < 2) {
      return {
        passed: false,
        score: 45,
        detectedLanguage: 'Standard English',
        error: 'Target language is Hinglish, but output appears to be standard English without conversational Roman Hindi phrasing.',
      };
    }

    return {
      passed: true,
      score: 95,
      detectedLanguage: 'Hinglish (Roman Hindi)',
    };
  }

  // English
  const devanagariMatches = sample.match(DEVANAGARI_REGEX) || [];
  if (devanagariMatches.length > 5) {
    return {
      passed: false,
      score: 40,
      detectedLanguage: 'Hindi (Devanagari)',
      error: 'Target language is English, but output contains Devanagari text.',
    };
  }

  return {
    passed: true,
    score: 100,
    detectedLanguage: 'English',
  };
}
