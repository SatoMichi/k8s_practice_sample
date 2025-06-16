# Gutenberg Book Search Engine

## 目次
1. [プロジェクト概要](#1-プロジェクト概要)
2. [クイックスタート](#2-クイックスタート)
3. [システム構成](#3-システム構成)
4. [開発環境](#4-開発環境)
5. [Docker環境](#5-docker環境)
6. [検索アルゴリズム](#6-検索アルゴリズム)
7. [テスト](#7-テスト)
8. [今後の改善計画](#8-今後の改善計画)

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

## 2. クイックスタート

### Docker環境での実行（推奨）
```bash
# macOSの場合、Colimaを起動
colima start

# アプリケーションのビルドと起動
docker-compose up --build
```

アクセス方法：
- フロントエンド: http://localhost:80
- バックエンドAPI: http://localhost:8000
- APIドキュメント: http://localhost:8000/docs

### ローカル環境での実行
```bash
# バックエンド
cd backend
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# フロントエンド
cd frontend
npm install
npm run dev
```

## 3. システム構成

### アーキテクチャ
```
k8s_practice_sample/
├── backend/      # FastAPIバックエンド
│   ├── app/     # アプリケーションコード
│   └── tests/   # テストコード
├── frontend/     # Svelteフロントエンド
├── docker-compose.yml
├── README.md
└── .gitignore
```

### 技術スタック
- **バックエンド**
  - FastAPI
  - NLTK（Gutenbergコーパス）
  - scikit-learn（TF-IDF）
  - Uvicorn
  - pytest（テスト）

- **フロントエンド**
  - Svelte
  - Vite
  - Tailwind CSS
  - fetch API
  - Vitest（テスト）

## 4. 開発環境

### 必要条件
- Python 3.8以上
- Node.js 18以上
- npm 9以上
- Docker（オプション）
- Docker Compose（オプション）
- Colima（macOS + Dockerの場合）

### バックエンド開発
```bash
cd backend
# 仮想環境のセットアップ
python -m venv venv
source venv/bin/activate  # Windows: .\venv\Scripts\activate

# 依存関係のインストール
pip install -r requirements.txt

# 開発サーバーの起動
uvicorn app.main:app --reload

# テストの実行
pytest tests/  # すべてのテスト
pytest tests/ -v  # 詳細な出力
pytest tests/ -k "test_search"  # 特定のテスト
```

### フロントエンド開発
```bash
cd frontend
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# テストの実行
npm test  # すべてのテスト
npm test -- -t "Search"  # 特定のテスト
```

## 5. Docker環境

### コンテナ構成

#### バックエンド（FastAPI）
- ベースイメージ: `python:3.12-slim`
- マルチステージビルドによる最適化
- 主な設定:
  - 依存関係のインストール
  - NLTKデータの事前ダウンロード
  - ヘルスチェックの実装
  - 環境変数の設定

#### フロントエンド（Nginx）
- ベースイメージ: `nginx:alpine`
- マルチステージビルドによる最適化
- 主な設定:
  - SPAのルーティング対応
  - バックエンドAPIへのプロキシ設定
  - 静的ファイルのキャッシュ設定

### 開発環境での利用
- ホットリロード対応
- ソースコードのマウント
- デバッグログの表示

### 本番環境での利用
- 最適化されたビルド
- セキュリティ設定
- パフォーマンスチューニング

## 6. 検索アルゴリズム

### TF-IDFとコサイン類似度による検索

#### 基本概念
1. **TF-IDF（Term Frequency-Inverse Document Frequency）**
   - **TF（Term Frequency）**: 文書内での単語の出現頻度
   - **IDF（Inverse Document Frequency）**: 単語の希少性

2. **文書のベクトル表現**
   - 各文書を単語空間におけるベクトルとして表現
   - 各次元は単語を表し、値はその単語のTF-IDF値

#### 検索プロセス
1. **データの前処理**
   - NLTKのGutenbergコーパスから本を読み込み
   - テキストの正規化とストップワード除去

2. **TF-IDFベクトルの生成**
   - 全本のテキストをTF-IDFベクトルに変換
   - ベクトル空間での文書表現

3. **検索処理**
   - クエリのベクトル化
   - コサイン類似度によるランキング

#### 実装の特徴
- 単語の重要度を考慮した検索
- ストップワードの自動除外
- 大文字小文字の正規化
- 数学的な類似性計算

## 7. テスト

### バックエンドテスト
1. **ユニットテスト**
   - `pytest`を使用
   - テストファイル: `backend/tests/`
   - 主要なテストケース:
     - 検索エンドポイント
     - 本の詳細情報取得
   - カバレッジ確認: `pytest --cov=app tests/`

2. **統合テスト**
   - FastAPIの`TestClient`を使用
   - エンドポイント間の連携テスト
   - データベース連携テスト

### フロントエンドテスト
1. **コンポーネントテスト**
   - `Vitest`を使用
   - テストファイル: `frontend/__tests__/`
   - 主要なテストケース:
     - 検索フォーム
     - 検索結果表示

2. **E2Eテスト**
   - Playwrightを使用（予定）
   - ユーザーフロー全体のテスト

## 8. 今後の改善計画

### 検索機能の改善
- [ ] ステミング（語幹化）の追加
- [ ] 同義語・類義語の考慮
- [ ] 文脈の考慮
- [ ] 重み付けの調整
- [ ] 検索履歴の保存

### UI/UXの改善
- [ ] 検索結果の詳細表示
- [ ] フィルタリング機能
- [ ] ソート機能
- [ ] ダークモード対応
- [ ] アクセシビリティの向上

### テストの拡充
- [ ] バックエンド
  - [ ] パフォーマンステストの追加
  - [ ] エッジケースのテスト追加
- [ ] フロントエンド
  - [ ] E2Eテストの実装
  - [ ] パフォーマンステストの追加
  - [ ] アクセシビリティテストの追加
