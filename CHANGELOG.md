# Changelog — Rahul Scripts Viral Video AI Studio

All notable changes to this project are documented in this file.

---

## [3.0.0 Pro] - 2026-09-15

### 🚀 Major Release & Architecture

- **Manifest V3 Chrome Extension**:
  - Full standalone Dashboard (`index.html`) + compact Popup (`popup.html`).
  - Ephemeral background service worker with alarm keepalive.
  - Official high-res Rahul Scripts RS Monogram icons (16px, 32px, 48px, 128px) and dark header wordmarks.

- **Multi-Level Duplicate Detection Engine**:
  - Level 1: SHA-256 binary file hash using Web Crypto API.
  - Level 2: Metadata signature (duration, dimensions, bitrate).
  - Level 3: Perceptual difference hash (dHash) computed across 5 deterministic frame samples (10%, 30%, 50%, 70%, 90%).
  - Detects renamed or re-encoded duplicates without wasting API quota.

- **Master 30-Step AI Processing Pipeline**:
  - Canonical Fact Object extraction to guarantee 100% factual grounding.
  - 10 candidate titles with individual hook, clarity, search, and shareability scores.
  - Platform-tailored packages for YouTube, Facebook, and Instagram Reels.
  - Keyword relevance filter enforcing ≥70 score cutoff and stripping spam.
  - Honest Trend Provider returning authentic status instead of manufactured numbers.

- **Global Language & USA Audience Control**:
  - Authentic English, proper Devanagari Hindi (हिन्दी), and natural Roman Hinglish.
  - USA Audience Optimization mode without hallucinating US locations or facts.
  - Secondary validation passes (Factuality, Language adherence, and Duplicate output check).

- **Robust Queue Engine & Crash Recovery**:
  - Concurrency worker pool (1, 2, 3, 5 parallel workers).
  - IndexedDB persistence for all jobs and queue states with automatic interrupted batch recovery.
  - Failure isolation: 1 failed job never halts the remaining batch.

- **Export & Tools**:
  - Bulk export to CSV, JSON, and formatted TXT packages.
  - One-click clipboard copy for individual fields or full packages.
  - Offline Mock AI Provider supporting 10 content categories for zero-key instant testing.
