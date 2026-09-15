# Chrome Web Store Listing — Viral Video AI Studio Pro

**Last Updated:** September 15, 2026  
**Version:** 3.0.0  
**Brand:** Rahul Scripts  

---

## 1. Extension Metadata

- **Name:** Viral Video AI Studio — Rahul Scripts
- **Short Name:** Viral Video AI
- **Category:** Productivity / Social Media Optimization
- **Short Description (max 132 chars):** Bulk video analysis, multi-level duplicate detection, and social metadata optimization for YouTube, Facebook & Instagram.

---

## 2. Detailed Store Description

Transform raw video batches into viral, grounded social media metadata packages in seconds.

Viral Video AI Studio by Rahul Scripts is a professional AI-driven Chrome Extension built for content creators, video editors, and digital agencies. It ingests video batches locally in your browser, detects duplicates across multiple visual and technical levels, and generates platform-optimized titles, descriptions, hashtags, and keywords for YouTube, Facebook, and Instagram Reels.

### 🌟 Key Features:
- **Bulk Video Ingestion:** Process 1, 10, 50, or 100+ videos with concurrency controls (1–5 parallel workers) and crash recovery.
- **6-Level Duplicate Detection:** Detects identical and renamed duplicates (SHA-256 binary hash, technical metadata, and visual frame difference hashes) to save time and API quota.
- **Canonical Fact Extraction:** Extracts grounded factual objects (subjects, actions, settings, emotions) so your metadata never invents false claims or hallucinated locations.
- **Platform-Specific Optimization:**
  - **YouTube:** 10 candidate titles with hook and search scores, SEO long descriptions, tags, and search-intent keywords.
  - **Facebook:** Shareable headlines, conversational captions, and viral engagement prompts.
  - **Instagram:** Punchy on-screen reel hooks, short discovery captions, and curated hashtag sets.
- **Global Language Control:** Generate in natural English, authentic Devanagari Hindi (हिन्दी), or natural Roman Hinglish.
- **Target USA Mode:** Tailors hooks, phrasing, and pacing for American viewers while strictly preserving video truth.
- **Honest Trend Intelligence:** Strictly prohibits manufactured trend data. When live data is unavailable, it reports authentic status rather than fake metrics.
- **Multi-Format Export:** Export your results to CSV, JSON, and formatted TXT content packages.
- **100% Offline Mock Mode:** Test all features out of the box without an API key.

---

## 3. Permissions Justifications

Every declared permission in `manifest.json` is strictly required for core user-facing functionality:

- **`storage`**: Stores user UI preferences (selected language, model, dark/light theme, concurrency limits) and local history in IndexedDB.
- **`alarms`**: Performs periodic keepalive pings for the Manifest V3 service worker during long-running bulk video queue operations.
- **`tabs`**: Required to programmatically open the Full Studio Dashboard in a new browser tab when the user clicks "Launch Full Studio Dashboard" from the extension popup.
- **`host_permissions` (`https://generativelanguage.googleapis.com/*`)**: Enables direct client-to-API communication with Google's Gemini models using the user's personal API key. No intermediate servers are used.

---

## 4. Privacy & Data Handling Disclosures

- **Single Purpose:** Bulk video analysis and social metadata generation.
- **Data Collection:** Zero personal data collected. No analytics, tracking cookies, or external server logs.
- **User Passwords/Cookies:** The extension never requests social media passwords, cookies, or unauthorized credentials.
