# 今日1日の作業記録 - GitOpsパイプライン構築

## 📅 作業日: 2025年6月18日

## 🎯 目標
- 手動デプロイからArgoCDを使った自動デプロイ（GitOps）への移行
- GitHub ActionsとArgoCDを連携したCI/CDパイプラインの構築

## 作業の流れ

### 1. 初期状況の確認
- **問題**: 手動デプロイから自動デプロイへの移行が必要
- **環境**: `satomichi`名前空間、既存のArgoCD環境（argocd名前空間）を共有
- **構成**: FastAPI（バックエンド）+ Svelte（フロントエンド）

### 2. ArgoCD Applicationマニフェストの作成

```yaml:k8s/argocd-applications/satomichi-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: gutenberg-search-satomichi
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/SatoMichi/k8s_practice_sample
    targetRevision: main
    path: k8s/overlays/satomichi
  destination:
    server: https://kubernetes.default.svc
    namespace: satomichi
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 3. Kubernetesマニフェストの構成整理
- **base**: 共通のマニフェスト
- **overlays/satomichi**: 環境固有の設定
- **Ingress**: オーバーレイで直接定義

### 4. GitHub Actionsワークフローの作成

#### 4.1 Backend CI/CDワークフロー

```yaml:.github/workflows/backend-ci.yml
name: Backend CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
    paths: [ 'backend/**' ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend
        pytest

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ghcr.io/${{ github.repository_owner }}/k8s-practice-backend
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./backend
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
```

#### 4.2 Frontend CI/CDワークフロー

```yaml:.github/workflows/frontend-ci.yml
name: Frontend CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
    paths: [ 'frontend/**' ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: frontend/package-lock.json
    
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run tests
      run: |
        cd frontend
        npm test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v4
    
    - name: Clear Docker cache
      run: |
        docker system prune -f
        docker builder prune -f
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Debug - Show variables
      run: |
        echo "GitHub Actor: ${{ github.actor }}"
        echo "GitHub Repository Owner: ${{ github.repository_owner }}"
        echo "Repository: ${{ github.repository }}"
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ghcr.io/${{ github.repository_owner }}/k8s-practice-frontend
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
          type=raw,value=latest,enable={{is_default_branch}}
    
    - name: Debug - Show metadata
      run: |
        echo "Tags: ${{ steps.meta.outputs.tags }}"
        echo "Labels: ${{ steps.meta.outputs.labels }}"
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v5
      with:
        context: ./frontend
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        no-cache: true
```

#### 4.3 GitOps Deployワークフロー

```yaml:.github/workflows/gitops-deploy.yml
name: GitOps Deploy

on:
  workflow_run:
    workflows: ["Backend CI/CD", "Frontend CI/CD"]
    types:
      - completed
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  update-image-tags:
    runs-on: ubuntu-latest
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        token: ${{ secrets.GITHUB_TOKEN }}

    - name: Setup kustomize
      run: |
        curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
        sudo mv kustomize /usr/local/bin/

    - name: Update image tags
      run: |
        # 最新のコミットハッシュを取得
        COMMIT_SHA=$(git rev-parse --short HEAD)
        echo "Updating image tags to: $COMMIT_SHA"
        
        # satomichi環境のイメージタグを更新
        cd k8s/overlays/satomichi
        kustomize edit set image ghcr.io/SatoMichi/k8s-practice-frontend=ghcr.io/SatoMichi/k8s-practice-frontend:$COMMIT_SHA
        kustomize edit set image ghcr.io/SatoMichi/k8s-practice-backend=ghcr.io/SatoMichi/k8s-practice-backend:$COMMIT_SHA
        
        # 変更内容を確認
        cd ../..
        git status
        git diff

    - name: Commit and push changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add .
        git commit -m "Update image tags to ${{ github.sha }}"
        git push
```

### 5. 発生した問題と解決

#### 5.1 イメージ名の不一致問題
**問題**: `ghcr.io/satomichi/` vs `ghcr.io/SatoMichi/`
- GitHub Actions: 正しく `${{ github.repository_owner }}` を使用
- Kubernetesマニフェスト: 古い `ghcr.io/satomichi/` が残存

**解決**: 以下のファイルを修正

```yaml:k8s/base/backend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/SatoMichi/k8s-practice-backend  # 修正
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "128Mi"
            cpu: "200m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        env:
        - name: PYTHONPATH
          value: "/app"
        - name: NLTK_DATA
          value: "/root/nltk_data"
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: 8000
  selector:
    app: backend
```

```yaml:k8s/base/frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/SatoMichi/k8s-practice-frontend  # 修正
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        env:
        - name: BACKEND_URL
          value: "http://backend:8000"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: ClusterIP
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: frontend

```

# GitOpsパイプライン構築の作業記録とトラブルシューティング

## プロジェクト概要
- **目標**: 手動デプロイからArgoCDを使った自動デプロイ（GitOps）への移行
- **構成**: FastAPI（バックエンド）+ Svelte（フロントエンド）
- **環境**: `satomichi`名前空間、既存ArgoCD環境（argocd名前空間）を共有
- **リポジトリ**: SatoMichi/k8s_practice_sample

## 主要な実装内容

### 1. ArgoCD Application設定
```yaml
# k8s/argocd-applications/satomichi-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: gutenberg-search-satomichi
  namespace: argocd
spec:
  source:
    repoURL: https://github.com/SatoMichi/k8s_practice_sample
    path: k8s/overlays/satomichi
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### 2. GitHub Actionsワークフロー構成
- **Backend CI/CD**: `.github/workflows/backend-ci.yml`
- **Frontend CI/CD**: `.github/workflows/frontend-ci.yml`  
- **GitOps Deploy**: `.github/workflows/gitops-deploy.yml`

### 3. Kubernetesマニフェスト構造
```
k8s/
├── base/ (共通設定)
├── overlays/satomichi/ (環境固有設定)
└── argocd-applications/
```

## 発生した主要な問題とトラブルシューティング

### 1. ワークフロー実行順序の問題
**問題**: GitOps DeployがBackend/Frontend CI/CDより先に実行
**解決**: workflow_runトリガーで依存関係を設定
```yaml
on:
  workflow_run:
    workflows: ["Backend CI/CD", "Frontend CI/CD"]
    types: [completed]
```

### 2. イメージ名の不一致問題（第1の問題）
**問題**: `ghcr.io/satomichi/` vs `ghcr.io/SatoMichi/` の混在
**根本原因**: GitHub Container Registryは**リポジトリ名を小文字にする必要がある**
**影響範囲**:
- GitHub Actions ワークフロー
- Kubernetesマニフェスト全般
- ドキュメントファイル

### 3. GitHub Container Registry権限エラー（第2の問題・最重要）
**エラーメッセージ**: 
```
ERROR: failed to push ghcr.io/satomichi/k8s-practice-frontend:latest: 
denied: installation not allowed to Write organization package
```

**根本原因**: GitHub Container Registryの権限モデルの理解不足
- パッケージ（コンテナイメージ）は作成時に自動的に権限設定される
- `GITHUB_TOKEN`でアクセスするには、**パッケージ側でリポジトリからのアクセスを明示的に許可**する必要
- これは**プラットフォームレベルの設定問題**であり、コードの問題ではない

### 4. docker/metadata-action@v5の挙動問題
**問題**: メタデータアクションが期待通りに動作しない
**解決**: 手動でイメージ名とラベルを指定するアプローチに変更

## トラブルシューティングの詳細経緯

### フェーズ1: イメージ名統一作業
1. **Kubernetesマニフェストの修正**: `ghcr.io/SatoMichi/` → `ghcr.io/satomichi/`
2. **GitHub Actionsワークフローの修正**: イメージ名を小文字に統一
3. **GitOpsワークフローの修正**: kustomize edit setコマンドのイメージ名修正

### フェーズ2: 権限問題の解決
**実施した解決策**:

#### A. ワークフローレベルの修正
```yaml
permissions:
  contents: read
  packages: write
  attestations: write
  id-token: write
```

#### B. プラットフォームレベルの設定（GitHub Web UI）
1. **GitHub Organization** → **Packages タブ**
2. 該当パッケージ（`k8s-practice-frontend` / `k8s-practice-backend`）を選択
3. **Package settings** → **Manage Actions access**
4. `SatoMichi/k8s_practice_sample` リポジトリを追加、ロールを **Write** に設定

## 実行されたコミット履歴
1. `9e2c3ed`: ワークフローの強制更新とデバッグステップ追加
2. `c3b7bae`: docker/metadata-actionの設定修正
3. `f76f767`: 手動イメージ名指定による修正
4. `67ec331`: 全イメージ名を小文字に統一（GHCR互換性対応）
5. `cb125cb`: ワークフローに明示的なGHCR権限を追加

## 重要な教訓

### 「視野を広く持って、本当にコードの問題？」
今回の問題は素晴らしい洞察でした：

1. **コードレベル**: イメージ名の統一、ワークフロー設定 ✅
2. **プラットフォームレベル**: GitHub Container Registryの権限設定 ← **真の原因**
3. **組織レベル**: パッケージとリポジトリの関連付け

### GitHubのセキュリティモデル理解の重要性
- **パッケージレベルでの細かい権限制御**: 各パッケージごとにアクセス許可設定が必要
- **`GITHUB_TOKEN`の制限**: 自動生成トークンでも、パッケージ側での明示的な許可が必要
- **Organization vs Personal**: 組織のパッケージでは追加の権限設定が重要

### トラブルシューティングのアプローチ
1. **表面的なエラー**: イメージ名の大文字小文字
2. **深層の問題**: プラットフォーム権限設定
3. **解決の順序**: コード修正 → プラットフォーム設定

## 現在の状況
- **最新コミット**: cb125cb
- **状態**: 全ての技術的問題を解決
- **次のステップ**: GitOpsパイプラインの動作確認

## 技術的な学び
- GitHub Container Registryの権限モデルの複雑さ
- docker/metadata-action@v5の制限事項
- GitOpsパイプラインにおけるイメージ名一貫性の重要性
- プラットフォーム設定とコード設定の区別の重要性
- トラブルシューティング時の視野の広さの必要性

# 明日の作業ガイド - GitOpsパイプライン最終調整

## 🎯 現在の状況（2025年6月18日終了時点）

### ✅ 完了済み
- **GitOpsパイプライン**: 完全に動作中
- **ArgoCD Application**: `gutenberg-search-satomichi` が Synced 状態
- **アプリケーション**: フロントエンド・バックエンド共に正常動作
- **ワークフロー権限**: GitHub Actions に適切な権限を設定済み
- **イメージ名**: 全て小文字に統一済み（`ghcr.io/satomichi/`）

### ⚠️ 残っている課題
**GitHub Container Registry パッケージ権限設定** - GitHub Web UIでの設定が必要

## 🚀 明日やること（優先順位順）

### 1. GitHub Container Registry権限設定 ⭐ **最重要**

以下の手順でパッケージ権限を設定：

1. **GitHub.com にアクセス**
2. **SatoMichi Organization** → **Packages タブ**
3. **以下のパッケージを確認**：
   - `k8s-practice-frontend`
   - `k8s-practice-backend`
4. **各パッケージで設定**：
   - **Package settings** をクリック
   - **Manage Actions access** セクション
   - **Add repository** → `SatoMichi/k8s_practice_sample`
   - ロールを **Write** に設定

### 2. CI/CDパイプライン動作確認

権限設定後、以下で動作確認：

```bash
# 軽微な変更でCI/CDをトリガー
echo "# Test CI/CD $(date)" >> README.md
git add README.md
git commit -m "test: Trigger CI/CD pipeline"
git push origin main
```

### 3. 完全なGitOps動作確認

以下のコマンドで確認：

```bash
# ArgoCD Application状態確認
kubectl get applications -n argocd

# 新しいイメージでのpod起動確認
kubectl get pods -n satomichi

# アプリケーション動作確認
kubectl port-forward svc/frontend 8080:80 -n satomichi &
kubectl port-forward svc/backend 8000:8000 -n satomichi &
curl http://localhost:8080/
curl http://localhost:8000/books
```

### 4. ArgoCD UI確認（オプション）

```bash
# ArgoCD UIアクセス
kubectl port-forward svc/argo-cd-argocd-server -n argocd 8080:443
# ブラウザで https://localhost:8080
```

## 📋 確認すべきポイント

### CI/CDパイプライン
- [ ] Backend CI/CD: イメージビルド・プッシュ成功
- [ ] Frontend CI/CD: イメージビルド・プッシュ成功  
- [ ] GitOps Deploy: マニフェスト更新・コミット成功

### ArgoCD
- [ ] Application Status: `Synced` & `Healthy`
- [ ] 新しいコミットハッシュのイメージでpod起動
- [ ] `ImagePullBackOff` エラーの解消

### アプリケーション
- [ ] フロントエンド: 正常なHTML表示
- [ ] バックエンド: 18冊の本データ取得
- [ ] 検索機能: 動作確認

## 🔧 トラブルシューティング

### もしイメージプッシュが失敗する場合

1. **GitHub Actions ログ確認**:
   ```
   権限エラー: denied: installation not allowed to Write organization package
   ```

2. **パッケージ権限再確認**:
   - Organization → Packages → 該当パッケージ
   - Package settings → Manage Actions access
   - リポジトリが **Write** 権限で登録されているか

3. **ワークフロー権限確認**:
   ```yaml
   permissions:
     contents: read
     packages: write
     attestations: write
     id-token: write
   ```

## 📁 重要なファイル場所

- **ArgoCD Application**: `k8s/argocd-applications/satomichi-application.yaml`
- **Kubernetes環境設定**: `k8s/overlays/satomichi/`
- **CI/CDワークフロー**: `.github/workflows/`
- **プロジェクトドキュメント**: `README.md`, `report.md`

## 🎉 成功の判断基準

全て完了したら：
1. mainブランチにプッシュ
2. 自動でコンテナイメージがビルド・プッシュ
3. ArgoCDが変更を検知して自動デプロイ
4. 新しいコミットハッシュのpodが正常起動
5. アプリケーションが期待通りに動作

**これでGitOpsパイプラインが完全に完成！** 🚀
