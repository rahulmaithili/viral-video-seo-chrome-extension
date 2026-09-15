import { create } from 'zustand';
import { UserSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../config/defaults';
import { storageService } from '../storage/chromeStorage';

interface SettingsState {
  settings: UserSettings;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettings: async () => {
    const loaded = await storageService.getSettings();
    set({ settings: loaded, isLoaded: true });
  },

  updateSettings: async (newSettings) => {
    const updated = await storageService.saveSettings(newSettings);
    set({ settings: updated });
  },
}));
