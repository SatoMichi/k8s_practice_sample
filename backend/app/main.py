from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from .corpus import GutenbergCorpus

app = FastAPI(
    title="Gutenberg Search API",
    description="Project Gutenbergの本を検索するAPI",
    version="1.0.0"
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に制限する
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# コーパスの初期化
corpus = GutenbergCorpus()

class SearchResponse(BaseModel):
    book_id: str
    title: str
    similarity_score: float
    word_count: int

@app.get("/")
async def root():
    """APIのルートエンドポイント"""
    return {
        "message": "Gutenberg Search API",
        "version": "1.0.0",
        "endpoints": {
            "/search": "本を検索する",
            "/books": "利用可能な本のリストを取得",
            "/books/{book_id}": "特定の本の情報を取得"
        }
    }

@app.get("/search", response_model=List[SearchResponse])
async def search_books(q: str, limit: Optional[int] = 5):
    """
    本を検索する
    
    Args:
        q: 検索クエリ
        limit: 返す結果の数（デフォルト: 5）
    
    Returns:
        検索結果のリスト
    """
    if not q:
        raise HTTPException(status_code=400, detail="検索クエリが必要です")
    
    results = corpus.search(q, top_k=limit)
    return results

@app.get("/books")
async def list_books():
    """利用可能な本のリストを取得"""
    return {
        "books": [
            {
                "book_id": book_id,
                "title": info["title"],
                "word_count": info["words"]
            }
            for book_id, info in corpus.books.items()
        ]
    }

@app.get("/books/{book_id}")
async def get_book(book_id: str):
    """特定の本の情報を取得"""
    book_info = corpus.get_book_info(book_id)
    if not book_info:
        raise HTTPException(status_code=404, detail="本が見つかりません")
    return book_info 
