import { AIAnalysisRequest, VideoAnalysis, TitleCandidate } from '../../types/ai';
import { CompletePlatformPackage } from '../../types/platform';
import { SupportedLanguage } from '../../types/video';

export interface AIProvider {
  name: string;
  analyzeVideo(request: AIAnalysisRequest): Promise<VideoAnalysis>;
  generatePlatformPackage(
    analysis: VideoAnalysis,
    language: SupportedLanguage,
    targetUsa: boolean,
    customInstructions?: string,
    templateStyle?: string
  ): Promise<CompletePlatformPackage>;
  regenerateTitles(
    analysis: VideoAnalysis,
    language: SupportedLanguage,
    targetUsa: boolean
  ): Promise<TitleCandidate[]>;
  testConnection(apiKey: string): Promise<{ success: boolean; message: string }>;
}
