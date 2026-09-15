# Privacy Policy — Rahul Scripts

**Effective Date:** September 15, 2026  
**Product:** Viral Video AI Studio (Chrome Extension Manifest V3)  
**Publisher:** Rahul Scripts  

---

## 1. Zero Personal Data Collection

Viral Video AI Studio is designed with a **privacy-first architecture**:
- We do **not** collect, store, sell, or transmit any personally identifiable information (PII).
- We do **not** use tracking cookies, browser fingerprinting, or third-party analytics SDKs.

## 2. Local Video Processing

- All video file ingestion, metadata extraction, frame sampling, and difference hash (dHash) calculations occur **100% locally** within your browser via native Web APIs (HTML5 `<video>`, `<canvas>`, Web Crypto).
- Raw video files are **never uploaded to external servers**.

## 3. Direct AI Communication

- When using Google Gemini mode, frame snapshots and metadata are transmitted directly from your browser to Google's official Gemini endpoint (`https://generativelanguage.googleapis.com`) using your own personal API key.
- Your Gemini API key is stored securely in your browser's private `chrome.storage.local` sandbox. It is never transmitted to Rahul Scripts or any intermediary servers.

## 4. Permissions Justification

- **`storage`**: Used exclusively to store user settings (selected language, model preferences, developer mode) and keep analysis history within your local IndexedDB.
- **`alarms`**: Used to maintain healthy background service worker keepalive without storing persistent state in memory.
- **`tabs`**: Used exclusively to open the Full Studio Dashboard in a new browser tab when clicking "Launch Full Dashboard".
- **`host_permissions` (`https://generativelanguage.googleapis.com/*`)**: Required solely to make secure REST API calls directly to Google Gemini.

## 5. Contact & Support

For questions regarding this privacy policy or technical assistance, contact the Rahul Scripts engineering team.
