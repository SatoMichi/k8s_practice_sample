# ビルドステージ
FROM node:20-slim as builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピーとビルド
COPY . .
RUN npm run build

# 本番環境用ステージ
FROM nginx:alpine

# nginxの設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ビルドステージからビルド成果物をコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# ヘルスチェック用のエンドポイント
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# ポートの公開
EXPOSE 80

# nginxの起動
CMD ["nginx", "-g", "daemon off;"] 
