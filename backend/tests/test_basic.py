"""
Basic tests for ThreatLens AI backend.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "ThreatLens AI" in response.json()["name"]


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_login():
    response = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "admin123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_get_assets():
    # First login to get token
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "admin123"},
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/assets/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_vulnerabilities():
    # First login to get token
    login_response = client.post(
        "/api/auth/login",
        data={"username": "admin", "password": "admin123"},
    )
    token = login_response.json()["access_token"]

    response = client.get(
        "/api/vulnerabilities/",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)
