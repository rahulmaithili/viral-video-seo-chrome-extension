import { VideoMetadata, VideoFingerprint } from '../../types/video';
import { getDB } from '../db';

export interface StoredVideoRecord {
  id: string;
  metadata: VideoMetadata;
  createdAt: number;
}

export const videoRepo = {
  async saveVideo(id: string, metadata: VideoMetadata): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readwrite');
      const store = tx.objectStore('videos');
      const request = store.put({ id, metadata, createdAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getVideo(id: string): Promise<StoredVideoRecord | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('videos', 'readonly');
      const store = tx.objectStore('videos');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async saveFingerprint(fingerprint: VideoFingerprint): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('fingerprints', 'readwrite');
      const store = tx.objectStore('fingerprints');
      const request = store.put(fingerprint);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getAllFingerprints(): Promise<VideoFingerprint[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('fingerprints', 'readonly');
      const store = tx.objectStore('fingerprints');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },
};
