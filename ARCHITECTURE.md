# Architecture & System Design — Viral Video AI Studio Pro

## 1. High-Level Architecture

Viral Video AI Studio follows a modular, client-side, privacy-first Chrome Extension Manifest V3 architecture. Heavy video processing (frame sampling, difference hashing, binary hashing) occurs directly in the user's browser using HTML5 `<video>`, `<canvas>`, and Web Crypto APIs, avoiding external video transcoding infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│                    Chrome Extension (MV3)                   │
├──────────────────────────────┬──────────────────────────────┤
│ Popup UI (380px)             │ Full Studio Dashboard Tab    │
│  - Quick queue overview      │  - Dashboard Metrics         │
│  - Instant upload trigger    │  - Bulk Queue Table          │
│  - Global language switch    │  - 3-Panel Analysis Workspace│
│  - USA toggle                │  - History & Templates       │
│  - Launch dashboard          │  - Trend Intelligence        │
├──────────────────────────────┴──────────────────────────────┤
│                    Application State (Zustand)              │
│       Queue Store  •  Settings Store  •  Analysis Store     │
├─────────────────────────────────────────────────────────────┤
│                    Queue Engine & Worker Pool               │
│  - Configurable concurrency (1, 2, 3, 5 workers)            │
│  - Crash recovery & state persistence in IndexedDB           │
│  - Independent error isolation & exponential retry backoff  │
├─────────────────────────────────────────────────────────────┤
│                    Master 30-Step AI Pipeline               │
│  01. Ingestion               16. Tag Dedup & Rank           │
│  02. Format Validation       17. Hashtag Curation           │
│  03. Multi-Level Fingerprint 18. Platform Adaptation        │
│  04. Duplicate Scanning      19. Language Transformation    │
│  05. Video Understanding     20. USA Targeting Logic        │
│  06. Fact Extraction         21. Factuality Validator       │
│  07. Category / Niche Detect 22. Language Validator         │
│  08. Audience Demographics   23. Keyword Spam Check         │
│  09. Honest Trend Query      24. Duplicate Output Check     │
│  10. Keyword Generation      25. Quality Scoring            │
│  11. Relevance Filter (≥70)  26. Viral Scoring (0-100)      │
│  12. Viral Angle Selection   27. IndexedDB Persistence      │
│  13. Title Generation (10x)  28. 3-Panel User Review        │
│  14. Caption Variations      29. One-Click Copy / Export    │
│  15. SEO Descriptions        30. Official API Flow          │
├──────────────────────────────┬──────────────────────────────┤
│ Provider Abstraction         │ Storage Layer                │
│  - GeminiProvider (REST API) │  - IndexedDB (Jobs, History) │
│  - MockAIProvider (Offline)  │  - chrome.storage.local      │
│  - HonestTrendProvider       │  - chrome.storage.sync       │
└──────────────────────────────┴──────────────────────────────┘
```

## 2. Multi-Level Duplicate Detection Engine

Duplicate detection operates across 6 distinct levels to prevent duplicate uploads without wasting API quota:
1. **Level 1 (SHA-256 Binary Hash)**: Computes SHA-256 checksum over file array buffers using `crypto.subtle.digest`. Detects 100% exact file matches.
2. **Level 2 (Metadata Signature)**: Combines duration, width, height, aspect ratio, and approximate bitrate into a deterministic signature string (`meta:15.0s_1920x1080_16:9_2048kb`).
3. **Level 3 (Perceptual Frame dHash)**: Samples 5 frames at 10%, 30%, 50%, 70%, 90% timestamps. Scales each frame to 9x8 grayscale canvas and computes 64-bit difference hashes. Compares via Hamming distance. Detects re-encoded or renamed files (e.g. `dog.mp4` vs `dog_final.mp4`).
4. **Level 4 (Audio track verification)**: Checks track presence and duration consistency.
5. **Level 5 (Semantic Fingerprint)**: Compares AI-extracted subjects, actions, and scenes.
6. **Level 6 (Output Jaccard Similarity)**: Validates that batch outputs do not produce identical text across distinct videos.

## 3. Storage Architecture

IndexedDB is leveraged for large structured datasets:
- `videos`: Raw video metadata and cached frame poster data.
- `fingerprints`: Binary SHA-256 hashes and perceptual dHash arrays.
- `jobs`: Complete queue state for crash recovery.
- `analyses`: Extracted canonical fact objects, timeline scenes, viral scores.
- `packages`: Multi-platform metadata (YouTube, Facebook, Instagram).
- `history`: Deduplicated history searchable by topic, title, category, and keywords.

`chrome.storage.local` is used for user preferences, theme, and API keys.
