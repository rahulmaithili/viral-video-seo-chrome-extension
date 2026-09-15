export interface TrendDataResult {
  term: string;
  searchVolume: number | null;
  trendScore: number | null; // 0 to 100 or null
  isTrending: boolean;
  source: string;
}

export interface TrendProvider {
  name: string;
  isAvailable(): boolean;
  getTrendData(term: string): Promise<TrendDataResult>;
}
