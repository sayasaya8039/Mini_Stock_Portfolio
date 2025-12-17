import { useState, useMemo, useEffect } from 'react';
import { PortfolioList } from '../components/Portfolio/PortfolioList';
import { StockChart } from '../components/Chart/StockChart';
import { NewsList } from '../components/News/NewsList';
import { useStorage } from '../hooks/useStorage';
import { useMultiStockData, useStockData } from '../hooks/useStockData';
import { useNews } from '../hooks/useNews';
import type { ChartRange, ChartInterval } from '../types/stock';
import './App.css';

/**
 * メインアプリケーション
 */
export const App: React.FC = () => {
  const { holdings, loading: storageLoading, addHolding, removeHolding, settings } = useStorage();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState<ChartRange>(settings.defaultChartRange);

  // 全銘柄のシンボルリスト
  const symbols = useMemo(() => holdings.map((h) => h.symbol), [holdings]);

  // 複数銘柄データ取得（一覧用）
  const {
    dataMap,
    loading: multiLoading,
    errors,
    refetch: refetchAll,
  } = useMultiStockData(symbols);

  // 選択銘柄のチャートデータ
  const chartInterval: ChartInterval = chartRange === '1d' ? '5m' : chartRange === '5d' ? '15m' : '1d';
  const {
    data: selectedStockData,
    loading: chartLoading,
    error: chartError,
  } = useStockData(selectedSymbol, {
    range: chartRange,
    interval: chartInterval,
    autoRefresh: true,
    refreshInterval: settings.refreshInterval,
  });

  // ニュース取得
  const {
    news,
    loading: newsLoading,
    error: newsError,
  } = useNews(selectedSymbol);

  // 定期更新
  useEffect(() => {
    const interval = setInterval(() => {
      refetchAll();
    }, settings.refreshInterval);

    return () => clearInterval(interval);
  }, [settings.refreshInterval, refetchAll]);

  // 銘柄追加ハンドラ
  const handleAddStock = async (stock: { symbol: string; shares: number; averageCost: number }) => {
    // 重複チェック
    if (holdings.some((h) => h.symbol === stock.symbol)) {
      alert(`${stock.symbol} は既に登録されています`);
      return;
    }
    await addHolding(stock);
  };

  // 銘柄削除ハンドラ
  const handleRemoveStock = async (symbol: string) => {
    if (confirm(`${symbol} を削除しますか？`)) {
      await removeHolding(symbol);
      if (selectedSymbol === symbol) {
        setSelectedSymbol(null);
      }
    }
  };

  if (storageLoading) {
    return (
      <div className="app loading">
        <div className="spinner" />
        <span>読込中...</span>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>ポートフォリオ</h1>
      </header>

      <main className="app-main">
        {/* 左: ポートフォリオ一覧 */}
        <section className="section-portfolio">
          <PortfolioList
            holdings={holdings}
            dataMap={dataMap}
            errors={errors}
            loading={multiLoading}
            onAdd={handleAddStock}
            onRemove={handleRemoveStock}
            selectedSymbol={selectedSymbol}
            onSelect={setSelectedSymbol}
          />
        </section>

        {/* 右: 詳細表示 (チャート + ニュース) */}
        <section className="section-detail">
          <StockChart
            stockData={selectedStockData}
            loading={chartLoading}
            error={chartError}
            range={chartRange}
            onRangeChange={setChartRange}
          />

          <NewsList
            news={news}
            loading={newsLoading}
            error={newsError}
            symbol={selectedSymbol}
          />
        </section>
      </main>
    </div>
  );
};
