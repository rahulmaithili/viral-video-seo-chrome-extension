import { describe, it, expect } from 'vitest';
import { validateFactuality } from '../src/content/validation/factValidator';
import { CanonicalVideoFacts } from '../src/types/ai';
import { CompletePlatformPackage } from '../src/types/platform';

function createMockPackageWithText(title: string, desc: string): CompletePlatformPackage {
  return {
    videoId: 'test_vid',
    language: 'English',
    targetUsa: true,
    youtube: {
      titleCandidates: [],
      bestTitle: title,
      titleScore: 90,
      shortDescription: desc,
      longDescription: desc,
      seoDescription: desc,
      tags: [],
      hashtags: [],
      primaryKeywords: [],
      secondaryKeywords: [],
      longTailKeywords: [],
      searchIntent: '',
      hook: '',
      cta: '',
    },
    facebook: {
      headline: title,
      caption: desc,
      description: desc,
      hashtags: [],
      keywords: [],
      cta: '',
      engagementPrompt: '',
      shortVersion: '',
      longVersion: '',
    },
    instagram: {
      reelHook: title,
      firstLine: title,
      caption: desc,
      searchKeywords: [],
      hashtags: [],
      cta: '',
    },
    generatedAt: Date.now(),
  };
}

describe('Canonical Fact Validation Engine', () => {
  const canonicalFacts: CanonicalVideoFacts = {
    subject: 'Golden Retriever',
    action: 'Stealing pizza slice from table',
    setting: 'Living room',
    emotions: ['funny', 'guilty'],
    location: null, // Unknown location!
    locationConfidence: 0,
    brands: [],
    people: [],
    animals: ['Golden Retriever'],
    objects: ['pizza'],
    onScreenText: [],
    confidence: 0.95,
  };

  it('passes strictly grounded content that matches video facts', () => {
    const pkg = createMockPackageWithText(
      'Golden Retriever Caught Stealing Pizza Slice!',
      'Watch this hungry dog get caught sneaking pizza in the living room.'
    );
    const res = validateFactuality(pkg, canonicalFacts);
    expect(res.passed).toBe(true);
    expect(res.violations.length).toBe(0);
  });

  it('catches and flags hallucinated locations when location was not established', () => {
    const pkg = createMockPackageWithText(
      'Dog in New York Steals Giant Pizza Slice!',
      'Watch this wild dog in New York cafe.'
    );
    const res = validateFactuality(pkg, canonicalFacts);
    expect(res.passed).toBe(false);
    expect(res.violations.some((v) => v.includes('New York'))).toBe(true);
  });

  it('catches and flags conflicting animal breeds', () => {
    const pkg = createMockPackageWithText(
      'Crazy German Shepherd Jumps On Pizza Box',
      'Watch this German Shepherd grab food.'
    );
    const res = validateFactuality(pkg, canonicalFacts);
    expect(res.passed).toBe(false);
    expect(res.violations.some((v) => v.includes('German Shepherd'))).toBe(true);
  });
});
