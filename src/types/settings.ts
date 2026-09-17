import { SupportedLanguage } from './video';

export type HookTone = 'viral_shock' | 'devotional' | 'comedy' | 'mystery' | 'balanced';

export interface NichePreset {
  id: string;
  name: string;
  pageKeywords: string[];
  masterPrompt: string;
  language: SupportedLanguage;
  targetUsa: boolean;
  fixedHashtags: string;
  defaultHookTone?: HookTone;
}

export interface UserSettings {
  geminiApiKey: string;
  geminiModel: string;
  useMockAI: boolean;
  defaultLanguage: SupportedLanguage;
  defaultTargetUsa: boolean;
  defaultPlatforms: ('youtube' | 'facebook' | 'instagram')[];
  concurrency: 1 | 2 | 3 | 5;
  duplicateThreshold: number; // default: 90
  keywordRelevanceThreshold: number; // default: 70
  maxRetries: number; // default: 2
  theme: 'dark' | 'light' | 'system';
  developerMode: boolean;
  autoSkipDuplicates: boolean;
  customInstructions: string;
  defaultTemplateStyle: string;
  nichePresets?: NichePreset[];
  activePresetId?: string;
  selectedHookTone?: HookTone;
}

export type PresetName =
  | 'GLOBAL'
  | 'USA_CREATOR'
  | 'INDIA_CREATOR'
  | 'YOUTUBE_SEO'
  | 'FACEBOOK'
  | 'INSTAGRAM_REELS'
  | 'CUSTOM';

export interface PresetConfig {
  name: PresetName;
  label: string;
  description: string;
  language: SupportedLanguage;
  targetUsa: boolean;
  platforms: ('youtube' | 'facebook' | 'instagram')[];
}
