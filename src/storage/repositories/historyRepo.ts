import { VideoJob } from '../../types/queue';
import { getDB } from '../db';

export interface HistoryItem {
  id: string; // Job ID
  videoId: string;
  filename: string;
  filesize: number;
  category: string;
  niche: string;
  title: string;
  summary: string;
  viralScore: number;
  language: string;
  targetUsa: boolean;
  platforms: string[];
  keywords: string[];
  completedTime: number;
  sha256?: string;
  metadataSignature?: string;
}

export const historyRepo = {
  async saveHistoryItem(job: VideoJob): Promise<void> {
    if (!job.analysis || !job.platformPackage) return;

    const item: HistoryItem = {
      id: job.id,
      videoId: job.videoId,
      filename: job.filename,
      filesize: job.filesize,
      category: job.analysis.category,
      niche: job.analysis.niche,
      title: job.platformPackage.youtube.bestTitle || job.platformPackage.facebook.headline || job.filename,
      summary: job.analysis.summary,
      viralScore: job.analysis.viralScore.overallScore,
      language: job.language,
      targetUsa: job.targetUsa,
      platforms: job.selectedPlatforms,
      keywords: job.analysis.keywords.map((k) => k.term),
      completedTime: job.completedTime || Date.now(),
      sha256: job.fingerprint?.sha256,
      metadataSignature: job.fingerprint?.metadataSignature,
    };

    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getAllHistory(): Promise<HistoryItem[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readonly');
      const store = tx.objectStore('history');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = (request.result || []) as HistoryItem[];
        // Sort descending by completedTime
        items.sort((a, b) => b.completedTime - a.completedTime);
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  },

  async searchHistory(query: string): Promise<HistoryItem[]> {
    const all = await this.getAllHistory();
    if (!query.trim()) return all;

    const lower = query.toLowerCase();
    return all.filter((item) => {
      return (
        item.filename.toLowerCase().includes(lower) ||
        item.title.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower) ||
        item.niche.toLowerCase().includes(lower) ||
        item.summary.toLowerCase().includes(lower) ||
        item.keywords.some((k) => k.toLowerCase().includes(lower))
      );
    });
  },

  async deleteHistoryItem(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async clearHistory(): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
};
