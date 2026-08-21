from unittest.mock import patch

import pytest
from httpx import AsyncClient

from app.config.config import settings


@pytest.mark.anyio
async def test_get_access_token(client: AsyncClient) -> None:
    login_data = {
        "username": settings.FIRST_SUPERUSER,
        "password": settings.FIRST_SUPERUSER_PASSWORD,
    }
    r = await client.post(f"{settings.API_V1_STR}/login/access-token", data=login_data)
    tokens = r.json()
    assert r.status_code == 200
    assert "access_token" in tokens
    assert tokens["access_token"]


@pytest.mark.anyio
async def test_use_access_token(
    client: AsyncClient, superuser_token_headers: dict[str, str]
) -> None:
    r = await client.get(
        f"{settings.API_V1_STR}/login/test-token",
        headers=superuser_token_headers,
    )
    result = r.json()
    assert r.status_code == 200
    assert "email" in result


@pytest.mark.anyio
async def test_not_authorized(client: AsyncClient) -> None:
    r = await client.get(f"{settings.API_V1_STR}/login/test-token")
    assert r.status_code == 401

    headers = {"AUTHORIZATION": "Bearer eyJ0eXAiOiJKV1QiLCJhbG"}
    r = await client.get(f"{settings.API_V1_STR}/login/test-token", headers=headers)
    assert r.status_code == 401


@pytest.mark.anyio
async def test_google_callback_missing_code(client: AsyncClient) -> None:
    with (
        patch("app.config.config.settings.GOOGLE_CLIENT_ID", "mock-client-id"),
        patch("app.config.config.settings.GOOGLE_CLIENT_SECRET", "mock-client-secret"),
        patch(
            "app.config.config.settings.SSO_CALLBACK_HOSTNAME", "http://localhost:8000"
        ),
        patch(
            "app.config.config.settings.SSO_LOGIN_CALLBACK_URL",
            "http://localhost:5173/api/v1/login/google/callback",
        ),
    ):
        r = await client.get(f"{settings.API_V1_STR}/login/google/callback")
        assert r.status_code == 400
        assert "Missing 'code' parameter" in r.json()["detail"]


@pytest.mark.anyio
async def test_google_sso_disabled(client: AsyncClient) -> None:
    with (
        patch("app.config.config.settings.GOOGLE_CLIENT_ID", None),
        patch("app.config.config.settings.GOOGLE_CLIENT_SECRET", None),
    ):
        r = await client.get(f"{settings.API_V1_STR}/login/google/callback")
        assert r.status_code == 400
        assert "Google SSO not enabled." in r.json()["detail"]
