# Mini Stock Portfolio

Chrome拡張機能：日本株・米国株のリアルタイム株価ポートフォリオ管理

## 機能

- **リアルタイム株価表示** - 30秒間隔で自動更新
- **日本株・米国株対応** - 東証（7203.T）、NYSE/NASDAQ（AAPL）
- **インタラクティブチャート** - 1日〜1年の期間切り替え
- **銘柄検索** - 企業名または銘柄コードで検索
- **損益計算** - 保有株数と取得単価から自動計算
- **ニュース表示** - Google Newsから関連ニュースを取得
- **ダークモード対応** - システム設定に自動追従

## スクリーンショット

![Portfolio View](docs/screenshot.png)

## インストール

### Chrome Web Store（準備中）

### 開発版インストール

1. リポジトリをクローン
   ```bash
   git clone https://github.com/sayasaya8039/Mini_Stock_Portfolio.git
   cd Mini_Stock_Portfolio
   ```

2. 依存関係をインストール
   ```bash
   npm install
   ```

3. ビルド
   ```bash
   npm run build
   ```

4. Chromeにインストール
   - `chrome://extensions` を開く
   - 「デベロッパーモード」をON
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - `Mini_Stock_Portfolio` フォルダを選択

## 使い方

### 銘柄の追加

1. 「+ 銘柄を追加」をクリック
2. 企業名または銘柄コードを入力して検索
3. 検索結果から銘柄を選択
4. 株数・取得単価を入力（任意）
5. 「追加」をクリック

### 銘柄コードの形式

| 市場 | 形式 | 例 |
|------|------|-----|
| 米国株 | そのまま | `AAPL`, `MSFT`, `GOOGL` |
| 日本株 | 証券コード.T | `7203.T`, `9432.T`, `6758.T` |

### チャート期間

- 1日 / 5日 / 1ヶ月 / 3ヶ月 / 6ヶ月 / 1年

## 技術スタック

- **フロントエンド**: React 18 + TypeScript
- **ビルドツール**: Vite + @crxjs/vite-plugin
- **チャート**: Recharts
- **API**: Yahoo Finance（非公式）
- **ニュース**: Google News RSS
- **拡張機能**: Chrome Extension Manifest V3

## プロジェクト構造

```
Mini_Stock_Portfolio/
├── src/
│   ├── popup/
│   │   ├── App.tsx          # メインアプリケーション
│   │   ├── App.css          # スタイル
│   │   ├── main.tsx         # エントリーポイント
│   │   └── index.html
│   ├── background/
│   │   └── service-worker.ts  # API通信（CORS回避）
│   ├── components/
│   │   ├── Portfolio/
│   │   │   ├── PortfolioList.tsx
│   │   │   ├── StockCard.tsx
│   │   │   └── AddStockForm.tsx
│   │   ├── Chart/
│   │   │   └── StockChart.tsx
│   │   └── News/
│   │       └── NewsList.tsx
│   ├── hooks/
│   │   ├── useStorage.ts      # chrome.storage管理
│   │   ├── useStockData.ts    # 株価データ取得
│   │   └── useNews.ts         # ニュース取得
│   └── types/
│       └── stock.ts           # 型定義
├── public/
│   └── icons/                 # 拡張機能アイコン
├── scripts/
│   └── generate_icons.py      # アイコン生成スクリプト
├── manifest.json
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## 開発

### 開発サーバー起動

```bash
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

## API について

このプロジェクトは以下の非公式APIを使用しています：

- **Yahoo Finance API** - 株価データ取得
- **Google News RSS** - ニュース取得

これらは非公式APIのため、将来的に変更・停止される可能性があります。

## ライセンス

MIT License

## 作者

- GitHub: [@sayasaya8039](https://github.com/sayasaya8039)

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
