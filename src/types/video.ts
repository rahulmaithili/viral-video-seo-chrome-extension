export type SupportedLanguage = 'English' | 'Hindi' | 'Hinglish';

export interface VideoMetadata {
  filename: string;
  filesize: number;
  duration: number; // in seconds
  width: number;
  height: number;
  aspectRatio: string; // e.g. "16:9", "9:16", "1:1"
  format: string; // e.g. "video/mp4"
  fps?: number;
  thumbnailUrl?: string; // base64 or object URL
}

export interface VideoFrameSample {
  timestamp: number;
  dataUrl: string; // base64 JPEG
  dHash: string; // 64-bit hex difference hash
}

export interface VideoFingerprint {
  id: string;
  sha256: string; // Level 1: File hash
  metadataSignature: string; // Level 2: duration + width + height + size signature
  perceptualHashes: string[]; // Level 3: Frame dHashes
  semanticHash?: string; // Level 5: Normalized semantic representation
  createdAt: number;
}

export interface DuplicateMatch {
  isDuplicate: boolean;
  score: number; // 0 to 100
  matchedVideoId?: string;
  matchedFilename?: string;
  reason: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
}
