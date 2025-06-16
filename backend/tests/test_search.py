import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.search import SearchEngine

client = TestClient(app)

@pytest.fixture
def search_engine():
    return SearchEngine()

def test_search_endpoint():
    response = client.get("/search?q=test")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all(isinstance(item, dict) for item in data)
    assert all("book_id" in item and "title" in item and "similarity_score" in item for item in data)

def test_search_empty_query():
    response = client.get("/search?q=")
    assert response.status_code == 400
    assert "detail" in response.json()

def test_search_engine_initialization(search_engine):
    assert search_engine is not None
    assert hasattr(search_engine, "corpus")
    assert len(search_engine.corpus) > 0

def test_search_engine_search(search_engine):
    results = search_engine.search("test")
    assert isinstance(results, list)
    assert all(isinstance(item, dict) for item in results)
    assert all("text" in item for item in results)
    assert all("score" in item for item in results) 
