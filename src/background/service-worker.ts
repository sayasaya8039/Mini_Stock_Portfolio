import type { MessageRequest, MessageResponse, StockData, NewsItem, SearchResult, ChartRange, ChartInterval } from '../types/stock';

/**
 * メッセージリスナー
 */
chrome.runtime.onMessage.addListener(
  (
    request: MessageRequest,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: MessageResponse) => void
  ) => {
    if (request.type === 'FETCH_STOCK_DATA') {
      fetchStockData(request.symbol, request.range, request.interval)
        .then((data) => sendResponse({ success: true, data }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true; // 非同期レスポンスを示す
    }

    if (request.type === 'FETCH_NEWS') {
      fetchNews(request.symbol)
        .then((news) => sendResponse({ success: true, data: news }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;
    }

    if (request.type === 'SEARCH_STOCKS') {
      searchStocks(request.query)
        .then((results) => sendResponse({ success: true, data: results }))
        .catch((error) => sendResponse({ success: false, error: error.message }));
      return true;
    }

    return false;
  }
);

/**
 * Yahoo Finance APIから株価データを取得
 */
async function fetchStockData(
  symbol: string,
  range: ChartRange = '1mo',
  interval: ChartInterval = '1d'
): Promise<StockData> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('銘柄が見つかりません（日本株は.T付き: 7203.T）');
    }
    throw new Error(`APIエラー: ${response.status}`);
  }

  const data = await response.json();

  if (data.chart.error) {
    throw new Error(data.chart.error.description || '銘柄が見つかりません');
  }

  const result = data.chart.result[0];
  const meta = result.meta;
  const quote = result.indicators.quote[0];

  return {
    quote: {
      symbol: meta.symbol,
      shortName: meta.shortName || meta.symbol,
      longName: meta.longName || meta.shortName || meta.symbol,
      currency: meta.currency,
      regularMarketPrice: meta.regularMarketPrice,
      previousClose: meta.previousClose || meta.chartPreviousClose,
      regularMarketChange: meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose),
      regularMarketChangePercent:
        ((meta.regularMarketPrice - (meta.previousClose || meta.chartPreviousClose)) /
          (meta.previousClose || meta.chartPreviousClose)) *
        100,
      regularMarketTime: meta.regularMarketTime,
    },
    chart: {
      timestamp: result.timestamp || [],
      open: quote.open || [],
      high: quote.high || [],
      low: quote.low || [],
      close: quote.close || [],
      volume: quote.volume || [],
    },
  };
}

/**
 * Google News RSSからニュースを取得
 */
async function fetchNews(symbol: string): Promise<NewsItem[]> {
  const isJapanese = symbol.endsWith('.T');
  const query = isJapanese
    ? `${symbol.replace('.T', '')} 株`
    : `${symbol} stock`;

  const lang = isJapanese ? 'ja' : 'en';
  const region = isJapanese ? 'JP' : 'US';
  const ceid = isJapanese ? 'JP:ja' : 'US:en';

  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=${lang}&gl=${region}&ceid=${ceid}`;

  console.log('[News] Fetching:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`[News] 取得失敗: ${response.status}`);
      return [];
    }

    const text = await response.text();
    console.log('[News] Response length:', text.length);

    // 正規表現でRSSパース（Service WorkerではDOMParser使用不可）
    const news = parseRssWithRegex(text);
    console.log('[News] Parsed items:', news.length);

    return news.slice(0, 5);
  } catch (error) {
    console.error('[News] エラー:', error);
    return [];
  }
}

/**
 * 正規表現でRSSをパース
 */
function parseRssWithRegex(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1];

    const title = extractTag(itemContent, 'title');
    const link = extractTag(itemContent, 'link');
    const pubDate = extractTag(itemContent, 'pubDate');
    const source = extractTag(itemContent, 'source');

    if (title && link) {
      items.push({
        title: decodeHtmlEntities(title),
        link,
        pubDate,
        description: source,
      });
    }
  }

  return items;
}

function extractTag(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = content.match(regex);
  return match ? (match[1] || match[2] || '').trim() : '';
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

/**
 * 銘柄検索
 */
async function searchStocks(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 1) {
    return [];
  }

  const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.warn(`[Search] 検索失敗: ${response.status}`);
      return [];
    }

    const data = await response.json();
    const quotes = data.quotes || [];

    return quotes
      .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
      .map((q: any) => ({
        symbol: q.symbol,
        shortName: q.shortname || q.symbol,
        longName: q.longname || q.shortname || q.symbol,
        exchange: q.exchange || '',
        type: q.quoteType || '',
      }));
  } catch (error) {
    console.error('[Search] エラー:', error);
    return [];
  }
}

console.log('Mini Stock Portfolio Service Worker 起動');
