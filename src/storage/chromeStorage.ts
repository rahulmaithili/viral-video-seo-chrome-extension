import { UserSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../config/defaults';

const SETTINGS_KEY = 'viral_video_ai_studio_settings';

function sanitizeModel(model?: string): string {
  if (!model) return 'gemini-3.6-flash';
  let clean = model.startsWith('models/') ? model.replace('models/', '') : model;
  if (clean.includes('2.5-flash') || clean.includes('gemini-2.5')) {
    return 'gemini-3.6-flash';
  }
  return clean;
}

function migrateSettings(settings: UserSettings): { migrated: UserSettings; changed: boolean } {
  const currentModel = settings.geminiModel || 'gemini-3.6-flash';
  const upgradedModel = sanitizeModel(currentModel);
  const changed = currentModel !== upgradedModel;

  return {
    migrated: {
      ...settings,
      geminiModel: upgradedModel,
    },
    changed,
  };
}

export const storageService = {
  async getSettings(): Promise<UserSettings> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        const result = await chrome.storage.local.get(SETTINGS_KEY);
        if (result[SETTINGS_KEY]) {
          const merged = { ...DEFAULT_SETTINGS, ...result[SETTINGS_KEY] };
          const { migrated, changed } = migrateSettings(merged);
          if (changed) {
            await chrome.storage.local.set({ [SETTINGS_KEY]: migrated }).catch(() => {});
          }
          return migrated;
        }
      } else if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const merged = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
          const { migrated, changed } = migrateSettings(merged);
          if (changed) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(migrated));
          }
          return migrated;
        }
      }
    } catch (err) {
      console.warn('Could not read from storage, using defaults:', err);
    }
    return DEFAULT_SETTINGS;
  },

  async saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...settings };
    const { migrated } = migrateSettings(updated);

    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set({ [SETTINGS_KEY]: migrated });
      } else if (typeof localStorage !== 'undefined') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(migrated));
      }
    } catch (err) {
      console.error('Failed to save settings to storage:', err);
      throw err;
    }

    return migrated;
  },
};
