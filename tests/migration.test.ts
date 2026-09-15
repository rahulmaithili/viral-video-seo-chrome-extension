import { describe, it, expect, beforeEach } from 'vitest';
import { storageService } from '../src/storage/chromeStorage';
import { GeminiProvider } from '../src/ai/providers/gemini';

const memoryStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => memoryStorage[key] || null,
  setItem: (key: string, val: string) => {
    memoryStorage[key] = val;
  },
  removeItem: (key: string) => {
    delete memoryStorage[key];
  },
  clear: () => {
    Object.keys(memoryStorage).forEach((k) => delete memoryStorage[k]);
  },
};

// Assign to globalThis
(globalThis as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;

describe('Model Migration & Gemini 3.6 Flash Auto-Recovery', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('automatically upgrades legacy gemini-2.5-flash in storage to gemini-3.6-flash', async () => {
    // Simulate legacy storage containing gemini-2.5-flash
    localStorage.setItem(
      'viral_video_ai_studio_settings',
      JSON.stringify({
        geminiModel: 'gemini-2.5-flash',
        geminiApiKey: 'test-key',
      })
    );

    const settings = await storageService.getSettings();
    expect(settings.geminiModel).toBe('gemini-3.6-flash');

    // Check that it wrote back the migrated setting
    const saved = JSON.parse(localStorage.getItem('viral_video_ai_studio_settings') || '{}');
    expect(saved.geminiModel).toBe('gemini-3.6-flash');
  });

  it('GeminiProvider sanitizes models/ prefix and upgrades 2.5-flash to 3.6-flash', () => {
    const provider1 = new GeminiProvider('key', 'gemini-2.5-flash');
    expect((provider1 as unknown as { model: string }).model).toBe('gemini-3.6-flash');

    const provider2 = new GeminiProvider('key', 'models/gemini-2.5-flash');
    expect((provider2 as unknown as { model: string }).model).toBe('gemini-3.6-flash');

    const provider3 = new GeminiProvider('key', 'gemini-1.5-flash');
    expect((provider3 as unknown as { model: string }).model).toBe('gemini-1.5-flash');
  });
});
