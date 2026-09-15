import { UserSettings, PresetConfig } from '../types/settings';

export const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  geminiModel: 'gemini-3.6-flash',
  useMockAI: true, // Default to true so users and testers can run immediately out of the box!
  defaultLanguage: 'English',
  defaultTargetUsa: true,
  defaultPlatforms: ['youtube', 'facebook', 'instagram'],
  concurrency: 3,
  duplicateThreshold: 90,
  keywordRelevanceThreshold: 70,
  maxRetries: 2,
  theme: 'dark',
  developerMode: false,
  autoSkipDuplicates: true,
  customInstructions: '',
  defaultTemplateStyle: 'Viral',
};

export const AVAILABLE_GEMINI_MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash (Latest & Recommended)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Standard Multimodal)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Deep Reasoning)' },
];

export const SMART_PRESETS: PresetConfig[] = [
  {
    name: 'USA_CREATOR',
    label: 'USA Creator',
    description: 'US English, USA audience optimization ON, all platforms, relevance first',
    language: 'English',
    targetUsa: true,
    platforms: ['youtube', 'facebook', 'instagram'],
  },
  {
    name: 'INDIA_CREATOR',
    label: 'India Creator (Hinglish)',
    description: 'Roman Hinglish, USA OFF, all platforms, high engagement',
    language: 'Hinglish',
    targetUsa: false,
    platforms: ['youtube', 'facebook', 'instagram'],
  },
  {
    name: 'GLOBAL',
    label: 'Global Creator',
    description: 'Standard English, USA OFF, universal audience targeting',
    language: 'English',
    targetUsa: false,
    platforms: ['youtube', 'facebook', 'instagram'],
  },
  {
    name: 'YOUTUBE_SEO',
    label: 'YouTube SEO Heavy',
    description: 'Long-tail search intent, 10 titles, rich description and tags',
    language: 'English',
    targetUsa: true,
    platforms: ['youtube'],
  },
  {
    name: 'INSTAGRAM_REELS',
    label: 'Instagram Reels Viral',
    description: 'Hook-first, short punchy captions, hashtag sets',
    language: 'English',
    targetUsa: true,
    platforms: ['instagram'],
  },
];
