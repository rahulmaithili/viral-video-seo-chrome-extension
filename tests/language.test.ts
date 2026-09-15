import { describe, it, expect } from 'vitest';
import { validateLanguage } from '../src/content/validation/languageValidator';
import { CompletePlatformPackage } from '../src/types/platform';

function createMockPackage(title: string, caption: string): CompletePlatformPackage {
  return {
    videoId: 'test_vid',
    language: 'English',
    targetUsa: false,
    youtube: {
      titleCandidates: [],
      bestTitle: title,
      titleScore: 90,
      shortDescription: caption,
      longDescription: caption,
      seoDescription: caption,
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
      caption: caption,
      description: caption,
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
      caption: caption,
      searchKeywords: [],
      hashtags: [],
      cta: '',
    },
    generatedAt: Date.now(),
  };
}

describe('Language Validation Engine', () => {
  it('passes authentic Hindi in Devanagari script', () => {
    const pkg = createMockPackage(
      'यह कुत्ता सच में समझ रहा था कि पिज़्ज़ा उसी का है 😂',
      'देखिए जब यह प्यारा डॉग चुपके से पिज़्ज़ा चुराने की कोशिश करता है।'
    );
    const res = validateLanguage(pkg, 'Hindi');
    expect(res.passed).toBe(true);
    expect(res.detectedLanguage).toContain('Hindi');
  });

  it('rejects English text when Hindi is selected', () => {
    const pkg = createMockPackage(
      'He really thought nobody was looking at him stealing pizza 😂',
      'Watch this hungry dog sneaking pizza off the table.'
    );
    const res = validateLanguage(pkg, 'Hindi');
    expect(res.passed).toBe(false);
    expect(res.error).toContain('lacks proper Devanagari');
  });

  it('passes natural Roman Hinglish', () => {
    const pkg = createMockPackage(
      'Is dog ko sach mein laga pizza usi ka hai 😂',
      'Dekho iska cute face jab ye pakda gaya pizza steal karte hue!'
    );
    const res = validateLanguage(pkg, 'Hinglish');
    expect(res.passed).toBe(true);
    expect(res.detectedLanguage).toContain('Hinglish');
  });

  it('passes natural English output', () => {
    const pkg = createMockPackage(
      'Golden Retriever Caught Red-Handed Stealing Pizza Slice',
      'Hilarious pet reaction as dog attempts stealth pizza robbery.'
    );
    const res = validateLanguage(pkg, 'English');
    expect(res.passed).toBe(true);
  });
});
