import { describe, it, expect } from 'vitest';
import { checkDuplicate, FingerprintWithRef } from '../src/video/duplicate/detector';
import { VideoFingerprint } from '../src/types/video';

describe('Duplicate Detection Engine (Levels 1-6)', () => {
  const existingFingerprint: VideoFingerprint = {
    id: 'vid_existing_1',
    sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    metadataSignature: 'meta:15.0s_1920x1080_16:9_2048kb',
    perceptualHashes: ['a1b2c3d4e5f60718', '1807f6e5d4c3b2a1', 'f0e1d2c3b4a59687'],
    createdAt: Date.now() - 100000,
  };

  const existingList: FingerprintWithRef[] = [
    {
      fingerprint: existingFingerprint,
      filename: 'dog_original.mp4',
      videoId: 'vid_existing_1',
    },
  ];

  it('detects exact binary duplicate via SHA-256 (Level 1)', () => {
    const candidate: VideoFingerprint = {
      id: 'vid_candidate_exact',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      metadataSignature: 'meta:15.0s_1920x1080_16:9_2048kb',
      perceptualHashes: ['a1b2c3d4e5f60718', '1807f6e5d4c3b2a1', 'f0e1d2c3b4a59687'],
      createdAt: Date.now(),
    };

    const result = checkDuplicate(candidate, existingList, 90);
    expect(result.isDuplicate).toBe(true);
    expect(result.score).toBe(100);
    expect(result.level).toBe(1);
    expect(result.matchedFilename).toBe('dog_original.mp4');
  });

  it('detects renamed duplicate with same video frames via perceptual dHash (Level 3)', () => {
    const candidate: VideoFingerprint = {
      id: 'vid_candidate_renamed',
      sha256: 'different_file_hash_due_to_metadata_or_tag_edit',
      metadataSignature: 'meta:15.0s_1920x1080_16:9_2048kb',
      perceptualHashes: ['a1b2c3d4e5f60718', '1807f6e5d4c3b2a1', 'f0e1d2c3b4a59687'], // identical visual frames
      createdAt: Date.now(),
    };

    const result = checkDuplicate(candidate, existingList, 90);
    expect(result.isDuplicate).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.level).toBe(3);
  });

  it('identifies genuinely unique video with distinct hashes', () => {
    const candidate: VideoFingerprint = {
      id: 'vid_candidate_unique',
      sha256: 'completely_different_hash_1234567890abcdef',
      metadataSignature: 'meta:45.0s_1080x1920_9:16_5120kb',
      perceptualHashes: ['0000000000000000', 'ffffffffffffffff', '5555555555555555'],
      createdAt: Date.now(),
    };

    const result = checkDuplicate(candidate, existingList, 90);
    expect(result.isDuplicate).toBe(false);
    expect(result.score).toBeLessThan(75);
  });
});
