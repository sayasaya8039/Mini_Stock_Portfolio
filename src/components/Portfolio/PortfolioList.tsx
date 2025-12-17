import { useMemo } from 'react';
import type { StockHolding, StockData } from '../../types/stock';
import { StockCard } from './StockCard';
import { AddStockForm } from './AddStockForm';

interface PortfolioListProps {
  holdings: StockHolding[];
  dataMap: Map<string, StockData>;
  errors: Map<string, string>;
  loading: boolean;
  onAdd: (stock: { symbol: string; shares: number; averageCost: number }) => void;
  onRemove: (symbol: string) => void;
  selectedSymbol: string | null;
  onSelect: (symbol: string | null) => void;
}

/**
 * ポートフォリオ一覧コンポーネント
 */
export const PortfolioList: React.FC<PortfolioListProps> = ({
  holdings,
  dataMap,
  errors,
  loading,
  onAdd,
  onRemove,
  selectedSymbol,
  onSelect,
}) => {
  // サマリー計算
  const summary = useMemo(() => {
    let totalValue = 0;
    let totalCost = 0;
    let jpyValue = 0;
    let usdValue = 0;

    holdings.forEach((holding) => {
      const stockData = dataMap.get(holding.symbol);
      if (stockData?.quote && holding.shares > 0) {
        const value = stockData.quote.regularMarketPrice * holding.shares;
        const cost = holding.averageCost * holding.shares;

        if (stockData.quote.currency === 'JPY') {
          jpyValue += value;
        } else {
          usdValue += value;
        }

        totalValue += value;
        totalCost += cost;
      }
    });

    const totalProfitLoss = totalCost > 0 ? totalValue - totalCost : 0;
    const totalProfitLossPercent = totalCost > 0
      ? ((totalValue - totalCost) / totalCost) * 100
      : 0;

    return {
      totalValue,
      totalCost,
      totalProfitLoss,
      totalProfitLossPercent,
      jpyValue,
      usdValue,
    };
  }, [holdings, dataMap]);

  const formatCurrency = (value: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="portfolio-list">
      {/* サマリー */}
      {holdings.length > 0 && (
        <div className="portfolio-summary">
          <div className="summary-row">
            <span className="summary-label">保有資産</span>
            <div className="summary-values">
              {summary.jpyValue > 0 && (
                <span className="summary-value">{formatCurrency(summary.jpyValue, 'JPY')}</span>
              )}
              {summary.usdValue > 0 && (
                <span className="summary-value">{formatCurrency(summary.usdValue, 'USD')}</span>
              )}
            </div>
          </div>
          {summary.totalCost > 0 && (
            <div className="summary-row">
              <span className="summary-label">損益</span>
              <span className={`summary-profit-loss ${summary.totalProfitLoss >= 0 ? 'positive' : 'negative'}`}>
                {summary.totalProfitLoss >= 0 ? '+' : ''}
                {summary.totalProfitLossPercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}

      {/* 銘柄リスト */}
      <div className="stock-list">
        {holdings.map((holding) => (
          <StockCard
            key={holding.symbol}
            holding={holding}
            stockData={dataMap.get(holding.symbol) || null}
            isSelected={selectedSymbol === holding.symbol}
            onSelect={() => onSelect(
              selectedSymbol === holding.symbol ? null : holding.symbol
            )}
            onRemove={() => onRemove(holding.symbol)}
            loading={loading}
            error={errors.get(holding.symbol)}
          />
        ))}
      </div>

      {/* 空の状態 */}
      {holdings.length === 0 && (
        <div className="empty-state">
          <p>銘柄が登録されていません</p>
          <p className="hint">「+ 銘柄を追加」から追加してください</p>
        </div>
      )}

      {/* 追加フォーム */}
      <AddStockForm onAdd={onAdd} />
    </div>
  );
};
