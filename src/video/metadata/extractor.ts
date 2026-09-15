import { VideoMetadata } from '../../types/video';

export async function extractVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    // Check file type
    if (!file.type.startsWith('video/') && !file.name.match(/\.(mp4|mov|avi|webm|mkv|flv|wmv)$/i)) {
      reject(new Error(`File "${file.name}" does not appear to be a supported video format.`));
      return;
    }

    const video = document.createElement('video');
    video.preload = 'metadata';
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
    };

    video.onloadedmetadata = () => {
      const width = video.videoWidth || 1920;
      const height = video.videoHeight || 1080;
      const duration = video.duration || 0;

      // Calculate aspect ratio string
      let aspectRatio = '16:9';
      const ratio = width / height;
      if (Math.abs(ratio - 9 / 16) < 0.1) aspectRatio = '9:16';
      else if (Math.abs(ratio - 1) < 0.1) aspectRatio = '1:1';
      else if (Math.abs(ratio - 4 / 5) < 0.1) aspectRatio = '4:5';
      else if (Math.abs(ratio - 4 / 3) < 0.1) aspectRatio = '4:3';
      else if (Math.abs(ratio - 16 / 9) < 0.1) aspectRatio = '16:9';
      else aspectRatio = `${width}:${height}`;

      cleanup();

      resolve({
        filename: file.name,
        filesize: file.size,
        duration,
        width,
        height,
        aspectRatio,
        format: file.type || 'video/mp4',
      });
    };

    video.onerror = () => {
      cleanup();
      // Even if video decode fails in browser container, fallback to basic file info
      resolve({
        filename: file.name,
        filesize: file.size,
        duration: 0,
        width: 1920,
        height: 1080,
        aspectRatio: '16:9',
        format: file.type || 'video/mp4',
      });
    };
  });
}
