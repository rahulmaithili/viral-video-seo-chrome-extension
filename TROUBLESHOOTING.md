# Troubleshooting Guide — Viral Video AI Studio

Common issues and solutions when operating or developing Viral Video AI Studio.

---

## 1. Extension Fails to Load in Chrome

- **Symptoms**: Chrome alerts *"Manifest file is missing or unreadable"* or *"Could not load icon"*.
- **Fix**:
  1. Verify you ran `npm run build` so that the `dist/` directory exists.
  2. Confirm `dist/manifest.json` exists.
  3. Ensure all icons (`dist/icons/icon-16.png`, `icon-48.png`, `icon-128.png`) are present.
  4. In `chrome://extensions`, click the refresh icon on the unpacked extension card.

---

## 2. Video Analysis Fails with Status FAILED

- **Symptoms**: Video shows red `FAILED` badge in the queue table.
- **Cause 1: Unset Gemini API Key**:
  - If Mock Mode is OFF and no API key is set, the API call is rejected.
  - **Fix**: Go to **Settings**, paste your key and click **Test Connection**, or toggle **Enable Mock Mode (100% Offline)** to ON.
- **Cause 2: Corrupted or Unsupported Video File**:
  - The extension supports standard MP4, MOV, WEBM, MKV containers. If browser video codecs cannot decode the file, the engine falls back to standard file metadata.
  - Click **Retry Failed** to retry once container streams are clear.

---

## 3. Duplicate Video Was Not Expected to be Flagged

- **Symptoms**: Video displays `DUPLICATE (95% Match)`.
- **Reason**: The Level 3 Perceptual visual frame difference hash (dHash) found that the sampled frames match an existing video in your current batch or historical IndexedDB database (e.g. `video.mp4` vs `video_final.mp4`).
- **Fix**:
  - If you intentionally want to re-process the exact same video, lower the **Duplicate Score Threshold** in **Settings** (e.g. from 90 to 98) or click **Process Anyway** in the workspace.

---

## 4. Rate Limiting (HTTP 429)

- **Symptoms**: Gemini API returns `429 Resource Exhausted`.
- **Automatic Handling**: The engine automatically executes exponential backoff (1s, 2s, 4s, 8s) with jitter.
- **Fix**:
  - In **Settings**, lower the **Concurrency** from 5 or 3 to 1 or 2 workers to stay well within free tier quota limits.
