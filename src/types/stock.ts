/**
 * 保有株情報
 */
export interface StockHolding {
  /** 銘柄コード (例: "7203.T", "AAPL") */
  symbol: string;
  /** 保有株数 */
  shares: number;
  /** 平均取得単価 */
  averageCost: number;
  /** 追加日時 (timestamp) */
  addedAt: number;
}

/**
 * 株価情報
 */
export interface StockQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  previousClose: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: number;
}

/**
 * チャートデータ
 */
export interface ChartData {
  timestamp: number[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
}

/**
 * 株価データ（Quote + Chart）
 */
export interface StockData {
  quote: StockQuote;
  chart: ChartData;
}

/**
 * ニュース項目
 */
export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}

/**
 * チャート期間
 */
export type ChartRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y';

/**
 * チャート間隔
 */
export type ChartInterval = '5m' | '15m' | '1h' | '1d';

/**
 * 銘柄検索結果
 */
export interface SearchResult {
  symbol: string;
  shortName: string;
  longName: string;
  exchange: string;
  type: string;
}

/**
 * メッセージリクエスト型
 */
export type MessageRequest =
  | { type: 'FETCH_STOCK_DATA'; symbol: string; range?: ChartRange; interval?: ChartInterval }
  | { type: 'FETCH_NEWS'; symbol: string }
  | { type: 'SEARCH_STOCKS'; query: string };

/**
 * メッセージレスポンス型
 */
export type MessageResponse<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * ストレージスキーマ
 */
export interface StorageSchema {
  holdings: StockHolding[];
  settings: {
    refreshInterval: number;
    defaultChartRange: ChartRange;
    theme: 'light' | 'dark' | 'system';
  };
}
