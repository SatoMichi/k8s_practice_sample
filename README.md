# Gutenberg Book Search Engine

## 目次
1. [プロジェクト概要](#1-プロジェクト概要)
2. [クイックスタート](#2-クイックスタート)
3. [システム構成](#3-システム構成)
4. [開発環境](#4-開発環境)
5. [Docker環境](#5-docker環境)
6. [Kubernetes環境](#6-kubernetes環境)
7. [検索アルゴリズム](#7-検索アルゴリズム)
8. [テスト](#8-テスト)
9. [CI/CD](#9-cicd)
10. [今後の改善計画](#10-今後の改善計画)

## 1. プロジェクト概要

### 目的
- Gutenbergコーパスを使用した本の検索エンジンの実装
- フルスタック開発の実践（FastAPI + Svelte）
- コンテナ化とKubernetesデプロイの学習
- CI/CDパイプラインの構築

### 主な機能
- 本の全文検索
- TF-IDFとコサイン類似度による検索結果のランキング
- モダンなUI/UX
- RESTful API
- Kubernetes環境でのスケーラブルなデプロイ

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

### Kubernetes環境での実行
```bash
# 名前空間の確認
kubectl get namespaces

# アプリケーションのデプロイ（satomichi名前空間を使用）
kubectl apply -k k8s/base/ -n satomichi

# ポートフォワーディング
kubectl port-forward svc/gutenberg-frontend 8080:80 -n satomichi
kubectl port-forward svc/gutenberg-backend 8000:8000 -n satomichi
```

アクセス方法：
- フロントエンド: http://localhost:8080
- バックエンドAPI: http://localhost:8000

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
├── backend/          # FastAPIバックエンド
│   ├── app/         # アプリケーションコード
│   ├── tests/       # テストコード
│   └── Dockerfile   # コンテナ設定
├── frontend/         # Svelteフロントエンド
│   ├── src/         # ソースコード
│   ├── public/      # 静的ファイル
│   └── Dockerfile   # コンテナ設定
├── k8s/             # Kubernetes設定
│   ├── base/        # 基本マニフェスト
│   └── overlays/    # 環境別設定
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
  - mypy（型チェック）

- **フロントエンド**
  - Svelte
  - Vite
  - Tailwind CSS
  - fetch API

- **インフラ**
  - Docker
  - Docker Compose
  - Kubernetes
  - GitHub Actions（CI/CD）

## 4. 開発環境

### 必要条件
- Python 3.8以上
- Node.js 18以上
- npm 9以上
- Docker（オプション）
- Docker Compose（オプション）
- kubectl（Kubernetes環境の場合）

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
pytest tests/ -v

# 型チェック
mypy app/ tests/
```

### フロントエンド開発
```bash
cd frontend
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# リンター
npm run lint
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
```bash
# アプリケーションの起動
docker-compose up --build

# ログの確認
docker-compose logs -f

# 停止
docker-compose down
```

## 6. Kubernetes環境

### デプロイ方法
```bash
# 現在のクラスター情報確認
kubectl cluster-info

# 名前空間の確認
kubectl get namespaces

# アプリケーションのデプロイ
kubectl apply -k k8s/base/ -n satomichi

# デプロイ状況の確認
kubectl get all -n satomichi
```

### アクセス方法
```bash
# ポートフォワーディング
kubectl port-forward svc/gutenberg-frontend 8080:80 -n satomichi
kubectl port-forward svc/gutenberg-backend 8000:8000 -n satomichi

# アプリケーションの動作確認
curl http://localhost:8000/
curl http://localhost:8080/
```

### ログとデバッグ
```bash
# ポッドのログ確認
kubectl logs -f deployment/gutenberg-frontend -n satomichi
kubectl logs -f deployment/gutenberg-backend -n satomichi

# ポッドの詳細確認
kubectl describe pod <pod-name> -n satomichi
```

## 7. 検索アルゴリズム

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

#### 利用可能な本
現在19冊の本が利用可能：
- Austen（Emma, Persuasion, Sense and Sensibility）
- Bible（King James Version）
- Blake（Poems）
- Bryant（Stories）
- Burgess（Buster Brown）
- Carroll（Alice in Wonderland）
- Chesterton（Ball, Brown, Thursday）
- Edgeworth（Parents）
- Melville（Moby Dick）
- Milton（Paradise Lost）
- Shakespeare（Caesar, Hamlet, Macbeth）
- Whitman（Leaves of Grass）

## 8. テスト

### バックエンドテスト
```bash
cd backend
# テストの実行
pytest tests/ -v

# カバレッジ確認
pytest --cov=app tests/
```

### フロントエンドテスト
```bash
cd frontend
# ビルドテスト
npm run build
```

## 9. CI/CD

### GitHub Actions
- **バックエンドCI**: `.github/workflows/backend-ci.yml`
  - テスト実行
  - 型チェック
  - Dockerイメージのビルドとプッシュ

- **フロントエンドCI**: `.github/workflows/frontend-ci.yml`
  - ビルドテスト
  - Dockerイメージのビルドとプッシュ

### コンテナイメージ
- **バックエンド**: `ghcr.io/satomichi/k8s-practice-backend`
- **フロントエンド**: `ghcr.io/satomichi/k8s-practice-frontend`

## 10. 今後の改善計画

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

### インフラの改善
- [ ] Ingress Controllerの設定
- [ ] SSL/TLS証明書の設定
- [ ] モニタリングの追加
- [ ] ログ集約の実装
- [ ] 自動スケーリングの設定

### テストの拡充
- [ ] フロントエンドのユニットテスト
- [ ] E2Eテストの実装
- [ ] パフォーマンステストの追加
- [ ] セキュリティテストの追加

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストやイシューの報告を歓迎します。貢献する前に、まずイシューを開いて変更内容について議論してください。
