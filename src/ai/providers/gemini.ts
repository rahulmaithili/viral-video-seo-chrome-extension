import { AIProvider } from './base';
import { AIAnalysisRequest, VideoAnalysis, TitleCandidate } from '../../types/ai';
import { CompletePlatformPackage } from '../../types/platform';
import { SupportedLanguage } from '../../types/video';
import { buildAnalysisSystemPrompt, buildAnalysisUserPrompt } from '../prompts/builder';

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini (Official REST)';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model = 'gemini-3.6-flash') {
    this.apiKey = apiKey;
    this.model = this.sanitizeModel(model);
  }

  private sanitizeModel(modelName?: string): string {
    if (!modelName) return 'gemini-3.6-flash';
    let clean = modelName.startsWith('models/') ? modelName.replace('models/', '') : modelName;
    if (clean.includes('2.5-flash') || clean.includes('gemini-2.5')) {
      return 'gemini-3.6-flash';
    }
    return clean;
  }

  private async callGemini(payload: unknown, retryCount = 0): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Gemini API key is not configured. Please enter your API key in Settings.');
    }

    this.model = this.sanitizeModel(this.model);
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Handle 429 rate limit with exponential backoff
        if (res.status === 429 && retryCount < 3) {
          const delayMs = Math.pow(2, retryCount) * 1000 + Math.random() * 500;
          await new Promise((r) => setTimeout(r, delayMs));
          return this.callGemini(payload, retryCount + 1);
        }

        const errData = await res.json().catch(() => ({}));
        const errMsg = errData.error?.message || `Gemini API error (Status ${res.status})`;

        // Auto-heal if endpoint signals model deprecation
        if (
          retryCount === 0 &&
          (errMsg.includes('gemini-2.5-flash') ||
            (errMsg.includes('no longer available') && errMsg.includes('gemini-3.6-flash')))
        ) {
          console.warn('Deprecated model detected by Google endpoint. Auto-upgrading to gemini-3.6-flash and retrying...');
          this.model = 'gemini-3.6-flash';
          return this.callGemini(payload, retryCount + 1);
        }

        throw new Error(errMsg);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty response from Gemini API.');
      }
      return text;
    } catch (err: unknown) {
      if (err instanceof Error) throw err;
      throw new Error(String(err));
    }
  }

  async testConnection(apiKey: string): Promise<{ success: boolean; message: string; modelUsed: string }> {
    const originalKey = this.apiKey;
    this.apiKey = apiKey;
    this.model = this.sanitizeModel(this.model);
    try {
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Ping. Output JSON: {"status": "ok"}' }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      };
      await this.callGemini(payload);
      return {
        success: true,
        message: `Gemini API connection successful! Using model: ${this.model}`,
        modelUsed: this.model,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, message: msg, modelUsed: this.model };
    } finally {
      this.apiKey = originalKey;
    }
  }

  async analyzeVideo(req: AIAnalysisRequest): Promise<VideoAnalysis> {
    const systemPrompt = buildAnalysisSystemPrompt();
    const userPrompt = buildAnalysisUserPrompt(req);

    // Build multimodal content parts
    const parts: unknown[] = [{ text: userPrompt }];

    // Attach frame images if available (convert data URL to base64)
    if (req.frames && req.frames.length > 0) {
      for (const frame of req.frames.slice(0, 5)) {
        const base64Data = frame.dataUrl.split(',')[1];
        if (base64Data) {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data,
            },
          });
        }
      }
    }

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    };

    const rawResponse = await this.callGemini(payload);

    try {
      const parsed = JSON.parse(rawResponse);
      return this.normalizeAnalysis(parsed, req.videoId);
    } catch (err) {
      throw new Error(`Failed to parse structured Gemini output: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async generatePlatformPackage(
    analysis: VideoAnalysis,
    language: SupportedLanguage,
    targetUsa: boolean,
    customInstructions?: string,
    templateStyle?: string
  ): Promise<CompletePlatformPackage> {
    const prompt = `You are a social media optimization expert.
Strict facts:
- Category: ${analysis.category}
- Main subject: ${analysis.facts.subject}
- Action: ${analysis.facts.action}
- Setting: ${analysis.facts.setting}
- Emotions: ${analysis.facts.emotions.join(', ')}
- Location: ${analysis.facts.location || 'Unknown/unspecified'}
- Selected Viral Angle: ${analysis.bestViralAngle}
- Language: ${language}
- USA Target: ${targetUsa ? 'ON (Optimize for US audience conventions; NEVER fabricate US locations or false facts)' : 'OFF'}
- Style: ${templateStyle || 'Viral'}
${customInstructions ? `Custom Instructions: ${customInstructions}` : ''}

Generate platform-specific packages for YouTube, Facebook, and Instagram.
Language rules:
- If English: natural English
- If Hindi: authentic Devanagari Hindi (हिन्दी)
- If Hinglish: natural conversational Roman Hinglish (Latin alphabet)

Respond with JSON adhering to:
{
  "youtube": {
    "titleCandidates": [
      { "title": "Title 1", "hookScore": 92, "clarityScore": 95, "relevanceScore": 98, "searchScore": 90, "shareabilityScore": 91, "overallScore": 93, "isBest": true }
      // 10 candidates total!
    ],
    "bestTitle": "Best Title",
    "titleScore": 93,
    "shortDescription": "...",
    "longDescription": "...",
    "seoDescription": "...",
    "tags": ["tag1", "tag2"],
    "hashtags": ["#tag1", "#tag2"],
    "primaryKeywords": ["..."],
    "secondaryKeywords": ["..."],
    "longTailKeywords": ["..."],
    "searchIntent": "...",
    "hook": "...",
    "cta": "..."
  },
  "facebook": {
    "headline": "...",
    "caption": "...",
    "description": "...",
    "hashtags": ["#tag1"],
    "keywords": ["..."],
    "cta": "...",
    "engagementPrompt": "...",
    "shortVersion": "...",
    "longVersion": "..."
  },
  "instagram": {
    "reelHook": "...",
    "firstLine": "...",
    "caption": "...",
    "searchKeywords": ["..."],
    "hashtags": ["#tag1"],
    "cta": "..."
  }
}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: 'Grounded Social Media Content Optimizer. Maintain strict factuality.' }],
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    };

    const rawResponse = await this.callGemini(payload);
    const parsed = JSON.parse(rawResponse);

    return {
      videoId: analysis.videoId,
      language,
      targetUsa,
      youtube: parsed.youtube,
      facebook: parsed.facebook,
      instagram: parsed.instagram,
      generatedAt: Date.now(),
    };
  }

  async regenerateTitles(
    analysis: VideoAnalysis,
    language: SupportedLanguage,
    targetUsa: boolean
  ): Promise<TitleCandidate[]> {
    const prompt = `Generate 10 fresh viral and factual title candidates for:
Subject: ${analysis.facts.subject}
Action: ${analysis.facts.action}
Angle: ${analysis.bestViralAngle}
Language: ${language}
USA Targeting: ${targetUsa ? 'ON' : 'OFF'}

Format as JSON:
{
  "titles": [
    { "title": "...", "hookScore": 90, "clarityScore": 92, "relevanceScore": 95, "searchScore": 88, "shareabilityScore": 91, "overallScore": 91, "isBest": true }
  ]
}`;

    const payload = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    };

    const raw = await this.callGemini(payload);
    const parsed = JSON.parse(raw);
    return parsed.titles || [];
  }

  private normalizeAnalysis(raw: Record<string, unknown>, videoId: string): VideoAnalysis {
    return {
      videoId,
      summary: (raw.summary as string) || 'Video analyzed.',
      category: (raw.category as string) || 'General',
      subcategory: (raw.subcategory as string) || 'General',
      niche: (raw.niche as string) || 'General',
      contentType: (raw.contentType as string) || 'Short-form',
      confidence: (raw.confidence as 'High' | 'Medium' | 'Low') || 'High',
      facts: (raw.facts as VideoAnalysis['facts']) || {
        subject: 'Subject',
        action: 'Action',
        setting: 'Setting',
        emotions: ['engaging'],
        location: null,
        locationConfidence: 0,
        brands: [],
        people: [],
        animals: [],
        objects: [],
        onScreenText: [],
        confidence: 0.9,
      },
      scenes: (raw.scenes as VideoAnalysis['scenes']) || [],
      targetAudience: (raw.targetAudience as string[]) || ['General Audience'],
      viralAngles: (raw.viralAngles as VideoAnalysis['viralAngles']) || [],
      bestViralAngle: (raw.bestViralAngle as string) || 'Engaging Content',
      viralScore: (raw.viralScore as VideoAnalysis['viralScore']) || {
        overallScore: 85,
        hookPotential: 85,
        retentionPotential: 85,
        clarity: 90,
        emotion: 80,
        originality: 80,
        shareability: 85,
        commentPotential: 80,
        explanation: 'Strong estimated engagement potential.',
      },
      keywords: (raw.keywords as VideoAnalysis['keywords']) || [],
      explanation: (raw.explanation as VideoAnalysis['explanation']) || {
        whyThisTitle: 'Selected based on factual video cues and strong retention hook.',
        whyTheseKeywords: 'Grounded strictly in video subject without fabricated search volumes.',
        whyThisViralScore: 'Estimated based on clarity, emotional resonance, and pacing.',
      },
    };
  }
}
