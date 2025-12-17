import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { StockData, ChartRange } from '../../types/stock';

interface StockChartProps {
  stockData: StockData | null;
  loading?: boolean;
  error?: string | null;
  range: ChartRange;
  onRangeChange: (range: ChartRange) => void;
}

const RANGE_OPTIONS: { value: ChartRange; label: string }[] = [
  { value: '1d', label: '1日' },
  { value: '5d', label: '5日' },
  { value: '1mo', label: '1ヶ月' },
  { value: '3mo', label: '3ヶ月' },
  { value: '6mo', label: '6ヶ月' },
  { value: '1y', label: '1年' },
];

/**
 * 株価チャートコンポーネント
 */
export const StockChart: React.FC<StockChartProps> = ({
  stockData,
  loading,
  error,
  range,
  onRangeChange,
}) => {
  // チャートデータ整形
  const chartData = useMemo(() => {
    if (!stockData?.chart || !stockData.chart.timestamp) return [];

    return stockData.chart.timestamp.map((ts, i) => ({
      timestamp: ts,
      date: new Date(ts * 1000).toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
      }),
      time: new Date(ts * 1000).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      close: stockData.chart.close[i],
      high: stockData.chart.high[i],
      low: stockData.chart.low[i],
      volume: stockData.chart.volume[i],
    }));
  }, [stockData]);

  // 前日比での色判定
  const isPositive = useMemo(() => {
    if (!stockData?.quote) return true;
    return stockData.quote.regularMarketChangePercent >= 0;
  }, [stockData]);

  const formatPrice = (value: number) => {
    if (!stockData?.quote) return value.toString();
    if (stockData.quote.currency === 'JPY') {
      return `¥${value.toLocaleString('ja-JP', { maximumFractionDigits: 0 })}`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatTooltipLabel = (label: string, payload: any[]) => {
    if (payload.length > 0) {
      const data = payload[0].payload;
      return range === '1d' ? `${data.date} ${data.time}` : data.date;
    }
    return label;
  };

  if (!stockData && !loading) {
    return (
      <div className="stock-chart empty">
        <p>銘柄を選択してください</p>
      </div>
    );
  }

  return (
    <div className="stock-chart">
      {/* ヘッダー */}
      {stockData?.quote && (
        <div className="chart-header">
          {/* 1行目: 銘柄名 */}
          <div className="chart-title-row">
            <span className="chart-symbol">{stockData.quote.symbol}</span>
            <span className="chart-name">{stockData.quote.shortName}</span>
          </div>

          {/* 2行目: 価格 */}
          <div className="chart-price-row">
            <span className="chart-price">{formatPrice(stockData.quote.regularMarketPrice)}</span>
            <span className={`chart-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? '+' : ''}
              {stockData.quote.regularMarketChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
      )}

      {/* 3行目: レンジ切り替え（常に表示） */}
      <div className="range-selector">
        {RANGE_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`range-btn ${range === option.value ? 'active' : ''}`}
            onClick={() => onRangeChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* ローディング */}
      {loading && (
        <div className="chart-loading">
          <div className="spinner" />
          <span>読込中...</span>
        </div>
      )}

      {/* エラー */}
      {error && <div className="chart-error">{error}</div>}

      {/* チャート本体 */}
      {chartData.length > 0 && !loading && (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey={range === '1d' ? 'time' : 'date'}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatPrice(value)}
                width={60}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.95)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelFormatter={formatTooltipLabel}
                formatter={(value: number) => [formatPrice(value), '価格']}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                fill={isPositive ? 'url(#colorPositive)' : 'url(#colorNegative)'}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};
