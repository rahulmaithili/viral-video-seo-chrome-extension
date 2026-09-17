/**
 * Viral Video AI Studio — Chrome Extension MV3 Service Worker
 * Brand: Rahul Scripts
 */

const CURRENT_VERSION = '3.0.0';
const GITHUB_VERSION_URL = 'https://raw.githubusercontent.com/rahulmaithili/viral-video-seo-chrome-extension/main/version.json';

function isNewerVersion(current: string, latest: string): boolean {
  if (!current || !latest) return false;
  const c = current.split('.').map((x) => parseInt(x, 10) || 0);
  const l = latest.split('.').map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(c.length, l.length); i++) {
    const cv = c[i] || 0;
    const lv = l[i] || 0;
    if (lv > cv) return true;
    if (lv < cv) return false;
  }
  return false;
}

async function checkRemoteUpdate() {
  try {
    const res = await fetch(`${GITHUB_VERSION_URL}?_t=${Date.now()}`, { cache: 'no-cache' });
    if (res.ok) {
      const data = await res.json();
      const hasUpdate = isNewerVersion(CURRENT_VERSION, data.version);
      const updatePayload = {
        hasUpdate,
        currentVersion: CURRENT_VERSION,
        latestVersion: data.version,
        name: data.name || 'Rahul Scripts 3.0 PRO',
        changelog: data.changelog || 'New viral hooks, updated master prompts, and bug fixes.',
        releaseDate: data.releaseDate || '',
        downloadUrl: data.downloadUrl || 'https://github.com/rahulmaithili/viral-video-seo-chrome-extension/archive/refs/heads/main.zip',
        repoUrl: data.repoUrl || 'https://github.com/rahulmaithili/viral-video-seo-chrome-extension',
        lastChecked: Date.now(),
      };
      await chrome.storage.local.set({ rs_extension_update_info: updatePayload });
      return updatePayload;
    }
  } catch (err) {
    console.warn('[Viral Video AI Studio] Failed to check for remote update:', err);
  }
  return null;
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Viral Video AI Studio installed successfully.');
    chrome.storage.local.set({
      installedAt: Date.now(),
      version: CURRENT_VERSION,
    });
  }
  checkRemoteUpdate();
});

chrome.runtime.onStartup.addListener(() => {
  checkRemoteUpdate();
});

// Periodic alarm for heartbeat & checking extension updates (every 60 mins)
chrome.alarms.create('queue_heartbeat', { periodInMinutes: 5 });
chrome.alarms.create('check_extension_updates', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'queue_heartbeat') {
    // Keep background service healthy without keeping persistent state in memory
  } else if (alarm.name === 'check_extension_updates') {
    checkRemoteUpdate();
  }
});

