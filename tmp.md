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
