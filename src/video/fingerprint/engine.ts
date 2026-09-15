import { VideoMetadata, VideoFingerprint, VideoFrameSample } from '../../types/video';

/**
 * Calculates SHA-256 hash of a file or array buffer using Web Crypto API
 */
export async function computeFileSHA256(file: File): Promise<string> {
  // For large files (>20MB), slice the first 10MB + last 5MB + filesize to compute fast reliable hash
  // For <=20MB, compute full binary hash
  const maxDirectSize = 20 * 1024 * 1024;
  let buffer: ArrayBuffer;

  if (file.size <= maxDirectSize) {
    buffer = await file.arrayBuffer();
  } else {
    const head = file.slice(0, 10 * 1024 * 1024);
    const tail = file.slice(file.size - 5 * 1024 * 1024);
    const headBuf = await head.arrayBuffer();
    const tailBuf = await tail.arrayBuffer();
    const combined = new Uint8Array(headBuf.byteLength + tailBuf.byteLength + 8);
    combined.set(new Uint8Array(headBuf), 0);
    combined.set(new Uint8Array(tailBuf), headBuf.byteLength);
    // write file size to tail
    const view = new DataView(combined.buffer);
    view.setBigUint64(headBuf.byteLength + tailBuf.byteLength, BigInt(file.size), true);
    buffer = combined.buffer;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generates Level 2 Metadata Signature
 */
export function computeMetadataSignature(meta: VideoMetadata): string {
  const roundedDuration = Math.round(meta.duration * 10) / 10;
  const roundedKb = Math.round(meta.filesize / 1024);
  return `meta:${roundedDuration}s_${meta.width}x${meta.height}_${meta.aspectRatio}_${roundedKb}kb`;
}

/**
 * Generates full multi-level VideoFingerprint
 */
export async function generateVideoFingerprint(
  videoId: string,
  file: File,
  meta: VideoMetadata,
  samples: VideoFrameSample[]
): Promise<VideoFingerprint> {
  const sha256 = await computeFileSHA256(file);
  const metadataSignature = computeMetadataSignature(meta);
  const perceptualHashes = samples.map((s) => s.dHash);

  return {
    id: videoId,
    sha256,
    metadataSignature,
    perceptualHashes,
    createdAt: Date.now(),
  };
}
