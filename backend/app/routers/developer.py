import secrets
from datetime import datetime, timezone
from uuid import UUID

from beanie.operators import In
from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..auth.auth import get_current_active_user
from ..models import Benchmark, Deployment, Model, User
from ..schemas.models import (
    BenchmarkOut,
    CompareRequest,
    CompareResponse,
    DeploymentCreate,
    DeploymentOut,
    HFModelRecord,
    HFSearchQuery,
    ModelOut,
    OwnerInfo,
    PlaygroundRequest,
    PlaygroundResponse,
    PricingInfo,
)
from ..services.huggingface import hf_service

router = APIRouter()


def require_developer(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if "developer" not in current_user.roles and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Developer workspace access required.",
        )
    return current_user


def _model_to_out(model: Model) -> ModelOut:
    return ModelOut(
        id=model.slug,
        uuid=model.uuid,
        slug=model.slug,
        name=model.name,
        hugging_face_id=model.hugging_face_id,
        description=model.description,
        task=model.task,
        version=model.version,
        model_type=model.model_type,
        tags=model.tags,
        trust_score=model.trust_score,
        accuracy=model.accuracy,
        latency_ms=model.latency_ms,
        throughput_rps=model.throughput_rps,
        price_per_request=model.price_per_request,
        price_per_1k_tokens=model.price_per_1k_tokens,
        price_per_m_input=model.price_per_m_input,
        price_per_m_output=model.price_per_m_output,
        monthly_price=model.monthly_price,
        currency=model.currency,
        status=model.status,
        context_window=model.context_window,
        parameters=model.parameters,
        license=model.license,
        benchmark_results=model.benchmark_results,
        owner_id=model.owner_id,
        owner=OwnerInfo(
            name=model.owner_name or "NeuralForge Labs",
            email=model.owner_email or "support@neuralforge.ai",
            organization=model.owner_org or "NeuralForge",
        ),
        pricing=PricingInfo(
            price_per_request=model.price_per_request,
            price_per_1k_tokens=model.price_per_1k_tokens,
            price_per_m_input=model.price_per_m_input,
            price_per_m_output=model.price_per_m_output,
            monthly_price=model.monthly_price,
            currency=model.currency,
        ),
        downloads=model.downloads,
        likes=model.likes,
        requests=model.requests,
        revenue=model.revenue,
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


@router.get("/models", response_model=list[ModelOut])
async def list_developer_models(
    q: str = Query(default=""),
    task: str = Query(default="All"),
    sort: str = Query(default="trust-desc"),
    limit: int = Query(default=50),
    current_user: User = Depends(require_developer),
) -> list[ModelOut]:
    models = await Model.find(Model.status == "Published").to_list()

    # Apply in-memory or query filtering
    if task and task != "All":
        models = [m for m in models if m.task.lower() == task.lower()]

    if q:
        q_lower = q.lower()
        models = [
            m
            for m in models
            if q_lower in m.name.lower()
            or q_lower in m.description.lower()
            or q_lower in m.hugging_face_id.lower()
            or any(q_lower in tag.lower() for tag in m.tags)
        ]

    # Sorting
    if sort == "trust-desc":
        models.sort(key=lambda m: m.trust_score, reverse=True)
    elif sort == "accuracy-desc":
        models.sort(key=lambda m: m.accuracy, reverse=True)
    elif sort == "latency-asc":
        models.sort(key=lambda m: m.latency_ms)
    elif sort == "price-asc":
        models.sort(key=lambda m: m.price_per_m_input)

    return [_model_to_out(m) for m in models[:limit]]


@router.get("/models/{model_id}", response_model=ModelOut)
async def get_developer_model(
    model_id: str,
    current_user: User = Depends(require_developer),
) -> ModelOut:
    model = await Model.find_one(Model.slug == model_id)
    if not model:
        try:
            uuid_val = UUID(model_id)
            model = await Model.find_one(Model.uuid == uuid_val)
        except Exception:
            pass
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Model not found"
        )
    return _model_to_out(model)


@router.post("/compare", response_model=CompareResponse)
async def compare_developer_models(
    payload: CompareRequest,
    current_user: User = Depends(require_developer),
) -> CompareResponse:
    models = await Model.find(In(Model.slug, payload.model_ids)).to_list()
    benchmarks = await Benchmark.find(
        In(Benchmark.model_id, payload.model_ids)
    ).to_list()

    bench_outs = [
        BenchmarkOut(
            id=str(b.uuid),
            uuid=b.uuid,
            model_id=b.model_id,
            owner_id=b.owner_id,
            dataset=b.dataset,
            test_date=b.test_date,
            accuracy=b.accuracy,
            precision=b.precision,
            recall=b.recall,
            f1_score=b.f1_score,
            latency_ms=b.latency_ms,
            throughput_rps=b.throughput_rps,
            created_at=b.created_at,
        )
        for b in benchmarks
    ]

    return CompareResponse(
        models=[_model_to_out(m) for m in models],
        benchmarks=bench_outs,
    )


@router.post("/playground", response_model=PlaygroundResponse)
async def run_developer_playground(
    payload: PlaygroundRequest,
    current_user: User = Depends(require_developer),
) -> PlaygroundResponse:
    model = await Model.find_one(Model.slug == payload.model_id)
    token = payload.hf_token or current_user.hf_token

    price_in = model.price_per_m_input if model else 0.15
    price_out = model.price_per_m_output if model else 0.60
    hf_repo_id = (
        model.hugging_face_id if (model and model.hugging_face_id) else payload.model_id
    )

    return await hf_service.run_inference_or_playground(
        model_id=hf_repo_id,
        prompt=payload.prompt,
        hf_token=token,
        temperature=payload.temperature,
        max_tokens=payload.max_tokens,
        price_per_m_input=price_in,
        price_per_m_output=price_out,
    )


