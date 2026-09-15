import { SupportedLanguage } from './video';

export interface CanonicalVideoFacts {
  subject: string;
  action: string;
  setting: string;
  emotions: string[];
  location: string | null;
  locationConfidence: number; // 0 to 1
  brands: string[];
  people: string[];
  animals: string[];
  objects: string[];
  onScreenText: string[];
  spokenLanguage?: string;
  confidence: number; // 0 to 1
}

export interface TimelineScene {
  timeRange: string; // e.g. "00:00-00:02"
  description: string;
  type: 'hook' | 'action' | 'transition' | 'payoff' | 'outro';
}

export interface ViralAngle {
  id: string;
  name: string;
  hookIdea: string;
  score: number; // 0 to 100
  selected: boolean;
}

export interface KeywordItem {
  term: string;
  category: 'primary' | 'secondary' | 'long_tail' | 'search_intent' | 'trend';
  relevanceScore: number; // 0-100
  trendScore: number | null; // null if no real trend data
  platformScore: number; // 0-100
  opportunityScore: number; // 0-100
}

export interface TitleCandidate {
  title: string;
  hookScore: number;
  clarityScore: number;
  relevanceScore: number;
  searchScore: number;
  shareabilityScore: number;
  overallScore: number;
  isBest?: boolean;
}

export interface ViralScoreBreakdown {
  overallScore: number; // 0-100
  hookPotential: number;
  retentionPotential: number;
  clarity: number;
  emotion: number;
  originality: number;
  shareability: number;
  commentPotential: number;
  explanation: string;
}

export interface VideoAnalysis {
  videoId: string;
  summary: string;
  category: string;
  subcategory: string;
  niche: string;
  contentType: string;
  facts: CanonicalVideoFacts;
  scenes: TimelineScene[];
  targetAudience: string[];
  viralAngles: ViralAngle[];
  bestViralAngle: string;
  viralScore: ViralScoreBreakdown;
  keywords: KeywordItem[];
  confidence: 'High' | 'Medium' | 'Low';
  explanation: {
    whyThisTitle: string;
    whyTheseKeywords: string;
    whyThisViralScore: string;
  };
}

export interface AIAnalysisRequest {
  videoId: string;
  filename: string;
  duration: number;
  aspectRatio: string;
  frames: { timestamp: number; dataUrl: string }[];
  language: SupportedLanguage;
  targetUsa: boolean;
  customInstructions?: string;
  templateStyle?: string;
}

export interface ValidationFeedback {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  warnings: string[];
  needsReview: boolean;
}
