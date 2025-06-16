import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """FastAPIのテストクライアントを提供するフィクスチャ"""
    with TestClient(app) as test_client:
        yield test_client 
