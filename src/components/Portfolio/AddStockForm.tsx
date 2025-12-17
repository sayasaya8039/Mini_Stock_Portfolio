import { useState, useEffect, useRef, type FormEvent } from 'react';
import type { SearchResult, MessageResponse } from '../../types/stock';

interface AddStockFormProps {
  onAdd: (stock: { symbol: string; shares: number; averageCost: number }) => void;
}

/**
 * 銘柄追加フォーム（検索機能付き）
 */
export const AddStockForm: React.FC<AddStockFormProps> = ({ onAdd }) => {
  const [query, setQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [shares, setShares] = useState('');
  const [averageCost, setAverageCost] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 検索実行
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SEARCH_STOCKS',
        query: searchQuery,
      }) as MessageResponse<SearchResult[]>;

      if (response.success) {
        setSearchResults(response.data);
        setShowResults(true);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('検索エラー:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // デバウンス検索
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query && !selectedSymbol) {
      debounceRef.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, selectedSymbol]);

  // クリック外で検索結果を閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 検索結果から選択
  const handleSelectResult = (result: SearchResult) => {
    setSelectedSymbol(result.symbol);
    setSelectedName(result.shortName);
    setQuery(result.symbol);
    setShowResults(false);
    setSearchResults([]);
  };

  // 選択クリア
  const handleClearSelection = () => {
    setSelectedSymbol('');
    setSelectedName('');
    setQuery('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const symbol = selectedSymbol || query.trim().toUpperCase();
    if (!symbol) return;

    onAdd({
      symbol,
      shares: parseFloat(shares) || 0,
      averageCost: parseFloat(averageCost) || 0,
    });

    // リセット
    setQuery('');
    setSelectedSymbol('');
    setSelectedName('');
    setShares('');
    setAverageCost('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="add-stock-button"
      >
        + 銘柄を追加
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="add-stock-form">
      {/* 検索入力 */}
      <div className="form-row search-row" ref={searchRef}>
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="銘柄名または銘柄コードで検索..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selectedSymbol) {
                handleClearSelection();
              }
            }}
            onFocus={() => {
              if (searchResults.length > 0) {
                setShowResults(true);
              }
            }}
            autoFocus
            autoComplete="off"
          />
          {isSearching && <span className="search-spinner" />}
          {selectedSymbol && (
            <button
              type="button"
              className="clear-btn"
              onClick={handleClearSelection}
            >
              ×
            </button>
          )}
        </div>

        {/* 選択済み表示 */}
        {selectedSymbol && (
          <div className="selected-stock">
            <span className="selected-symbol">{selectedSymbol}</span>
            <span className="selected-name">{selectedName}</span>
          </div>
        )}

        {/* 検索結果ドロップダウン */}
        {showResults && searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((result) => (
              <li
                key={result.symbol}
                onClick={() => handleSelectResult(result)}
                className="search-result-item"
              >
                <span className="result-symbol">{result.symbol}</span>
                <span className="result-name">{result.shortName}</span>
                <span className="result-exchange">{result.exchange}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 株数・取得単価 */}
      <div className="form-row form-row-split">
        <input
          type="number"
          placeholder="株数"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          min="0"
          step="1"
        />
        <input
          type="number"
          placeholder="取得単価"
          value={averageCost}
          onChange={(e) => setAverageCost(e.target.value)}
          min="0"
          step="0.01"
        />
      </div>

      {/* ボタン */}
      <div className="form-actions">
        <button
          type="submit"
          className="btn-primary"
          disabled={!selectedSymbol && !query.trim()}
        >
          追加
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="btn-secondary"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
};
