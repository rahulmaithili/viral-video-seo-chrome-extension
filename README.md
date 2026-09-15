# Viral Video AI Studio — Rahul Scripts (Version 3.0 Pro)

> **Advanced AI-powered Chrome Extension for bulk video analysis, multi-level duplicate detection, and social-media metadata optimization.**

![Rahul Scripts Logo](logo-asset-pack/website/rahul-scripts-header.svg)

---

## 🌟 Overview

**Viral Video AI Studio** is a production-grade Chrome Extension (Manifest V3) built with React 19, TypeScript, Vite, and Tailwind CSS. Designed for video creators, editors, and growth agencies, it ingests video batches, performs client-side frame sampling and multi-level duplicate detection, extracts canonical fact objects, and generates grounded, platform-specific metadata packages for **YouTube**, **Facebook**, and **Instagram**.

---

## 🚀 Key Capabilities

1. **Client-Side Bulk Ingestion**:
   - Drag & drop 1, 10, 50, 100+ videos.
   - Concurrency pool (1, 2, 3, 5 workers) with backpressure and failure isolation.
   - Crash recovery: all jobs and batch states are continuously persisted in IndexedDB.

2. **6-Level Duplicate Detection Engine**:
   - **Level 1**: SHA-256 binary file hash.
   - **Level 2**: Technical metadata signature (`duration_dimensions_bitrate`).
   - **Level 3**: Perceptual visual frame difference hashes (dHash) computed across deterministic timestamps (10%, 30%, 50%, 70%, 90%).
   - **Level 4**: Audio clues.
   - **Level 5**: Semantic topic comparison.
   - **Level 6**: Generated content Jaccard similarity.
   - Accurately detects renamed duplicates (e.g. `dog.mp4` vs `dog_final.mp4`) without wasting AI quota.

3. **Master 30-Step Grounded AI Pipeline**:
   - Extracts a strict **Canonical Fact Object** (subject, action, setting, emotions, objects, animals, location confidence).
   - Generates 10 scored candidate titles with hook, clarity, search, and shareability metrics.
   - Platform adaptations: SEO long descriptions & tags for YouTube, shareable headlines & engagement prompts for Facebook, punchy hooks & hashtags for Instagram Reels.
   - Honest Trend Provider: Never manufactures fake trend numbers or fabricated Google Trends data.

4. **Strict Language & USA Targeting Control**:
   - **English**: Natural global or US conversational English.
   - **Hindi**: Authentic Devanagari script (हिन्दी) verified by script validation.
   - **Hinglish**: Natural conversational Roman Hindi (Latin alphabet).
   - **USA Audience Optimization**: Adjusts phrasing, pacing, and hooks for American audiences while strictly prohibiting hallucinated US locations or fabricated events.

5. **3-Panel Master Workspace**:
   - **Left**: Video player preview, technical metadata & scene timeline (Hook, Action, Payoff).
   - **Center**: Canonical fact object, viral score breakdown (0–100), and AI reasoning ("Why this title?", "Why these keywords?").
   - **Right**: Tabbed platform packages (YouTube, Facebook, Instagram) with inline editors, one-click copy, and title regeneration.

6. **Exports & Offline Mock Mode**:
   - One-click copy for individual fields or full packages.
   - Export full batches to CSV, JSON, and formatted TXT.
   - Built-in **Mock AI Provider** enables instant testing across 10 categories without an API key.

---

## 📦 Project Structure

```
├── logo-asset-pack/        # Official Rahul Scripts logo assets (monogram, wordmark, app icons)
├── public/
│   ├── icons/             # 16, 32, 48, 128 px extension icons
│   └── manifest.json      # Chrome Manifest V3 declaration
├── src/
│   ├── ai/                # AI Provider abstraction, Gemini REST API, Mock Provider, security sanitizers
│   ├── app/               # Main Dashboard App & Popup App
│   ├── components/        # Layout, Navbar, Badges, ProgressBars, Modals
│   ├── config/            # Default settings, models, smart presets
│   ├── content/           # Master 30-step pipeline, language engines, validation
│   ├── export/            # CSV, JSON, TXT, and Clipboard exporters
│   ├── keywords/          # Keyword generation, relevance scoring (≥70%), spam filter
│   ├── pages/             # Dashboard, BulkQueue, Workspace, History, Templates, Trends, Settings, Help
│   ├── queue/             # Concurrency worker pool, backpressure, crash recovery
│   ├── state/             # Zustand stores for settings and queue state
│   ├── storage/           # IndexedDB database, repositories, chrome.storage wrapper
│   ├── trends/            # Honest Trend Provider abstraction
│   ├── types/             # Strict TypeScript interfaces
│   └── video/             # Frame sampler, dHash, SHA-256, duplicate detector
├── tests/                 # Vitest test suites (duplicate, language, facts, pipeline)
└── scripts/               # Icon & asset pack generation utilities
```

---

## 🔧 Installation & Build

```bash
# 1. Install dependencies
npm install

# 2. Run automated test suite
npm test

# 3. Compile production build
npm run build
```

---

## 🌐 Loading in Google Chrome

1. Build the extension using `npm run build`.
2. Open Chrome and navigate to `chrome://extensions`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left corner.
5. Select the `dist/` directory inside this repository.
6. The extension is now active in your browser toolbar!

---

## 🛡️ Non-Negotiable Engineering Principles

- **ACCURACY > VIRALITY**: No misleading clickbait that contradicts video facts.
- **FACTS > CREATIVITY**: All titles and descriptions are grounded in established facts.
- **REAL TREND DATA > FABRICATED TREND DATA**: If live data is unavailable, display honest status rather than manufactured numbers.
- **ONE FAILED VIDEO NEVER STOPS THE BATCH**: Individual jobs have isolated error states.
- **SECURITY**: Local storage of credentials, prompt injection sanitization, zero tracking cookies.

---

## 📄 License & Brand
Copyright © 2026 Rahul Scripts. All rights reserved.
