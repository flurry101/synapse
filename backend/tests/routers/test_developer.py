import pytest
from httpx import AsyncClient

from app.config.config import settings

from ..utils import (
    create_test_developer,
    create_test_owner,
    generate_user_auth_headers,
)


@pytest.mark.anyio
async def test_developer_endpoints_and_deployments(client: AsyncClient) -> None:
    dev = await create_test_developer()
    headers = await generate_user_auth_headers(client, dev)

    # 1. List developer models (seeded on startup)
    r = await client.get(
        f"{settings.API_V1_STR}/developer/models", headers=headers
    )
    assert r.status_code == 200
    models = r.json()
    assert isinstance(models, list)
    assert len(models) > 0

    first_model_id = models[0]["slug"]

    # 2. Get model detail
    r = await client.get(
        f"{settings.API_V1_STR}/developer/models/{first_model_id}",
        headers=headers,
    )
    assert r.status_code == 200
    detail = r.json()
    assert detail["slug"] == first_model_id
    assert "owner" in detail
    assert "pricing" in detail

    # 3. Compare models
    r = await client.post(
        f"{settings.API_V1_STR}/developer/compare",
        json={"model_ids": [models[0]["slug"]]},
        headers=headers,
    )
    assert r.status_code == 200
    comp_res = r.json()
    assert "models" in comp_res
    assert len(comp_res["models"]) >= 1

    # 4. Playground prompt run
    r = await client.post(
        f"{settings.API_V1_STR}/developer/playground",
        json={
            "model_id": first_model_id,
            "prompt": "Hello AI model, please summarize this ticket.",
            "temperature": 0.5,
            "max_tokens": 128,
        },
        headers=headers,
    )
    assert r.status_code == 200
    play_res = r.json()
    assert "output_text" in play_res
    assert play_res["latency_ms"] > 0
    assert play_res["total_tokens"] > 0

    # 5. Create deployment
    deploy_data = {
        "model_id": first_model_id,
        "environment": "production",
        "region": "us-east-1",
        "max_tokens": 1024,
        "temperature": 0.3,
        "rate_limit_rpm": 180,
    }
    r = await client.post(
        f"{settings.API_V1_STR}/developer/deployments",
        json=deploy_data,
        headers=headers,
    )
    assert r.status_code == 200
    deployment = r.json()
    assert deployment["model_id"] == first_model_id
    assert deployment["api_key"].startswith("syn_sec_")
    deployment_id = deployment["id"]

    # 6. List deployments
    r = await client.get(
        f"{settings.API_V1_STR}/developer/deployments", headers=headers
    )
    assert r.status_code == 200
    deploy_list = r.json()
    assert any(d["id"] == deployment_id for d in deploy_list)

    # 7. Recommendations
    r = await client.get(
        f"{settings.API_V1_STR}/developer/recommendations?limit=3",
        headers=headers,
    )
    assert r.status_code == 200
    recs = r.json()
    assert isinstance(recs, list)
    assert len(recs) > 0

    # 8. HF Hub search for developers
    r = await client.post(
        f"{settings.API_V1_STR}/developer/hf/search",
        json={"q": "mistral", "limit": 3},
        headers=headers,
    )
    assert r.status_code == 200
    hf_recs = r.json()
    assert len(hf_recs) > 0

    # 9. Delete deployment
    r = await client.delete(
        f"{settings.API_V1_STR}/developer/deployments/{deployment_id}",
        headers=headers,
    )
    assert r.status_code == 200


@pytest.mark.anyio
async def test_developer_role_guard(client: AsyncClient) -> None:
    # A user with only owner role should receive 403 Forbidden
    owner_user = await create_test_owner()
    headers = await generate_user_auth_headers(client, owner_user)

    r = await client.get(
        f"{settings.API_V1_STR}/developer/models", headers=headers
    )
    assert r.status_code == 403
    assert "Developer workspace access required" in r.json()["detail"]

