import { KeywordItem, CanonicalVideoFacts } from '../types/ai';

// Blacklist of unrelated viral buzzwords that must not be injected without factual proof
const IRRELEVANT_SPAM_WORDS = new Set([
  'mrbeast',
  'elonmusk',
  'trump',
  'biden',
  'cr7',
  'ronaldo',
  'messi',
  'crypto',
  'bitcoin',
  'giveaway',
  'free iphone',
  'leak',
  'shocking news',
  'gta 6',
  'illuminati',
]);

/**
 * Validates and scores keywords against canonical facts
 */
export function filterAndScoreKeywords(
  rawKeywords: KeywordItem[],
  facts: CanonicalVideoFacts,
  category: string,
  minRelevance = 70
): KeywordItem[] {
  const seenTerms = new Set<string>();
  const filtered: KeywordItem[] = [];

  const factTokens = new Set<string>([
    ...facts.subject.toLowerCase().split(/\s+/),
    ...facts.action.toLowerCase().split(/\s+/),
    ...facts.setting.toLowerCase().split(/\s+/),
    ...category.toLowerCase().split(/\s+/),
    ...facts.animals.map((a) => a.toLowerCase()),
    ...facts.objects.map((o) => o.toLowerCase()),
    ...facts.brands.map((b) => b.toLowerCase()),
  ]);

  for (const kw of rawKeywords) {
    const termClean = kw.term.trim().toLowerCase();
    if (!termClean || termClean.length < 2) continue;

    // Check spam blacklist
    if (IRRELEVANT_SPAM_WORDS.has(termClean)) {
      continue;
    }

    // Deduplicate near identical terms
    if (seenTerms.has(termClean)) {
      continue;
    }

    // Score relevance: Does it intersect with fact tokens or category?
    const kwTokens = termClean.split(/\s+/);
    let tokenOverlap = 0;
    for (const t of kwTokens) {
      if (factTokens.has(t)) tokenOverlap++;
    }

    let calculatedRelevance = kw.relevanceScore;
    if (tokenOverlap > 0) {
      calculatedRelevance = Math.max(calculatedRelevance, 85);
    } else if (calculatedRelevance < minRelevance) {
      // Reject unrelated keyword
      continue;
    }

    seenTerms.add(termClean);

    filtered.push({
      ...kw,
      relevanceScore: calculatedRelevance,
      opportunityScore: Math.round((calculatedRelevance * 0.7) + (kw.platformScore * 0.3)),
    });
  }

  // Sort by opportunityScore descending
  return filtered.sort((a, b) => b.opportunityScore - a.opportunityScore);
}
