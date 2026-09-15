import { VideoJob } from '../../types/queue';
import { getDB } from '../db';

export const jobRepo = {
  async saveJob(job: VideoJob): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('jobs', 'readwrite');
      const store = tx.objectStore('jobs');
      const request = store.put(job);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async getJob(id: string): Promise<VideoJob | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('jobs', 'readonly');
      const store = tx.objectStore('jobs');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  },

  async getAllJobs(): Promise<VideoJob[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('jobs', 'readonly');
      const store = tx.objectStore('jobs');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  },

  async getInterruptedJobs(): Promise<VideoJob[]> {
    const all = await this.getAllJobs();
    const activeStates = ['PREPARING', 'FINGERPRINTING', 'DUPLICATE_CHECK', 'UPLOADING', 'ANALYZING', 'GENERATING', 'VALIDATING'];
    return all.filter((job) => activeStates.includes(job.status));
  },

  async deleteJob(id: string): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('jobs', 'readwrite');
      const store = tx.objectStore('jobs');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async clearAllJobs(): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('jobs', 'readwrite');
      const store = tx.objectStore('jobs');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
};