@router.get("/deployments", response_model=list[DeploymentOut])
async def list_developer_deployments(
    current_user: User = Depends(require_developer),
) -> list[DeploymentOut]:
    deployments = await Deployment.find(
        Deployment.user_id == current_user.uuid, Deployment.status == "active"
    ).to_list()

    return [
        DeploymentOut(
            id=str(d.uuid),
            uuid=d.uuid,
            user_id=d.user_id,
            model_id=d.model_id,
            model_name=d.model_name,
            api_key=d.api_key,
            environment=d.environment,
            region=d.region,
            max_tokens=d.max_tokens,
            temperature=d.temperature,
            rate_limit_rpm=d.rate_limit_rpm,
            endpoint_url=d.endpoint_url
            or f"https://api.synapse.dev/v1/models/{d.model_id}/infer",
            status=d.status,
            created_at=d.created_at,
            curl_example=(
                f"curl -X POST https://api.synapse.dev/v1/models/{d.model_id}/infer \\\n"
                f'  -H "Authorization: Bearer {d.api_key}" \\\n'
                '  -H "Content-Type: application/json" \\\n'
                '  -d \'{"input": "Hello world", "max_tokens": '
                f"{d.max_tokens}"
                "}'"
            ),
        )
        for d in deployments
    ]


@router.post("/deployments", response_model=DeploymentOut)
async def create_developer_deployment(
    payload: DeploymentCreate,
    current_user: User = Depends(require_developer),
) -> DeploymentOut:
    model = await Model.find_one(Model.slug == payload.model_id)
    model_name = model.name if model else payload.model_id.title()
    api_key = f"syn_sec_{secrets.token_hex(16)}"
    endpoint_url = f"https://api.synapse.dev/v1/models/{payload.model_id}/infer"

    deployment = Deployment(
        user_id=current_user.uuid,
        model_id=payload.model_id,
        model_name=model_name,
        api_key=api_key,
        environment=payload.environment,
        region=payload.region,
        max_tokens=payload.max_tokens,
        temperature=payload.temperature,
        rate_limit_rpm=payload.rate_limit_rpm,
        endpoint_url=endpoint_url,
        status="active",
    )
    await deployment.create()

    return DeploymentOut(
        id=str(deployment.uuid),
        uuid=deployment.uuid,
        user_id=deployment.user_id,
        model_id=deployment.model_id,
        model_name=deployment.model_name,
        api_key=deployment.api_key,
        environment=deployment.environment,
        region=deployment.region,
        max_tokens=deployment.max_tokens,
        temperature=deployment.temperature,
        rate_limit_rpm=deployment.rate_limit_rpm,
        endpoint_url=deployment.endpoint_url,
        status=deployment.status,
        created_at=deployment.created_at,
        curl_example=(
            f"curl -X POST {endpoint_url} \\\n"
            f'  -H "Authorization: Bearer {api_key}" \\\n'
            '  -H "Content-Type: application/json" \\\n'
            '  -d \'{"input": "Hello world", "max_tokens": '
            f"{deployment.max_tokens}"
            "}'"
        ),
    )


@router.delete("/deployments/{deployment_id}", response_model=dict[str, str])
async def delete_developer_deployment(
    deployment_id: str,
    current_user: User = Depends(require_developer),
) -> dict[str, str]:
    try:
        uuid_val = UUID(deployment_id)
        deployment = await Deployment.find_one(
            Deployment.uuid == uuid_val, Deployment.user_id == current_user.uuid
        )
    except Exception:
        deployment = None

    if not deployment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Deployment not found",
        )

    deployment.status = "revoked"
    await deployment.save()
    return {"message": "Deployment revoked successfully", "id": deployment_id}


@router.get("/recommendations", response_model=list[ModelOut])
async def get_developer_recommendations(
    task: str | None = Query(default=None),
    max_latency_ms: int | None = Query(default=None),
    max_price: float | None = Query(default=None),
    min_trust: float | None = Query(default=None),
    limit: int = Query(default=3),
    current_user: User = Depends(require_developer),
) -> list[ModelOut]:
    models = await Model.find(Model.status == "Published").to_list()

    if task and task != "All":
        models = [m for m in models if m.task.lower() == task.lower()]

    if max_latency_ms:
        models = [m for m in models if m.latency_ms <= max_latency_ms]

    if max_price:
        models = [m for m in models if m.price_per_m_input <= max_price]

    if min_trust:
        models = [m for m in models if m.trust_score >= min_trust]

    # Rank by composite balance of trust score and accuracy
    models.sort(key=lambda m: (m.trust_score * 0.6 + m.accuracy * 0.4), reverse=True)
    return [_model_to_out(m) for m in models[:limit]]


@router.post("/hf/search", response_model=list[HFModelRecord])
async def search_hf_for_developers(
    query: HFSearchQuery,
    current_user: User = Depends(require_developer),
) -> list[HFModelRecord]:
    return await hf_service.search_hf_models(
        query=query.q,
        task=query.task,
        limit=query.limit,
        sort=query.sort or "downloads",
        token=current_user.hf_token,
    )

