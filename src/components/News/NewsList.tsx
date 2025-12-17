import type { NewsItem } from '../../types/stock';

interface NewsListProps {
  news: NewsItem[];
  loading?: boolean;
  error?: string | null;
  symbol: string | null;
}

/**
 * ニュースリストコンポーネント
 */
export const NewsList: React.FC<NewsListProps> = ({
  news,
  loading,
  error,
  symbol,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return '1時間以内';
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
  };

  if (!symbol) {
    return (
      <div className="news-list empty">
        <p>銘柄を選択するとニュースが表示されます</p>
      </div>
    );
  }

  return (
    <div className="news-list">
      <div className="news-header">
        <h3>ニュース</h3>
        <span className="news-symbol">{symbol}</span>
      </div>

      {/* ローディング */}
      {loading && (
        <div className="news-loading">
          <div className="spinner" />
          <span>ニュースを取得中...</span>
        </div>
      )}

      {/* エラー */}
      {error && <div className="news-error">{error}</div>}

      {/* ニュースアイテム */}
      {!loading && news.length > 0 && (
        <ul className="news-items">
          {news.map((item, index) => (
            <li key={`${item.link}-${index}`} className="news-item">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="news-link"
              >
                <span className="news-title">{item.title}</span>
                <span className="news-meta">
                  <span className="news-date">{formatDate(item.pubDate)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* ニュースなし */}
      {!loading && !error && news.length === 0 && (
        <div className="news-empty">
          <p>ニュースが見つかりませんでした</p>
        </div>
      )}
    </div>
  );
};
