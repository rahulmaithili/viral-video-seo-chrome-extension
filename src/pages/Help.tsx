import React from 'react';
import { HelpCircle, ShieldCheck, Flag, Globe, Layers } from 'lucide-react';

export const Help: React.FC = () => {
  return (
    <div className="space-y-6 pb-12 max-w-4xl text-xs leading-relaxed text-gray-300">
      {/* Header */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5">
        <span className="text-xs font-bold text-brand-400 uppercase tracking-wider">Documentation & Specifications</span>
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <HelpCircle className="w-5 h-5 text-brand-400" />
          <span>System Architecture & Engineering Guide</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          Reference guide for Master AI Pipeline, USA Audience Targeting, Language Contracts, and MV3 Chrome Installation.
        </p>
      </div>

      {/* 30-Step Master AI Pipeline */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Layers className="w-4 h-4 text-brand-400" />
          <span>Master 30-Step AI Processing Pipeline</span>
        </h3>
        <p className="text-gray-400">
          Every video job is processed through this deterministic, error-isolated pipeline:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 text-[11px]">
          {[
            '01. Video Ingestion',
            '02. Integrity Validation',
            '03. Multi-Level Fingerprint',
            '04. Duplicate Scanning',
            '05. Video Understanding',
            '06. Fact Extraction',
            '07. Category / Niche Detect',
            '08. Audience Demographics',
            '09. Honest Trend Query',
            '10. Keyword Generation',
            '11. Relevance Filter (≥70)',
            '12. Viral Angle Selection',
            '13. Title Generation (10x)',
            '14. Caption Variations',
            '15. SEO Descriptions',
            '16. Tag Dedup & Rank',
            '17. Hashtag Curation',
            '18. Platform Adaptation',
            '19. Language Transform',
            '20. USA Targeting Logic',
            '21. Factuality Validator',
            '22. Language Validator',
            '23. Keyword Spam Check',
            '24. Duplicate Output Check',
            '25. Quality Scoring',
            '26. Viral Scoring (0-100)',
            '27. IndexedDB Persistence',
            '28. 3-Panel User Review',
            '29. One-Click Copy / Export',
            '30. Official API Flow',
          ].map((step, idx) => (
            <div key={idx} className="bg-gray-950 border border-gray-800 rounded-lg p-2 font-mono text-gray-300">
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Non-Negotiable Product Principles */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Non-Negotiable Principles</span>
        </h3>
        <ul className="space-y-2 list-disc list-inside text-gray-300">
          <li><strong>ACCURACY &gt; VIRALITY:</strong> Never generate misleading clickbait that conflicts with video content.</li>
          <li><strong>RELEVANCE &gt; KEYWORD QUANTITY:</strong> Unrelated celebrities, locations, and events are strictly rejected.</li>
          <li><strong>FACTS &gt; CREATIVITY:</strong> All generated titles and descriptions must be grounded against the canonical fact object.</li>
          <li><strong>REAL TREND DATA &gt; FABRICATED TREND DATA:</strong> If live trend data is unavailable, display honest status rather than manufactured numbers.</li>
          <li><strong>ONE FAILED VIDEO NEVER STOPS THE BATCH:</strong> Individual error states ensure 99 jobs continue if 1 fails.</li>
        </ul>
      </div>

      {/* USA Targeting & Language Guide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* USA Targeting */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Flag className="w-4 h-4 text-sky-400" />
            <span>USA Audience Optimization</span>
          </h4>
          <p className="text-gray-400">
            <strong>Target USA = Audience Optimization, NOT permission to invent facts.</strong>
          </p>
          <p className="text-gray-300">
            When USA is ON, hooks, pacing, search intent, and phrasing match US English cultural conventions.
            However, the engine NEVER invents a US location, landmark, or event if not actually established in the video.
          </p>
        </div>

        {/* Language Selection */}
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-2">
          <h4 className="text-sm font-bold text-white flex items-center space-x-2">
            <Globe className="w-4 h-4 text-purple-400" />
            <span>Strict Language Contract</span>
          </h4>
          <p className="text-gray-400">
            Output strictly honors the chosen language across all generated fields:
          </p>
          <ul className="space-y-1 list-disc list-inside text-gray-300">
            <li><strong>English:</strong> Standard or US conversational English.</li>
            <li><strong>Hindi:</strong> Proper grammatical Hindi in Devanagari script (हिन्दी).</li>
            <li><strong>Hinglish:</strong> Natural conversational Roman Hindi in Latin script.</li>
          </ul>
        </div>
      </div>

      {/* Chrome MV3 Extension Loading */}
      <div className="bg-gray-900/80 border border-gray-800 rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-white">How to Load this Extension in Chrome</h3>
        <ol className="space-y-1.5 list-decimal list-inside text-gray-300">
          <li>Open Google Chrome and navigate to <code className="bg-gray-950 px-1.5 py-0.5 rounded text-brand-300">chrome://extensions</code></li>
          <li>Toggle on <strong>Developer mode</strong> in the top-right corner.</li>
          <li>Click the <strong>Load unpacked</strong> button in the top-left.</li>
          <li>Select the <code className="bg-gray-950 px-1.5 py-0.5 rounded text-brand-300">dist/</code> directory inside this project folder.</li>
          <li>The <strong>Viral Video AI Studio — Rahul Scripts</strong> extension icon will appear in your Chrome toolbar!</li>
        </ol>
      </div>
    </div>
  );
};
