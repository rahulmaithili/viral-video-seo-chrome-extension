import { TrendProvider, TrendDataResult } from './base';

export class HonestTrendProvider implements TrendProvider {
  name = 'Honest Trend Provider (Strict No-Fabrication)';
  private liveApiConfigured = false;

  constructor(liveApiConfigured = false) {
    this.liveApiConfigured = liveApiConfigured;
  }

  isAvailable(): boolean {
    return this.liveApiConfigured;
  }

  async getTrendData(term: string): Promise<TrendDataResult> {
    if (!this.liveApiConfigured) {
      // NEVER fabricate numbers or falsely claim trending
      return {
        term,
        searchVolume: null,
        trendScore: null,
        isTrending: false,
        source: 'Live trend data unavailable (No authorized live provider connected)',
      };
    }

    // When authorized live provider is wired in the future:
    return {
      term,
      searchVolume: null,
      trendScore: null,
      isTrending: false,
      source: 'Live API',
    };
  }
}
