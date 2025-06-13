import pytest
from fastapi.testclient import TestClient

def test_search_endpoint(client: TestClient):
    """検索エンドポイントのテスト"""
    # 正常系のテスト
    response = client.get("/search?q=love")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all(isinstance(item, dict) for item in data)
    assert all("title" in item and "similarity" in item for item in data)

    # 空のクエリのテスト
    response = client.get("/search?q=")
    assert response.status_code == 422  # Validation Error

    # limitパラメータのテスト
    response = client.get("/search?q=love&limit=3")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 3

def test_books_endpoint(client: TestClient):
    """利用可能な本のリスト取得エンドポイントのテスト"""
    response = client.get("/books")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all(isinstance(item, str) for item in data)

def test_book_detail_endpoint(client: TestClient):
    """特定の本の詳細情報取得エンドポイントのテスト"""
    # 存在する本のテスト
    response = client.get("/books/austen-emma.txt")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "title" in data
    assert "content" in data

    # 存在しない本のテスト
    response = client.get("/books/non-existent-book.txt")
    assert response.status_code == 404 