// Default Niche Presets for Multi-Page Management
const DEFAULT_NICHE_PRESETS = [
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

async function getActivePreset(presetId?: string, pageHint?: string): Promise<{ preset: any; allPresets: any[] }> {
  try {
    const stored = await chrome.storage.local.get('viral_video_ai_studio_settings');
    const settings = (stored?.viral_video_ai_studio_settings || {}) as Record<string, any>;
    const presets = settings.nichePresets && settings.nichePresets.length > 0 ? settings.nichePresets : DEFAULT_NICHE_PRESETS;

    // 1. If explicit presetId requested
    if (presetId) {
      const found = presets.find((p: any) => p.id === presetId);
      if (found) return { preset: found, allPresets: presets };
    }

    // 2. Auto-match by page name/hint
    if (pageHint) {
      const lower = pageHint.toLowerCase();
      for (const p of presets) {
        if (p.pageKeywords && Array.isArray(p.pageKeywords)) {
          if (p.pageKeywords.some((k: string) => lower.includes(k.toLowerCase()))) {
            return { preset: p, allPresets: presets };
          }
        }
        if (lower.includes(p.name.toLowerCase())) {
          return { preset: p, allPresets: presets };
        }
      }
    }

    // 3. Current active preset in settings
    if (settings.activePresetId) {
      const found = presets.find((p: any) => p.id === settings.activePresetId);
      if (found) return { preset: found, allPresets: presets };
    }

    return { preset: presets[0] || DEFAULT_NICHE_PRESETS[0], allPresets: presets };
  } catch {
    return { preset: DEFAULT_NICHE_PRESETS[0], allPresets: DEFAULT_NICHE_PRESETS };
  }
}

// Helper to extract JSON from Gemini text response
function parseCleanJSON(text: string): any {
  try {
    const clean = text
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// Fallback metadata generator if Gemini API key is missing or fails
function generateFallbackMetadata(language = 'English', targetUsa = false, masterPrompt = '', fixedHashtags = '') {
  const isHindi = language === 'Hindi';
  const isHinglish = language === 'Hinglish';
  const lowerPrompt = masterPrompt.toLowerCase();

  let title = 'Watch till the very end! Absolutely unbelievable 😱✨';
  let caption = 'You have to see this to believe it! What would you do in this situation? Let us know in the comments! 👇';
  let hashtags = ['#ReelsFB', '#ViralReels', '#Trending', '#ViralVideo'];

  if (lowerPrompt.includes('bhakti') || lowerPrompt.includes('mandir') || lowerPrompt.includes('ram') || lowerPrompt.includes('shiv') || isHindi) {
    title = '🙏 हर हर महादेव! यह अलौकिक दृश्य देखकर मन प्रसन्न हो जाएगा ✨';
    caption = 'अंत तक जरूर देखें! कमेंट बॉक्स में जय श्री राम या हर हर महादेव जरूर लिखें! 🙏🚩';
    hashtags = ['#Bhakti', '#SanatanDharma', '#HarHarMahadev', '#JaiShreeRam', '#ReelsFB', '#ViralReels'];
  } else if (lowerPrompt.includes('dog') || lowerPrompt.includes('pet') || lowerPrompt.includes('cat')) {
    title = 'Wait for the end! 🐶 You won’t believe what this cute pet did ❤️';
    caption = 'Watch till the end! Isn’t this the cutest thing you’ve seen today? Drop a ❤️ in comments! 👇';
    hashtags = ['#DogLovers', '#CutePets', '#FunnyAnimals', '#PetReels', '#ReelsFB', '#ViralReels'];
  } else if (isHinglish) {
    title = 'Wait for the end! 🤯 Ye video dekh kar hosh ud jayenge!';
    caption = 'Last tak zaroor dekhiye! Kya aapne pehle kabhi aisa kuch dekha hai? Comments me batayein! 👇';
    hashtags = ['#ReelsFB', '#ViralReels', '#Trending', '#ViralVideo', '#FBReels', '#HinglishReels'];
  } else if (targetUsa) {
    title = 'Wait until the very end! You won’t believe this 🤯🔥';
    caption = 'Watch until the end! Have you ever experienced anything quite like this? Drop your thoughts below! 👇';
    hashtags = ['#ReelsFB', '#ViralReels', '#TrendingNow', '#ViralVideo', '#InstaGood', '#ExplorePage'];
  }

  // Append fixed hashtags from preset if defined
  if (fixedHashtags) {
    const extraTags = fixedHashtags.split(/[\s,]+/).filter((t: string) => t.startsWith('#'));
    hashtags = [...new Set([...hashtags, ...extraTags])];
  }

  return {
    title,
    caption,
    hashtags,
    tags: hashtags.map((h: string) => h.replace('#', '')),
  };
}

// Listen for messages from popup, options page, or content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'OPEN_DASHBOARD') {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
    sendResponse({ success: true });
    return false;
  }

  if (message.type === 'GET_EXTENSION_INFO') {
    sendResponse({
      name: 'Viral Video AI Studio',
      brand: 'Rahul Scripts',
      version: CURRENT_VERSION,
    });
    return false;
  }

  if (message.type === 'CHECK_FOR_UPDATES') {
    (async () => {
      const fresh = await checkRemoteUpdate();
      if (fresh) {
        sendResponse({ success: true, data: fresh });
      } else {
        const stored = await chrome.storage.local.get('rs_extension_update_info');
        sendResponse({
          success: true,
          data: stored?.rs_extension_update_info || {
            hasUpdate: false,
            currentVersion: CURRENT_VERSION,
            latestVersion: CURRENT_VERSION,
            changelog: '',
            downloadUrl: 'https://github.com/rahulmaithili/viral-video-seo-chrome-extension/archive/refs/heads/main.zip',
            repoUrl: 'https://github.com/rahulmaithili/viral-video-seo-chrome-extension',
            lastChecked: Date.now(),
          },
        });
      }
    })();
    return true;
  }

  if (message.type === 'GET_NICHE_PRESETS') {
    (async () => {
      try {
        const stored = await chrome.storage.local.get('viral_video_ai_studio_settings');
        const settings = (stored?.viral_video_ai_studio_settings || {}) as Record<string, any>;
        const presets = settings.nichePresets && settings.nichePresets.length > 0 ? settings.nichePresets : DEFAULT_NICHE_PRESETS;
        const activeId = settings.activePresetId || presets[0]?.id || 'bhakti';
        sendResponse({ success: true, presets, activeId });
      } catch (err: any) {
        sendResponse({ success: false, presets: DEFAULT_NICHE_PRESETS, activeId: 'bhakti' });
      }
    })();
    return true;
  }

  if (message.type === 'SAVE_NICHE_PRESET') {
    (async () => {
      try {
        const stored = await chrome.storage.local.get('viral_video_ai_studio_settings');
        const settings = (stored?.viral_video_ai_studio_settings || {}) as Record<string, any>;
        let presets = settings.nichePresets && settings.nichePresets.length > 0 ? [...settings.nichePresets] : [...DEFAULT_NICHE_PRESETS];
        const newPreset = message.preset;
        const idx = presets.findIndex((p: any) => p.id === newPreset.id);
        if (idx >= 0) {
          presets[idx] = newPreset;
        } else {
          presets.push(newPreset);
        }
        settings.nichePresets = presets;
        settings.activePresetId = newPreset.id;
        await chrome.storage.local.set({ viral_video_ai_studio_settings: settings });
        sendResponse({ success: true, presets, activeId: newPreset.id });
      } catch (err: any) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.type === 'SET_ACTIVE_PRESET') {
    (async () => {
      try {
        const stored = await chrome.storage.local.get('viral_video_ai_studio_settings');
        const settings = (stored?.viral_video_ai_studio_settings || {}) as Record<string, any>;
        settings.activePresetId = message.presetId;
        await chrome.storage.local.set({ viral_video_ai_studio_settings: settings });
        sendResponse({ success: true, activeId: message.presetId });
      } catch (err: any) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.type === 'GENERATE_FB_REEL_METADATA') {
    (async () => {
      try {
        const stored = await chrome.storage.local.get('viral_video_ai_studio_settings');
        const settings = (stored?.viral_video_ai_studio_settings || {}) as Record<string, any>;
        const apiKey = settings.geminiApiKey?.trim();
        const model = settings.geminiModel || 'gemini-3.6-flash';
        const useMock = settings.useMockAI;

        // Resolve active or auto-matched preset!
        const { preset } = await getActivePreset(message.presetId, message.pageHint || message.pageTitle);
        const language = message.language || preset.language || settings.defaultLanguage || 'Hindi';
        const targetUsa = message.targetUsa !== undefined ? !!message.targetUsa : (preset.targetUsa !== undefined ? !!preset.targetUsa : !!settings.defaultTargetUsa);
        const masterPrompt = message.masterPrompt || preset.masterPrompt || '';
        const fixedHashtags = preset.fixedHashtags || '';

        if (apiKey && !useMock) {
          const systemInstruction = `You are an elite viral video growth strategist for Facebook Reels & Posts.
Analyze this video snapshot and generate viral social media metadata.
Current Page/Niche Focus: "${preset.name}".
Master Prompt / Creator Rules: "${masterPrompt || 'General viral entertainment'}".
Language requested: ${language} (${targetUsa ? 'Optimized for US Audience' : 'Global Audience'}).

Respond ONLY with a valid JSON object matching this schema:
{
  "title": "Short punchy viral hook title (under 60 chars)",
  "caption": "Engaging 2-3 line conversational caption with questions and call to action",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
  "tags": ["keyword 1", "keyword 2", "keyword 3", "keyword 4", "keyword 5", "keyword 6"]
}`;

          const parts: any[] = [{ text: systemInstruction }];

          if (message.frameData && message.frameData.startsWith('data:image/')) {
            const base64Data = message.frameData.split(',')[1];
            parts.push({
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data,
              },
            });
          }

          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts }],
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const parsed = parseCleanJSON(textResponse);
            if (parsed && parsed.title && parsed.caption) {
              const generatedTags = Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#ReelsFB', '#ViralReels'];
              const extraFixed = fixedHashtags.split(/[\s,]+/).filter((t: string) => t.startsWith('#'));
              const combinedTags = [...new Set([...generatedTags, ...extraFixed])];
              const tags = Array.isArray(parsed.tags) ? parsed.tags : ['viral video', 'facebook reels'];
              sendResponse({
                success: true,
                data: {
                  title: parsed.title,
                  caption: parsed.caption,
                  hashtags: combinedTags,
                  tags,
                  fullDescription: `${parsed.title}\n\n${parsed.caption}\n\n${combinedTags.join(' ')}`,
                },
              });
              return;
            }
          }
        }

        // Fallback or Mock mode
        const fallback = generateFallbackMetadata(language, targetUsa, masterPrompt, fixedHashtags);
        sendResponse({
          success: true,
          data: {
            ...fallback,
            fullDescription: `${fallback.title}\n\n${fallback.caption}\n\n${fallback.hashtags.join(' ')}`,
          },
        });
      } catch (err: any) {
        console.error('Error generating FB reel metadata:', err);
        const fallback = generateFallbackMetadata();
        sendResponse({
          success: true,
          data: {
            ...fallback,
            fullDescription: `${fallback.title}\n\n${fallback.caption}\n\n${fallback.hashtags.join(' ')}`,
          },
        });
      }
    })();
    return true;
  }

  if (message.type === 'GENERATE_META_BULK_REEL') {
    (async () => {
      try {
        const stored = await chrome.storage.local.get('viral_video_ai_studio_settings');
        const settings = (stored?.viral_video_ai_studio_settings || {}) as Record<string, any>;
        const apiKey = settings.geminiApiKey?.trim();
        const model = settings.geminiModel || 'gemini-3.6-flash';
        const { preset } = await getActivePreset(message.presetId, message.pageHint || message.pageTitle);
        const language = message.language || preset.language || settings.defaultLanguage || 'Hindi';
        const targetUsa = message.targetUsa !== undefined ? !!message.targetUsa : (preset.targetUsa !== undefined ? !!preset.targetUsa : !!settings.defaultTargetUsa);
        const masterPrompt = message.masterPrompt || preset.masterPrompt || '';
        const fixedHashtags = preset.fixedHashtags || '';
        const filename = message.filename || '';
        const rowNumber = message.rowNumber || 1;

        if (apiKey && !settings.useMockAI) {
          const systemInstruction = `You are a master social media growth strategist for Facebook Reels in Meta Business Suite.
Generate high-converting, viral metadata for Bulk Reel #${rowNumber}.
Active Page/Niche: "${preset.name}".
Master Niche / Prompt: "${masterPrompt || 'General Viral Entertainment'}".
Video Filename / Clue: "${filename}".
Target Language: ${language} (${targetUsa ? 'Optimized for US Audience' : 'Global Audience'}).

Guidelines:
- Title must be engaging, curiosity-driven (under 60 characters).
- Caption should be 2-3 conversational sentences with a question or comment prompt.
- Hashtags: 5-8 trending hashtags directly relevant to the niche and #ReelsFB, #ViralReels.
- Tags: 5-8 keywords.

Respond ONLY with valid JSON (no markdown):
{
  "title": "...",
  "caption": "...",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "tags": ["keyword1", "keyword2"]
}`;

          const parts: any[] = [{ text: systemInstruction }];
          if (message.thumbnailData && message.thumbnailData.startsWith('data:image/')) {
            const base64Data = message.thumbnailData.split(',')[1];
            parts.push({
              inline_data: {
                mime_type: 'image/jpeg',
                data: base64Data,
              },
            });
          }

          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ role: 'user', parts }] }),
          });

          if (res.ok) {
            const data = await res.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            const parsed = parseCleanJSON(textResponse);
            if (parsed && parsed.title && parsed.caption) {
              const hashtags = Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#ReelsFB', '#ViralReels'];
              const extraFixed = fixedHashtags.split(/[\s,]+/).filter((t: string) => t.startsWith('#'));
              const combinedTags = [...new Set([...hashtags, ...extraFixed])];
              const tags = Array.isArray(parsed.tags) ? parsed.tags : ['viral reels'];
              sendResponse({
                success: true,
                data: {
                  title: parsed.title,
                  caption: parsed.caption,
                  hashtags: combinedTags,
                  tags,
                  fullDescription: `${parsed.title}\n\n${parsed.caption}\n\n${combinedTags.join(' ')}`,
                },
              });
              return;
            }
          }
        }

        // Smart Niche-Aware Fallback
        const fallback = generateFallbackMetadata(language, targetUsa, masterPrompt + ' ' + filename, fixedHashtags);
        sendResponse({
          success: true,
          data: {
            ...fallback,
            fullDescription: `${fallback.title}\n\n${fallback.caption}\n\n${fallback.hashtags.join(' ')}`,
          },
        });
      } catch (err: any) {
        console.error('Error in GENERATE_META_BULK_REEL:', err);
        const fallback = generateFallbackMetadata();
        sendResponse({
          success: true,
          data: {
            ...fallback,
            fullDescription: `${fallback.title}\n\n${fallback.caption}\n\n${fallback.hashtags.join(' ')}`,
          },
        });
      }
    })();
    return true;
  }

  return true;
});

