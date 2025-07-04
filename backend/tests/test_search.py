import pytest
from fastapi.testclient import TestClient
from typing import Generator, List, Dict, Any
from app.main import app
from app.search import SearchEngine


client = TestClient(app)


@pytest.fixture
def search_engine() -> Generator[SearchEngine, None, None]:
    engine = SearchEngine()
    yield engine


def test_search_endpoint() -> None:
    response = client.get("/search?q=test")
    assert response.status_code == 200
    data: List[Dict[str, Any]] = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert all(isinstance(item, dict) for item in data)
    assert all(
        ("book_id" in item
         and "title" in item
         and "similarity_score" in item
         and "author" in item
         and "word_count" in item)
        for item in data
    )


def test_search_empty_query() -> None:
    response = client.get("/search?q=")
    assert response.status_code == 400
    assert "detail" in response.json()


def test_search_engine_initialization(search_engine: SearchEngine) -> None:
    assert search_engine is not None
    assert hasattr(search_engine, "corpus")
    assert len(search_engine.corpus) > 0


def test_search_engine_search(search_engine: SearchEngine) -> None:
    results: List[Dict[str, Any]] = search_engine.search("test")
    assert isinstance(results, list)
    assert all(isinstance(item, dict) for item in results)
    assert all("text" in item for item in results)
    assert all("score" in item for item in results)


def test_search_results(search_engine: SearchEngine) -> None:
    """SearchEngineの検索結果の形式をテスト"""
    results = search_engine.search("love")
    assert len(results) > 0

    def is_valid_result(result: Dict[str, Any]) -> bool:
        return (
            "text" in result
            and "score" in result
            and isinstance(result["text"], str)
            and isinstance(result["score"], float)
        )

    assert all(is_valid_result(result) for result in results)
