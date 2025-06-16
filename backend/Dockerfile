# ビルドステージ
FROM python:3.12-slim as builder

WORKDIR /app

# 必要なパッケージをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 依存関係のインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# NLTKデータのダウンロード
RUN python -c "import nltk; nltk.download('gutenberg')"

# 本番環境用ステージ
FROM python:3.12-slim

WORKDIR /app

# 必要なパッケージのみをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# ビルドステージから必要なファイルをコピー
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin
COPY --from=builder /root/nltk_data /root/nltk_data
COPY ./app ./app

# 環境変数の設定
ENV PYTHONPATH=/app
ENV NLTK_DATA=/root/nltk_data
ENV PATH="/usr/local/bin:${PATH}"

# ヘルスチェック用のエンドポイント
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# アプリケーションの起動
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 
