import { useState, useEffect, useCallback } from 'react';
import type { NewsItem, MessageResponse } from '../types/stock';

/**
 * ニュース取得Hook
 */
export function useNews(symbol: string | null) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    if (!symbol) {
      setNews([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'FETCH_NEWS',
        symbol,
      }) as MessageResponse<NewsItem[]>;

      if (response.success) {
        setNews(response.data);
        setError(null);
      } else {
        // エラーでも空配列として扱う（UIでは「ニュースなし」表示）
        setNews([]);
        setError(null);
      }
    } catch (err) {
      // フェッチエラーでも空配列として扱う
      setNews([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  return {
    news,
    loading,
    error,
    refetch: fetchNews,
  };
}
