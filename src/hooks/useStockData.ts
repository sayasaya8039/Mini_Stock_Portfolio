import { useState, useEffect, useCallback } from 'react';
import type { StockData, ChartRange, ChartInterval, MessageResponse } from '../types/stock';

interface UseStockDataOptions {
  range?: ChartRange;
  interval?: ChartInterval;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * 株価データ取得Hook
 */
export function useStockData(
  symbol: string | null,
  options: UseStockDataOptions = {}
) {
  const {
    range = '1mo',
    interval = '1d',
    autoRefresh = true,
    refreshInterval = 30000,
  } = options;

  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setData(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'FETCH_STOCK_DATA',
        symbol,
        range,
        interval,
      }) as MessageResponse<StockData>;

      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error);
        setData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データ取得に失敗しました');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [symbol, range, interval]);

  // 初回取得 + 依存変更時の再取得
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 自動更新
  useEffect(() => {
    if (!autoRefresh || !symbol) return;

    const id = setInterval(fetchData, refreshInterval);
    return () => clearInterval(id);
  }, [autoRefresh, refreshInterval, symbol, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

/**
 * 複数銘柄の株価データを一括取得
 */
export function useMultiStockData(
  symbols: string[],
  options: Omit<UseStockDataOptions, 'autoRefresh' | 'refreshInterval'> = {}
) {
  const { range = '1mo', interval = '1d' } = options;

  const [dataMap, setDataMap] = useState<Map<string, StockData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const fetchAll = useCallback(async () => {
    if (symbols.length === 0) {
      setDataMap(new Map());
      return;
    }

    setLoading(true);

    const results = await Promise.allSettled(
      symbols.map(async (symbol) => {
        const response = await chrome.runtime.sendMessage({
          type: 'FETCH_STOCK_DATA',
          symbol,
          range,
          interval,
        }) as MessageResponse<StockData>;

        if (response.success) {
          return { symbol, data: response.data };
        } else {
          throw new Error(response.error);
        }
      })
    );

    const newDataMap = new Map<string, StockData>();
    const newErrors = new Map<string, string>();

    results.forEach((result, index) => {
      const symbol = symbols[index];
      if (result.status === 'fulfilled') {
        newDataMap.set(symbol, result.value.data);
      } else {
        newErrors.set(symbol, result.reason.message);
      }
    });

    setDataMap(newDataMap);
    setErrors(newErrors);
    setLoading(false);
  }, [symbols, range, interval]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    dataMap,
    loading,
    errors,
    refetch: fetchAll,
  };
}
