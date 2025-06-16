import pytest
from fastapi.testclient import TestClient
from typing import Generator
from app.main import app

@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """FastAPIのテストクライアントを提供するフィクスチャ"""
    with TestClient(app) as test_client:
        yield test_client 
