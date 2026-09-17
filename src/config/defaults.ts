import { UserSettings, PresetConfig, NichePreset } from '../types/settings';

export const DEFAULT_NICHE_PRESETS: NichePreset[] = [
  {
    id: 'bhakti',
    name: 'Bhakti & Devotion',
    pageKeywords: ['bhakti', 'mandir', 'ram', 'mahadev', 'krishna', 'sanatan', 'temple', 'hindu'],
    masterPrompt: 'Devotional temple darshan, emotional Hindi bhakti hooks, ask devotees to comment Har Har Mahadev or Jai Shree Ram, pure spiritual positive energy.',
    language: 'Hindi',
    targetUsa: false,
    fixedHashtags: '#Bhakti #SanatanDharma #JaiShreeRam #HarHarMahadev #TrendingReels',
  },
  {
    id: 'cute_pets',
    name: 'Cute Pets & Animals',
    pageKeywords: ['dog', 'cat', 'puppy', 'pet', 'animal', 'cute'],
    masterPrompt: 'Cute dog/pet funny moments, emotional human-pet bond, curiosity hook (Wait for the reaction! 🐶), heartwarming conversational captions.',
    language: 'Hinglish',
    targetUsa: false,
    fixedHashtags: '#DogLovers #CutePets #FunnyAnimals #PetReels #ViralReels',
  },
  {
    id: 'desi_village',
    name: 'Desi Village Life',
    pageKeywords: ['village', 'desi', 'gaon', 'culture', 'kisan', 'lifestyle'],
    masterPrompt: 'Authentic Indian village life, pure desi culture, nostalgic memories of gaon, asking viewers which village or state they belong to.',
    language: 'Hindi',
    targetUsa: false,
    fixedHashtags: '#VillageLife #DesiCulture #GaonKiZindagi #IncredibleIndia #DesiReels',
  },
  {
    id: 'funny_comedy',
    name: 'Comedy & Entertainment',
    pageKeywords: ['funny', 'comedy', 'humor', 'entertainment', 'meme', 'haso'],
    masterPrompt: 'Relatable situational comedy, funny laughter hooks, lighthearted teasing, asking friends to tag someone who does this.',
    language: 'Hinglish',
    targetUsa: false,
    fixedHashtags: '#ComedyReels #FunnyVideo #DesiComedy #HasoMat #TrendingHumor',
  },
  {
    id: 'usa_viral',
    name: 'USA Viral & Tech',
    pageKeywords: ['usa', 'tech', 'gadget', 'world', 'viral', 'facts'],
    masterPrompt: 'High-energy American English conversational hook, surprising twist, pacing optimized for US viewers, thought-provoking question.',
    language: 'English',
    targetUsa: true,
    fixedHashtags: '#ViralReels #TrendingNow #ExplorePage #MustWatch #InstaDaily',
  },
];

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
  nichePresets: DEFAULT_NICHE_PRESETS,
  activePresetId: 'bhakti',
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
