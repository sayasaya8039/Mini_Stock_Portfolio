import type { StockHolding, StockData } from '../../types/stock';

interface StockCardProps {
  holding: StockHolding;
  stockData: StockData | null;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * 個別銘柄カード
 */
export const StockCard: React.FC<StockCardProps> = ({
  holding,
  stockData,
  isSelected,
  onSelect,
  onRemove,
  loading,
  error,
}) => {
  const formatCurrency = (value: number, currency: string) => {
    if (currency === 'JPY') {
      return `¥${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
    }
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const quote = stockData?.quote;
  const isPositive = quote ? quote.regularMarketChangePercent >= 0 : null;

  // 損益計算
  const profitLoss = quote && holding.shares > 0 && holding.averageCost > 0
    ? (quote.regularMarketPrice - holding.averageCost) * holding.shares
    : null;

  const profitLossPercent = holding.averageCost > 0 && quote
    ? ((quote.regularMarketPrice - holding.averageCost) / holding.averageCost) * 100
    : null;

  return (
    <div
      className={`stock-card ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="stock-card-header">
        <div className="stock-info-header">
          <div className="stock-symbol">{holding.symbol}</div>
          {quote?.shortName && (
            <div className="stock-name" title={quote.longName}>
              {quote.shortName}
            </div>
          )}
        </div>
        <button
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title="削除"
        >
          ×
        </button>
      </div>

      {loading && <div className="stock-loading">読込中...</div>}

      {error && <div className="stock-error">{error}</div>}

      {quote && !loading && (
        <>
          <div className="stock-price">
            {formatCurrency(quote.regularMarketPrice, quote.currency)}
          </div>
          <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
            {formatCurrency(quote.regularMarketChange, quote.currency)}
            ({formatPercent(quote.regularMarketChangePercent)})
          </div>

          {holding.shares > 0 && (
            <div className="stock-holdings">
              <span className="shares">{holding.shares}株</span>
              {profitLoss !== null && (
                <span className={`profit-loss ${profitLoss >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(profitLoss, quote.currency)}
                  {profitLossPercent !== null && ` (${formatPercent(profitLossPercent)})`}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
