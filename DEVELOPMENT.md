# Developer Guide — Viral Video AI Studio

Engineering reference for developing, debugging, testing, and extending Viral Video AI Studio.

---

## 🛠️ Development Setup

```bash
# Install dependencies
npm install

# Start Vite dev server for web testing (HMR)
npm run dev

# Run Vitest test suite in watch mode
npm run test:watch

# Strict TypeScript typechecking
npm run typecheck

# Production build for Chrome Web Store / unpacked loading
npm run build
```

---

## 🧩 Adding a New AI Provider

The codebase utilizes an `AIProvider` abstraction. To integrate a new model provider (e.g. Anthropic, OpenAI, or local Ollama):

1. Create `src/ai/providers/myProvider.ts` implementing `AIProvider`:
   ```ts
   import { AIProvider } from './base';
   import { AIAnalysisRequest, VideoAnalysis, TitleCandidate } from '../../types/ai';
   import { CompletePlatformPackage } from '../../types/platform';
   import { SupportedLanguage } from '../../types/video';

   export class MyNewProvider implements AIProvider {
     name = 'My Provider';
     async analyzeVideo(req: AIAnalysisRequest): Promise<VideoAnalysis> { ... }
     async generatePlatformPackage(...): Promise<CompletePlatformPackage> { ... }
     async regenerateTitles(...): Promise<TitleCandidate[]> { ... }
     async testConnection(...): Promise<{ success: boolean; message: string }> { ... }
   }
   ```
2. Register the provider in `src/state/queueStore.ts`.

---

## 🔍 Testing Crash Recovery Locally

1. Add 10+ video files in the Bulk Queue.
2. While jobs are analyzing, refresh the page or reload the extension.
3. Upon reload, the `showCrashRecoveryModal` state activates, displaying the banner:
   *"Interrupted Batch Detected: A previous video batch was interrupted by extension reload or browser close."*
4. Clicking **Resume Batch** re-enqueues unfinished jobs without re-processing already completed ones!
