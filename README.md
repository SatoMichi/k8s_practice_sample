# Gutenberg Book Search Engine

## 1. プロジェクト概要

### 目的
- Gutenbergコーパスを使用した本の検索エンジンの実装
- フルスタック開発の実践（FastAPI + Svelte）
- コンテナ化とKubernetesデプロイの学習

### 主な機能
- 本の全文検索
- TF-IDFとコサイン類似度による検索結果のランキング
- モダンなUI/UX
- RESTful API

## 2. システム構成

### アーキテクチャ
```
k8s_practice_sample/
├── backend/      # FastAPIバックエンド
├── frontend/     # Svelteフロントエンド
├── README.md
└── .gitignore
```

### 技術スタック
- **バックエンド**
  - FastAPI
  - NLTK（Gutenbergコーパス）
  - scikit-learn（TF-IDF）
  - Uvicorn

- **フロントエンド**
  - Svelte
  - Vite
  - Tailwind CSS
  - fetch API

## 3. 開発環境のセットアップ

### 必要条件
- Python 3.8以上
- Node.js 18以上
- npm 9以上

### バックエンドのセットアップ
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### フロントエンドのセットアップ
```bash
cd frontend
npm install
npm run dev
```

### 動作確認
- バックエンド: http://localhost:8000
- フロントエンド: http://localhost:5173
- API仕様: http://localhost:8000/docs

## 4. 検索アルゴリズムの説明

### TF-IDFとコサイン類似度による検索

#### 基本概念
1. **TF-IDF（Term Frequency-Inverse Document Frequency）**
   - **TF（Term Frequency）**: 文書内での単語の出現頻度
     - 単語の出現回数 ÷ 文書の総単語数
     - 例：文書A（100語）で"love"が5回出現 → TF = 5/100 = 0.05
   
   - **IDF（Inverse Document Frequency）**: 単語の希少性
     - log(全文書数 ÷ その単語を含む文書数)
     - 例：全文書10冊中3冊に"love"が出現 → IDF = log(10/3) ≈ 1.2
     - 多くの文書に出現する単語（"the", "a"など）は重要度が低い

2. **文書のベクトル表現**
   - 各文書を単語空間におけるベクトルとして表現
   - 各次元は単語を表し、値はその単語のTF-IDF値
   - 例：
     ```
     単語空間: ["love", "book", "read", "adventure"]
     文書A: [0.3, 0.1, 0.2, 0.0]  # "love"のTF-IDF=0.3, "book"のTF-IDF=0.1, ...
     文書B: [0.15, 0.1, 0.0, 0.4] # "love"のTF-IDF=0.15, "book"のTF-IDF=0.1, ...
     ```

#### 検索プロセス
1. **データの前処理**
   - NLTKのGutenbergコーパスから本を読み込み
   - 各本のテキストを単語のリストに分割
   - ストップワード（"the", "a", "an"など）を除去

2. **TF-IDFベクトルの生成**
   - 全本のテキストをTF-IDFベクトルに変換
   - 各本は単語空間におけるベクトルとして表現
   - ベクトルの各要素は対応する単語のTF-IDF値

3. **検索処理**
   - 検索クエリを同じベクトル空間に変換
   - クエリベクトルと各本のベクトル間のコサイン類似度を計算
   - 類似度の高い順に結果をランキング

#### 実装の特徴
1. **利点**
   - 単純な単語の出現回数だけでなく、文書全体における単語の重要度を考慮
   - ストップワードを自動的に除外
   - 大文字小文字を区別しない
   - 数学的に文書間の類似性を計算可能

2. **制限事項**
   - 文脈や単語の順序は考慮しない
   - 同義語や類義語の関係を考慮しない
   - 語幹化（ステミング）を行わない

## 5. フロントエンドの実装

### 主要コンポーネント

1. **Search.svelte**
   - 検索フォームの実装
   - 検索クエリの入力と送信
   - エラーハンドリング
   - ローディング状態の管理

2. **BookList.svelte**
   - 検索結果の表示
   - 本のタイトルと類似度スコアの表示
   - レスポンシブデザイン
   - ページネーション（実装予定）

3. **APIクライアント（api.js）**
   - バックエンドAPIとの通信
   - エラーハンドリング
   - レスポンスの型定義

### 開発環境
- 開発サーバー: `npm run dev`（http://localhost:5173）
- ホットリロード対応
- 環境変数による設定管理

## 6. 今後の改善計画

### 1. 検索機能の改善
- [ ] ステミング（語幹化）の追加
- [ ] 同義語・類義語の考慮
- [ ] 文脈の考慮
- [ ] 重み付けの調整
- [ ] 検索履歴の保存

### 2. UI/UXの改善
- [ ] 検索結果の詳細表示
- [ ] フィルタリング機能
- [ ] ソート機能
- [ ] ダークモード対応
- [ ] アクセシビリティの向上

### 3. テストの実装
- [ ] バックエンド
  - [ ] ユニットテスト（pytest）
  - [ ] 統合テスト
  - [ ] パフォーマンステスト
- [ ] フロントエンド
  - [ ] コンポーネントテスト（Vitest）
  - [ ] E2Eテスト（Playwright）
  - [ ] アクセシビリティテスト

### 4. インフラストラクチャ
- [ ] Dockerfileの作成
  - [ ] バックエンド用
  - [ ] フロントエンド用
- [ ] Docker Composeの設定
- [ ] Kubernetesマニフェストの作成
  - [ ] Deployment
  - [ ] Service
  - [ ] Ingress
  - [ ] ConfigMap/Secret

### 5. CI/CDパイプライン
- [ ] GitHub Actionsの設定
  - [ ] テスト自動化
  - [ ] ビルド自動化
  - [ ] デプロイ自動化
- [ ] Argo CDの設定
  - [ ] アプリケーション定義
  - [ ] 自動デプロイの設定
  - [ ] ロールバック戦略

### 6. パフォーマンス最適化
- [ ] バックエンド
  - [ ] キャッシュの実装
  - [ ] インデックスの最適化
  - [ ] 並列処理の実装
- [ ] フロントエンド
  - [ ] コンポーネントの遅延ロード
  - [ ] バンドルサイズの最適化
  - [ ] キャッシュ戦略の実装
