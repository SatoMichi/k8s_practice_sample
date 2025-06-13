# プロジェクト構成・方針まとめ（詳細版）

---
## 準備段階

### 1. 要件概要

- **2つ以上のアプリケーションが連携するHTTPサーバを作成**
  - 例：  
    - サービスA（フロントエンド） → クラスタ外（外部）からアクセス可能  
    - サービスB（バックエンドAPI） → サービスAから呼び出される
- **GitHub Actionsによる自動テスト・静的解析**
- **コンテナイメージのビルドとghcr.ioへのプッシュをCIで自動化**
- **Argo CDでKubernetesクラスタにデプロイ、kubectl applyは使わない**
- **Deployment更新によりPodの自動再起動を実現**

---

### 2. 技術スタックの選定

#### バックエンド

- **FastAPI（Python）**
  - 軽量で高速なAPIサーバフレームワーク
  - OpenAPI自動生成や非同期対応が強み
  - CORS設定を入れてフロントエンドからのアクセスを許可（`fastapi.middleware.cors`）

#### フロントエンド

- **Svelte**
  - シンプルで軽量なコンパイル型フロントエンドフレームワーク
  - Node.js環境でビルドし、静的ファイルを配信
  - `fetch()`を用いてFastAPIのAPIを呼び出す
  - 軽量かつパフォーマンス良好

#### 理由

- フロントとバックエンドが異なる言語・技術であるのは実務でも多い
- フロントはUI・ユーザー体験に特化し、バックエンドはAPIロジックに集中できる
- コンテナイメージを分けて管理・デプロイしやすい

---

### 3. アプリケーション例：検索システム

- **バックエンド（FastAPI）**
  - NLTKのコーパスから文章を読み込み  
  - クエリに応じてキーワード検索や簡易的な類似検索を実施  
  - `/search?q=キーワード` のGET APIを提供

- **フロントエンド（Svelte）**
  - 検索フォーム  
  - API呼び出しによる検索結果のリスト表示

---

### 4. 開発・デプロイ環境

#### GitHubリポジトリ

- フロントエンド・バックエンドを別ディレクトリで管理
- パブリックリポジトリで運用
- **セットアップ**  
  - SSH鍵生成・GitHubアカウント登録  
  - `gh auth login`でCLI認証  
- **GitHub Actions**  
  - Pythonコードに対して `pytest` や `flake8`, `mypy` などでテスト・静的解析  
  - JavaScriptコードに対して `eslint` や `vitest` などで静的解析・テスト  
  - バックエンド・フロントエンドそれぞれのDockerイメージビルドと`ghcr.io`プッシュを自動化

#### コンテナイメージ

- バックエンド  
  - Python公式イメージをベースにFastAPI環境構築  
- フロントエンド  
  - Node.jsでビルド後、nginxなどで静的ファイルを配信するイメージを作成

#### Kubernetes & Argo CD

- 2つのDeploymentマニフェスト（フロント・バックエンド）を用意
- マニフェストのイメージタグをGitHub Actionsで自動更新する仕組みを導入（例：[kustomize](https://kustomize.io/)や`sed`などのスクリプト利用）
- Argo CDがGitリポジトリの状態を監視し、自動同期・デプロイを行う  
- `kubectl apply`を直接叩かずにArgo CDで管理

#### ローカル開発環境（任意）

- Docker Composeでバックエンド・フロントエンドのコンテナを同時起動
- ポート番号やCORS設定を調整して連携しやすくする

---

### 5. 通信・運用上のポイント

- **CORS設定**  
  バックエンドFastAPIで `CORSMiddleware` を設定し、フロントエンドからAPIが呼べるようにする

- **API通信**  
  フロントエンドSvelteは`fetch()`などを利用してFastAPIのREST APIを呼び出す

- **デプロイ時のPod再起動**  
  Deploymentの`image`タグ更新によりKubernetesがローリングアップデートを行い、Podが順次再起動される

---

### 6. 今後の作業例

- FastAPIで検索APIの実装（NLTK連携含む）  
- Svelteで検索フォーム・結果表示のUI作成  
- Dockerfileの作成（バックエンド・フロントエンドそれぞれ）  
- GitHub Actionsワークフローの構築（CI/CD）  
- Argo CD用マニフェストの準備・イメージ更新フローの自動化  

---

## 実装段階

### 7. 実装の進捗状況

#### バックエンド（FastAPI）の実装

##### 完了した機能
1. **基本構造の構築**
   - FastAPIアプリケーションのセットアップ
   - CORSミドルウェアの設定
   - エンドポイントの定義

2. **Gutenbergコーパス処理**
   - NLTKを使用したコーパスの読み込み
   - TF-IDFベクトル化による検索機能の実装
   - コサイン類似度に基づく検索結果のランキング

3. **APIエンドポイント**
   - `/search`: 本の検索（クエリパラメータ: `q`）
   - `/books`: 利用可能な本のリスト取得
   - `/books/{book_id}`: 特定の本の詳細情報取得

##### 利用可能な本の一覧
現在、以下のような作品が利用可能です：
- Jane Austen: Emma, Persuasion, Sense and Sensibility
- Shakespeare: Julius Caesar, Hamlet, Macbeth
- その他: King James Bible, Alice in Wonderland, Moby Dick, Paradise Lost など

##### 次のステップ
1. **フロントエンド（Svelte）の実装**
   - 検索フォームの作成
   - 検索結果の表示UI
   - 本の詳細表示ページ

2. **コンテナ化**
   - バックエンド用Dockerfileの作成
   - フロントエンド用Dockerfileの作成
   - Docker Composeによる開発環境の構築

3. **CI/CDパイプライン**
   - GitHub Actionsワークフローの設定
   - テスト自動化
   - コンテナイメージの自動ビルドとプッシュ

4. **Kubernetesデプロイ**
   - Deploymentマニフェストの作成
   - Argo CDの設定
   - 自動デプロイの実装
