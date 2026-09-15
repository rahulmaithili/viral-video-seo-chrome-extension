import { SupportedLanguage } from './video';
import { TitleCandidate } from './ai';

export interface YouTubePackage {
  titleCandidates: TitleCandidate[];
  bestTitle: string;
  titleScore: number;
  shortDescription: string;
  longDescription: string;
  seoDescription: string;
  tags: string[];
  hashtags: string[];
  primaryKeywords: string[];
  secondaryKeywords: string[];
  longTailKeywords: string[];
  searchIntent: string;
  hook: string;
  cta: string;
}

export interface FacebookPackage {
  headline: string;
  caption: string;
  description: string;
  hashtags: string[];
  keywords: string[];
  cta: string;
  engagementPrompt: string;
  shortVersion: string;
  longVersion: string;
}

export interface InstagramPackage {
  reelHook: string;
  firstLine: string;
  caption: string;
  searchKeywords: string[];
  hashtags: string[];
  cta: string;
}

export interface CompletePlatformPackage {
  videoId: string;
  language: SupportedLanguage;
  targetUsa: boolean;
  youtube: YouTubePackage;
  facebook: FacebookPackage;
  instagram: InstagramPackage;
  generatedAt: number;
}
