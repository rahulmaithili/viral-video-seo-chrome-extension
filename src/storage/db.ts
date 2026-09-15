const DB_NAME = 'ViralVideoAIStudioDB';
const DB_VERSION = 1;

export interface DBStores {
  videos: 'videos';
  fingerprints: 'fingerprints';
  jobs: 'jobs';
  analyses: 'analyses';
  packages: 'packages';
  history: 'history';
  templates: 'templates';
}

let dbInstance: IDBDatabase | null = null;

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    // Support browser / worker environments
    const indexedDB = globalThis.indexedDB;
    if (!indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Videos store
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos', { keyPath: 'id' });
      }

      // Fingerprints store
      if (!db.objectStoreNames.contains('fingerprints')) {
        const store = db.createObjectStore('fingerprints', { keyPath: 'id' });
        store.createIndex('sha256', 'sha256', { unique: false });
        store.createIndex('metadataSignature', 'metadataSignature', { unique: false });
      }

      // Jobs store for crash recovery
      if (!db.objectStoreNames.contains('jobs')) {
        const store = db.createObjectStore('jobs', { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('startedTime', 'startedTime', { unique: false });
      }

      // Analyses store
      if (!db.objectStoreNames.contains('analyses')) {
        db.createObjectStore('analyses', { keyPath: 'videoId' });
      }

      // Packages store
      if (!db.objectStoreNames.contains('packages')) {
        db.createObjectStore('packages', { keyPath: 'videoId' });
      }

      // History store
      if (!db.objectStoreNames.contains('history')) {
        const store = db.createObjectStore('history', { keyPath: 'id' });
        store.createIndex('completedTime', 'completedTime', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }

      // Templates store
      if (!db.objectStoreNames.contains('templates')) {
        db.createObjectStore('templates', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function executeTx<T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => Promise<T> | IDBRequest
): Promise<T> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);

    let resultPromise: Promise<T> | IDBRequest;
    try {
      resultPromise = callback(store);
    } catch (err) {
      reject(err);
      return;
    }

    if (resultPromise instanceof IDBRequest) {
      resultPromise.onsuccess = () => resolve(resultPromise.result);
      resultPromise.onerror = () => reject(resultPromise.error);
    } else {
      resultPromise.then(resolve).catch(reject);
    }

    tx.onerror = () => reject(tx.error);
  });
}
