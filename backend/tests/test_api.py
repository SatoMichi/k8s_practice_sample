from fastapi.testclient import TestClient
from typing import List, Dict, Any


def test_search_endpoint(client: TestClient) -> None:
    """検索エンドポイントのテスト"""
    # 正常系のテスト
    response = client.get("/search?q=love")
    assert response.status_code == 200
    data: List[Dict[str, Any]] = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all(isinstance(item, dict) for item in data)
    assert all(
        "title" in item and 
        "similarity_score" in item and 
        "author" in item
        for item in data
    )

    # 空のクエリのテスト
    response = client.get("/search?q=")
    assert response.status_code == 400  # バリデーションエラー

    # limitパラメータのテスト
    response = client.get("/search?q=love&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 3


def test_books_endpoint(client: TestClient) -> None:
    """利用可能な本のリスト取得エンドポイントのテスト"""
    response = client.get("/books")
    assert response.status_code == 200
    data: Dict[str, List[Dict[str, Any]]] = response.json()
    assert isinstance(data, dict)
    assert "books" in data
    assert isinstance(data["books"], list)
    assert len(data["books"]) > 0
    assert all(
        "book_id" in book and "title" in book and "word_count" in book
        for book in data["books"]
    )


def test_book_detail_endpoint(client: TestClient) -> None:
    """特定の本の詳細情報取得エンドポイントのテスト"""
    # 存在する本のテスト
    response = client.get("/books/austen-emma.txt")
    assert response.status_code == 200
    data: Dict[str, Any] = response.json()
    assert isinstance(data, dict)
    assert "title" in data
    assert "text" in data
    assert "words" in data

    # 存在しない本のテスト
    response = client.get("/books/non-existent-book.txt")
    assert response.status_code == 404
