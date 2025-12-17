import { useState, useEffect, useCallback } from 'react';
import type { StockHolding, StorageSchema } from '../types/stock';

const STORAGE_KEY = 'miniStockPortfolio';

const defaultSettings: StorageSchema['settings'] = {
  refreshInterval: 30000,
  defaultChartRange: '1mo',
  theme: 'system',
};

/**
 * chrome.storage.localを使用したカスタムHook
 */
export function useStorage() {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [settings, setSettings] = useState<StorageSchema['settings']>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // 初期読み込み
  useEffect(() => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const data = result[STORAGE_KEY] as Partial<StorageSchema> || {};
      setHoldings(data.holdings || []);
      setSettings({ ...defaultSettings, ...data.settings });
      setLoading(false);
    });

    // ストレージ変更のリスナー
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes[STORAGE_KEY]) {
        const newValue = changes[STORAGE_KEY].newValue as Partial<StorageSchema> || {};
        setHoldings(newValue.holdings || []);
        setSettings({ ...defaultSettings, ...newValue.settings });
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  // 保存処理
  const save = useCallback(async (data: Partial<StorageSchema>) => {
    const current = await chrome.storage.local.get([STORAGE_KEY]);
    const currentData = current[STORAGE_KEY] as Partial<StorageSchema> || {};
    await chrome.storage.local.set({
      [STORAGE_KEY]: { ...currentData, ...data },
    });
  }, []);

  // 銘柄追加
  const addHolding = useCallback(
    async (holding: Omit<StockHolding, 'addedAt'>) => {
      const newHolding: StockHolding = {
        ...holding,
        addedAt: Date.now(),
      };
      const updated = [...holdings, newHolding];
      setHoldings(updated);
      await save({ holdings: updated });
    },
    [holdings, save]
  );

  // 銘柄削除
  const removeHolding = useCallback(
    async (symbol: string) => {
      const updated = holdings.filter((h) => h.symbol !== symbol);
      setHoldings(updated);
      await save({ holdings: updated });
    },
    [holdings, save]
  );

  // 銘柄更新
  const updateHolding = useCallback(
    async (symbol: string, updates: Partial<Omit<StockHolding, 'symbol' | 'addedAt'>>) => {
      const updated = holdings.map((h) =>
        h.symbol === symbol ? { ...h, ...updates } : h
      );
      setHoldings(updated);
      await save({ holdings: updated });
    },
    [holdings, save]
  );

  // 設定更新
  const updateSettings = useCallback(
    async (updates: Partial<StorageSchema['settings']>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      await save({ settings: newSettings });
    },
    [settings, save]
  );

  return {
    holdings,
    settings,
    loading,
    addHolding,
    removeHolding,
    updateHolding,
    updateSettings,
  };
}
