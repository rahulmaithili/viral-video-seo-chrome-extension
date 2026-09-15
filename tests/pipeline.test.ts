import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../src/ai/providers/mock';
import { filterAndScoreKeywords } from '../src/keywords/engine';
import { CanonicalVideoFacts, KeywordItem } from '../src/types/ai';

describe('AI Provider & Keyword Engine Integration', () => {
  const mockProvider = new MockAIProvider();

  it('analyzes video and returns canonical facts with viral score', async () => {
    const analysis = await mockProvider.analyzeVideo({
      videoId: 'test_dog_vid',
      filename: 'golden_retriever_eating.mp4',
      duration: 15.0,
      aspectRatio: '16:9',
      frames: [],
      language: 'English',
      targetUsa: true,
    });

    expect(analysis.category).toContain('Animals');
    expect(analysis.facts.subject).toContain('Golden Retriever');
    expect(analysis.viralScore.overallScore).toBeGreaterThan(70);
    expect(analysis.viralAngles.length).toBeGreaterThanOrEqual(3);
    expect(analysis.scenes.length).toBeGreaterThanOrEqual(3);
  });

  it('generates 10 scored candidate titles for YouTube', async () => {
    const analysis = await mockProvider.analyzeVideo({
      videoId: 'test_food_vid',
      filename: 'neapolitan_pizza_recipe.mp4',
      duration: 30.0,
      aspectRatio: '9:16',
      frames: [],
      language: 'English',
      targetUsa: true,
    });

    const pkg = await mockProvider.generatePlatformPackage(analysis, 'English', true);
    expect(pkg.youtube.titleCandidates.length).toBe(10);
    expect(pkg.youtube.bestTitle).toBeTruthy();
    expect(pkg.facebook.headline).toBeTruthy();
    expect(pkg.instagram.reelHook).toBeTruthy();
  });

  it('filters out spam and irrelevant buzzwords while preserving grounded keywords', () => {
    const facts: CanonicalVideoFacts = {
      subject: 'Golden Retriever',
      action: 'Stealing pizza',
      setting: 'Living room',
      emotions: ['funny'],
      location: null,
      locationConfidence: 0,
      brands: [],
      people: [],
      animals: ['Golden Retriever'],
      objects: ['pizza'],
      onScreenText: [],
      confidence: 0.95,
    };

    const rawKeywords: KeywordItem[] = [
      { term: 'golden retriever', category: 'primary', relevanceScore: 98, trendScore: null, platformScore: 90, opportunityScore: 94 },
      { term: 'pizza dog', category: 'secondary', relevanceScore: 90, trendScore: null, platformScore: 85, opportunityScore: 88 },
      { term: 'mrbeast', category: 'trend', relevanceScore: 20, trendScore: null, platformScore: 90, opportunityScore: 40 }, // Spam!
      { term: 'elonmusk', category: 'trend', relevanceScore: 10, trendScore: null, platformScore: 90, opportunityScore: 30 }, // Spam!
      { term: 'unrelated topic', category: 'primary', relevanceScore: 30, trendScore: null, platformScore: 50, opportunityScore: 35 }, // Below 70!
    ];

    const filtered = filterAndScoreKeywords(rawKeywords, facts, 'Animals & Pets', 70);

    const terms = filtered.map((k) => k.term);
    expect(terms).toContain('golden retriever');
    expect(terms).toContain('pizza dog');
    expect(terms).not.toContain('mrbeast');
    expect(terms).not.toContain('elonmusk');
    expect(terms).not.toContain('unrelated topic');
  });
});
