import { VideoAnalysis } from '../../types/ai';
import { CompletePlatformPackage } from '../../types/platform';
import { getDB } from '../db';

export const analysisRepo = {
  async saveAnalysis(analysis: VideoAnalysis): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('analyses', 'readwrite');
      const store = tx.objectStore('analyses');
      const request = store.put(analysis);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getAnalysis(videoId: string): Promise<VideoAnalysis | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('analyses', 'readonly');
      const store = tx.objectStore('analyses');
      const request = store.get(videoId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async savePackage(pkg: CompletePlatformPackage): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('packages', 'readwrite');
      const store = tx.objectStore('packages');
      const request = store.put(pkg);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getPackage(videoId: string): Promise<CompletePlatformPackage | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('packages', 'readonly');
      const store = tx.objectStore('packages');
      const request = store.get(videoId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },
};
