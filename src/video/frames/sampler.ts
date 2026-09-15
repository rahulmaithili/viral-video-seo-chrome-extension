import { VideoFrameSample } from '../../types/video';

/**
 * Computes a 64-bit difference hash (dHash) for an HTMLCanvasElement
 * Resizes to 9x8, converts to grayscale, and checks if left pixel > right pixel.
 */
export function computeCanvasDHash(sourceCanvas: HTMLCanvasElement): string {
  const width = 9;
  const height = 8;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '0000000000000000';

  ctx.drawImage(sourceCanvas, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height).data;

  // Compute 64-bit hash
  let hashBinary = '';
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width - 1; x++) {
      const idxLeft = (y * width + x) * 4;
      const idxRight = (y * width + (x + 1)) * 4;

      const grayLeft = 0.299 * imgData[idxLeft] + 0.587 * imgData[idxLeft + 1] + 0.114 * imgData[idxLeft + 2];
      const grayRight = 0.299 * imgData[idxRight] + 0.587 * imgData[idxRight + 1] + 0.114 * imgData[idxRight + 2];

      hashBinary += grayLeft > grayRight ? '1' : '0';
    }
  }

  // Convert 64-bit binary to 16-character hex string
  let hexString = '';
  for (let i = 0; i < hashBinary.length; i += 4) {
    const chunk = hashBinary.substring(i, i + 4);
    hexString += parseInt(chunk, 2).toString(16);
  }

  return hexString;
}

/**
 * Calculates hamming distance between two 64-bit hex dHashes (0 to 64).
 */
export function hammingDistanceHex(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 64;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    const v1 = parseInt(hash1[i], 16);
    const v2 = parseInt(hash2[i], 16);
    let xor = v1 ^ v2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/**
 * Samples deterministic frames (10%, 30%, 50%, 70%, 90%) from a video file
 */
export async function sampleVideoFrames(
  file: File,
  duration: number,
  sampleCount = 5
): Promise<VideoFrameSample[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const cleanUp = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
      canvas.remove();
    };

    const effectiveDuration = duration > 0 ? duration : 5;
    const percentages = [0.1, 0.3, 0.5, 0.7, 0.9];
    const timestamps = percentages.slice(0, sampleCount).map((p) => Math.max(0.5, p * effectiveDuration));

    const samples: VideoFrameSample[] = [];
    let currentIndex = 0;

    const captureNext = () => {
      if (currentIndex >= timestamps.length) {
        cleanUp();
        resolve(samples);
        return;
      }

      video.currentTime = timestamps[currentIndex];
    };

    video.onseeked = () => {
      if (!ctx) {
        currentIndex++;
        captureNext();
        return;
      }

      // Max sample dimension 640 for lightweight processing
      const maxDim = 640;
      let w = video.videoWidth || 640;
      let h = video.videoHeight || 360;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(video, 0, 0, w, h);

      const dHash = computeCanvasDHash(canvas);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      samples.push({
        timestamp: timestamps[currentIndex],
        dataUrl,
        dHash,
      });

      currentIndex++;
      captureNext();
    };

    video.onerror = () => {
      cleanUp();
      resolve(samples); // Return any samples gathered so far
    };

    video.onloadeddata = () => {
      captureNext();
    };

    // Timeout safety in case seeking hangs on corrupted video
    setTimeout(() => {
      if (samples.length === 0) {
        cleanUp();
        resolve([]);
      }
    }, 12000);
  });
}
