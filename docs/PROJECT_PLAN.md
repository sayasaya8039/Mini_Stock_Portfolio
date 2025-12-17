# Mini Stock Portfolio - プロジェクト計画書

**作成日:** 2025年12月17日
**ステータス:** 完了（v1.0.0）

---

## 📋 プロジェクト概要

Chrome拡張機能「ミニ株価ポートフォリオ」
- 保有株入力 → リアルタイム変動グラフ + ニュースまとめ表示
- 日本株・米国株両対応
- ポップアップUIのみ（400x500px）

---

## 🏗️ アーキテクチャ

```
ポップアップ(React)
    ↓ chrome.runtime.sendMessage
Background Service Worker
    ↓ fetch (CORS回避)
Yahoo Finance API / Google News RSS
```

---

## 📁 フォルダ構造

```
D:/extensions/Mini_Stock_Portfolio/
├── src/
│   ├── popup/
│   │   ├── App.tsx          # メインアプリケーション
│   │   ├── App.css          # スタイル（パステル水色系+ダークモード）
│   │   ├── main.tsx         # エントリーポイント
│   │   └── index.html
│   ├── background/
│   │   └── service-worker.ts  # API通信（CORS回避）
│   ├── components/
│   │   ├── Portfolio/
│   │   │   ├── PortfolioList.tsx  # ポートフォリオ一覧
│   │   │   ├── StockCard.tsx      # 個別銘柄カード
│   │   │   └── AddStockForm.tsx   # 銘柄追加フォーム（検索機能付き）
│   │   ├── Chart/
│   │   │   └── StockChart.tsx     # 株価チャート（Recharts）
│   │   └── News/
│   │       └── NewsList.tsx       # ニュース一覧
│   ├── hooks/
│   │   ├── useStorage.ts      # chrome.storage管理
│   │   ├── useStockData.ts    # 株価データ取得
│   │   └── useNews.ts         # ニュース取得
│   └── types/
│       └── stock.ts           # 型定義
├── public/
│   └── icons/                 # 拡張機能アイコン（Python生成）
├── scripts/
│   └── generate_icons.py      # アイコン生成スクリプト
├── articles/
│   └── note_article.md        # note投稿用記事
├── docs/
│   └── PROJECT_PLAN.md        # このファイル
├── manifest.json
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## ✅ 実装済み機能

### コア機能
- [x] プロジェクト初期化（package.json, vite.config.ts, tsconfig.json）
- [x] 型定義（src/types/stock.ts）
- [x] manifest.json（Manifest V3）
- [x] Background Service Worker（Yahoo Finance API）
- [x] Storage Hook（chrome.storage.local）

### UI コンポーネント
- [x] 銘柄追加フォーム（検索機能付き）
- [x] ポートフォリオ一覧（スクロール対応）
- [x] 個別銘柄カード（銘柄名表示）
- [x] 株価チャート（Recharts、1日〜1年）
- [x] ニュース表示（Google News RSS）

### デザイン
- [x] パステル水色系カラースキーム
- [x] ダークモード自動対応
- [x] レスポンシブレイアウト
- [x] アイコン生成（Python/Pillow）

### その他
- [x] README.md
- [x] GitHubリポジトリ作成・プッシュ
- [x] note投稿用記事作成

---

## 🔧 技術スタック

| カテゴリ | 技術 |
|---------|------|
| フロントエンド | React 18 + TypeScript |
| ビルドツール | Vite + @crxjs/vite-plugin |
| チャート | Recharts |
| 株価API | Yahoo Finance（非公式） |
| ニュースAPI | Google News RSS |
| 拡張機能 | Chrome Extension Manifest V3 |
| アイコン生成 | Python + Pillow |

---

## 🌐 API エンドポイント

### 株価取得
```
https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval={interval}&range={range}
```

### 銘柄検索
```
https://query1.finance.yahoo.com/v1/finance/search?q={query}&quotesCount=10
```

### ニュース取得（Google News RSS）
```
https://news.google.com/rss/search?q={query}&hl={lang}&gl={region}&ceid={ceid}
```

---

## 📝 銘柄コード形式

| 市場 | 形式 | 例 |
|------|------|-----|
| 米国株 | そのまま | AAPL, MSFT, GOOGL |
| 日本株 | 証券コード.T | 7203.T, 9432.T, 6758.T |

---

## 🔄 更新頻度

- ポップアップ表示中: 30秒間隔で自動更新
- 設定で変更可能

---

## 📦 ビルド・デプロイ

### 開発
```bash
npm install
npm run dev
```

### ビルド
```bash
npm run build
```

### アイコン再生成
```bash
pip install Pillow
python scripts/generate_icons.py
```

### Chromeインストール
1. `chrome://extensions` を開く
2. 「デベロッパーモード」をON
3. 「パッケージ化されていない拡張機能を読み込む」
4. `Mini_Stock_Portfolio` フォルダを選択

---

## 🔗 リンク

- **GitHub:** https://github.com/sayasaya8039/Mini_Stock_Portfolio
- **Chrome Web Store:** （準備中）

---

## 📅 開発履歴

| 日付 | 内容 |
|------|------|
| 2025-12-17 | 初期実装完了 |
| 2025-12-17 | 銘柄名表示追加 |
| 2025-12-17 | 銘柄検索機能追加 |
| 2025-12-17 | レイアウト修正（はみ出し対策） |
| 2025-12-17 | スクロールバー追加 |
| 2025-12-17 | GitHubプッシュ |
| 2025-12-17 | README.md作成 |
| 2025-12-17 | note記事作成 |

---

## 🚀 今後の拡張案（未実装）

- [ ] Chrome Web Store公開
- [ ] 為替レート表示
- [ ] アラート機能（目標価格通知）
- [ ] ウィジェット表示（常時表示）
- [ ] 複数ポートフォリオ対応
- [ ] エクスポート機能（CSV/PDF）
- [ ] 配当金トラッキング

---

## ⚠️ 注意事項

- Yahoo Finance APIは非公式のため、将来停止リスクあり
- 日本株は `.T` サフィックス必要（例: 7203.T）
- ニュースは Google News RSS を使用（日本株は検索精度に限界あり）

---

## 📄 ライセンス

MIT License
