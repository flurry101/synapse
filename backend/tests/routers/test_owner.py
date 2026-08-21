import pytest
from httpx import AsyncClient

from app.config.config import settings

from ..utils import (
    create_test_developer,
    create_test_owner,
    generate_user_auth_headers,
)


@pytest.mark.anyio
async def test_owner_crud_and_benchmarks(client: AsyncClient) -> None:
    owner = await create_test_owner()
    headers = await generate_user_auth_headers(client, owner)

    # 1. Create a model
    model_data = {
        "name": "Custom Falcon Model",
        "hugging_face_id": "tiiuae/falcon-7b",
        "description": "Custom fine-tuned Falcon model for domain QA.",
        "task": "General Chat",
        "version": "1.0.0",
        "price_per_request": 0.001,
        "price_per_1k_tokens": 0.015,
        "price_per_m_input": 0.18,
        "price_per_m_output": 0.65,
        "status": "Published",
    }
    r = await client.post(
        f"{settings.API_V1_STR}/owner/models", json=model_data, headers=headers
    )
    assert r.status_code == 200
    created = r.json()
    assert created["name"] == "Custom Falcon Model"
    assert created["slug"] == "custom-falcon-model"
    model_slug = created["slug"]

    # 2. List owner models
    r = await client.get(
        f"{settings.API_V1_STR}/owner/models", headers=headers
    )
    assert r.status_code == 200
    models_list = r.json()
    assert any(m["slug"] == model_slug for m in models_list)

    # 3. Update model
    update_data = {
        "description": "Updated Falcon description.",
        "trust_score": 95.0,
    }
    r = await client.patch(
        f"{settings.API_V1_STR}/owner/models/{model_slug}",
        json=update_data,
        headers=headers,
    )
    assert r.status_code == 200
    updated = r.json()
    assert updated["description"] == "Updated Falcon description."
    assert updated["trust_score"] == 95.0

    # 4. Add benchmark
    bm_data = {
        "model_id": model_slug,
        "dataset": "FalconEval v1",
        "accuracy": 92.5,
        "latency_ms": 195,
        "f1_score": 91.0,
    }
    r = await client.post(
        f"{settings.API_V1_STR}/owner/benchmarks",
        json=bm_data,
        headers=headers,
    )
    assert r.status_code == 200
    bm_res = r.json()
    assert bm_res["dataset"] == "FalconEval v1"
    assert bm_res["accuracy"] == 92.5

    # 5. List benchmarks
    r = await client.get(
        f"{settings.API_V1_STR}/owner/benchmarks", headers=headers
    )
    assert r.status_code == 200
    benchmarks = r.json()
    assert any(b["dataset"] == "FalconEval v1" for b in benchmarks)

    # 6. Analytics
    r = await client.get(
        f"{settings.API_V1_STR}/owner/analytics", headers=headers
    )
    assert r.status_code == 200
    analytics = r.json()
    assert "total_revenue" in analytics
    assert "time_series" in analytics
    assert len(analytics["time_series"]) > 0

    # 7. HF Search
    r = await client.post(
        f"{settings.API_V1_STR}/owner/hf/search",
        json={"q": "llama", "limit": 5},
        headers=headers,
    )
    assert r.status_code == 200
    hf_models = r.json()
    assert isinstance(hf_models, list)
    assert len(hf_models) > 0

    # 8. HF Import
    r = await client.post(
        f"{settings.API_V1_STR}/owner/hf/import",
        json={"repo_id": "meta-llama/Llama-3.1-8B-Instruct"},
        headers=headers,
    )
    assert r.status_code == 200
    import_details = r.json()
    assert "name" in import_details
    assert (
        import_details["hugging_face_id"] == "meta-llama/Llama-3.1-8B-Instruct"
    )

    # 9. Delete model
    r = await client.delete(
        f"{settings.API_V1_STR}/owner/models/{model_slug}", headers=headers
    )
    assert r.status_code == 200


@pytest.mark.anyio
async def test_owner_role_guard(client: AsyncClient) -> None:
    # A user with only developer role should receive 403 Forbidden
    dev_user = await create_test_developer()
    headers = await generate_user_auth_headers(client, dev_user)

    r = await client.get(
        f"{settings.API_V1_STR}/owner/models", headers=headers
    )
    assert r.status_code == 403
    assert "Model Owner workspace access required" in r.json()["detail"]

