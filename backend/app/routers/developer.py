import re
import secrets
from datetime import datetime, timezone
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status

from ..auth.auth import get_current_active_user
from ..models import Benchmark, Deployment, Model, UsageEvent, User
from ..schemas.models import (
    BenchmarkOut,
    CompareRequest,
    CompareResponse,
    DeploymentCreate,
    DeploymentOut,
    DeploymentQuickstartSpecs,
    HFModelRecord,
    HFSearchQuery,
    HFSyncRequest,
    HFSyncResponse,
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
            name=(
                model.hugging_face_id.split("/")[0]
                if (model.hugging_face_id and "/" in model.hugging_face_id)
                else (model.owner_name or "Community")
            ),
            email="hub@huggingface.co",
            organization=(
                model.hugging_face_id.split("/")[0]
                if (model.hugging_face_id and "/" in model.hugging_face_id)
                else (model.owner_org or "Community")
            ),
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


def _hf_detail_to_out(detail: dict) -> ModelOut:
    hf_id = detail.get("hugging_face_id") or "meta-llama/Llama-3.1-8B-Instruct"
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", hf_id.lower()).strip("-")
    p_in = detail.get("price_per_m_input", 0.15)
    p_out = detail.get("price_per_m_output", 0.45)
    now = datetime.now(timezone.utc)
    author = detail.get("owner_name") or (
        hf_id.split("/")[0] if "/" in hf_id else "Community"
    )

    return ModelOut(
        id=slug,
        uuid=uuid4(),
        slug=slug,
        name=detail.get("name", slug),
        hugging_face_id=hf_id,
        description=detail.get("description", ""),
        task=detail.get("task", "General Chat"),
        version=detail.get("version", "1.0.0"),
        model_type=detail.get("model_type", "Decoder-only Transformer"),
        tags=detail.get("tags", []),
        trust_score=detail.get("trust_score", 92.0),
        accuracy=detail.get("accuracy", 90.0),
        latency_ms=detail.get("latency_ms", 200),
        throughput_rps=45.0,
        price_per_request=0.001,
        price_per_1k_tokens=round(p_in / 10, 4),
        price_per_m_input=p_in,
        price_per_m_output=p_out,
        monthly_price=199.0,
        currency="USD",
        status="Published",
        context_window=detail.get("context_window", "128K"),
        parameters=detail.get("parameters", "8B"),
        license=detail.get("license", "apache-2.0"),
        benchmark_results=detail.get(
            "benchmark_results", {"mmlu": 88, "humaneval": 82, "longContext": 86}
        ),
        owner_id=None,
        owner=OwnerInfo(
            name=author,
            email="hub@huggingface.co",
            organization=author,
        ),
        pricing=PricingInfo(
            price_per_request=0.001,
            price_per_1k_tokens=round(p_in / 10, 4),
            price_per_m_input=p_in,
            price_per_m_output=p_out,
            monthly_price=199.0,
            currency="USD",
        ),
        downloads=detail.get("downloads", 10000),
        likes=detail.get("likes", 500),
        requests=detail.get("downloads", 10000) // 4,
        revenue=round((detail.get("downloads", 10000) // 2000) * 1.5, 2),
        created_at=now,
        updated_at=now,
    )


@router.get("/models", response_model=list[ModelOut])
async def list_developer_models(
    q: str = Query(default=""),
    task: str = Query(default="All"),
    category: str | None = Query(default=None),
    parameters: str | None = Query(default=None),
    license: str | None = Query(default=None),
    sort: str = Query(default="trust-desc"),
    limit: int = Query(default=50),
    current_user: User = Depends(require_developer),
) -> list[ModelOut]:
    models = await Model.find(Model.status == "Published").to_list()
    if models:
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
        if category:
            cat_lower = category.lower()
            models = [
                m
                for m in models
                if any(cat_lower in t.lower() for t in m.tags)
                or cat_lower in m.task.lower()
            ]
        if parameters:
            param_lower = parameters.lower()
            models = [m for m in models if param_lower in m.parameters.lower()]
        if license and license != "All":
            lic_lower = license.lower()
            models = [m for m in models if lic_lower in m.license.lower()]

        if sort == "trust-desc":
            models.sort(key=lambda m: m.trust_score, reverse=True)
        elif sort == "accuracy-desc":
            models.sort(key=lambda m: m.accuracy, reverse=True)
        elif sort == "latency-asc":
            models.sort(key=lambda m: m.latency_ms)
        elif sort == "price-asc":
            models.sort(key=lambda m: m.price_per_m_input)

        return [_model_to_out(m) for m in models[:limit]]

    hf_records = await hf_service.search_hf_models(
        query=q,
        task=task,
        category=category,
        parameters=parameters,
        license=license,
        limit=limit,
        token=current_user.hf_token,
    )
    return [
        _hf_detail_to_out(
            await hf_service.get_hf_model_details(r.id, token=current_user.hf_token)
        )
        for r in hf_records
    ]


@router.get("/models/{model_id:path}", response_model=ModelOut)
async def get_developer_model(
    model_id: str,
    current_user: User = Depends(require_developer),
) -> ModelOut:
    model = await Model.find_one(Model.slug == model_id)
    if not model:
        model = await Model.find_one(Model.hugging_face_id == model_id)
    if not model:
        try:
            uuid_val = UUID(model_id)
            model = await Model.find_one(Model.uuid == uuid_val)
        except Exception:
            pass
    if model:
        return _model_to_out(model)

    canonical_id = hf_service._resolve_canonical_repo_id(model_id)
    detail = await hf_service.get_hf_model_details(
        canonical_id, token=current_user.hf_token
    )
    return _hf_detail_to_out(detail)


@router.post("/compare", response_model=CompareResponse)
async def compare_developer_models(
    payload: CompareRequest,
    current_user: User = Depends(require_developer),
) -> CompareResponse:
    model_outs: list[ModelOut] = []
    bench_outs: list[BenchmarkOut] = []

    for mid in payload.model_ids:
        model = await Model.find_one(Model.slug == mid)
        if not model:
            model = await Model.find_one(Model.hugging_face_id == mid)
        if model:
            model_outs.append(_model_to_out(model))
            benchmarks = await Benchmark.find(Benchmark.model_id == model.slug).to_list()
            bench_outs.extend(
                [
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
            )
        else:
            canonical_id = hf_service._resolve_canonical_repo_id(mid)
            detail = await hf_service.get_hf_model_details(
                canonical_id, token=current_user.hf_token
            )
            model_outs.append(_hf_detail_to_out(detail))

    return CompareResponse(
        models=model_outs,
        benchmarks=bench_outs,
    )


@router.get("/hf/specs/{model_id:path}", response_model=DeploymentQuickstartSpecs)
async def get_hf_model_specs(
    model_id: str,
    current_user: User = Depends(require_developer),
) -> DeploymentQuickstartSpecs:
    return hf_service.get_hf_deployment_specs(model_id, token=current_user.hf_token)


@router.post("/playground", response_model=PlaygroundResponse)
async def run_developer_playground(
    payload: PlaygroundRequest,
    current_user: User = Depends(require_developer),
) -> PlaygroundResponse:
    # Check rate limit to maintain uptime
    allowed, retry_after = hf_service.check_rate_limit(str(current_user.uuid))
    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Please retry after {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)},
        )

    model = await Model.find_one(Model.slug == payload.model_id)
    if not model:
        model = await Model.find_one(Model.hugging_face_id == payload.model_id)

    token = payload.hf_token or current_user.hf_token
    price_in = model.price_per_m_input if model else 0.15
    price_out = model.price_per_m_output if model else 0.45
    hf_repo_id = (
        model.hugging_face_id if (model and model.hugging_face_id) else payload.model_id
    )

    res = await hf_service.run_inference_or_playground(
        model_id=hf_repo_id,
        prompt=payload.prompt,
        hf_token=token,
        temperature=payload.temperature,
        max_tokens=payload.max_tokens,
        price_per_m_input=price_in,
        price_per_m_output=price_out,
    )

    try:
        event = UsageEvent(
            model_id=model.slug if model else payload.model_id,
            model_name=model.name if model else payload.model_id,
            app_name="Developer Playground",
            user_id=current_user.uuid if current_user else None,
            prompt_tokens=res.prompt_tokens,
            completion_tokens=res.completion_tokens,
            total_tokens=res.total_tokens,
            latency_ms=res.latency_ms,
            cost_usd=res.cost_usd,
            status="success",
        )
        await event.create()

        if model:
            model.requests = (model.requests or 0) + 1
            model.revenue = round((model.revenue or 0.0) + res.cost_usd, 4)
            await model.save()
    except Exception:
        pass

    return res


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
            or "https://router.huggingface.co/hf-inference/v1",
            status=d.status,
            created_at=d.created_at,
            curl_example=(
                "curl https://router.huggingface.co/hf-inference/v1/chat/completions \\\n"
                f'  -H "Authorization: Bearer {d.api_key}" \\\n'
                '  -H "Content-Type: application/json" \\\n'
                f'  -d \'{{"model": "{d.model_id}", "messages": [{{"role": "user", "content": "Hello world"}}], "max_tokens": '
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
    if not model:
        model = await Model.find_one(Model.hugging_face_id == payload.model_id)
    model_name = (
        model.name if model else hf_service._extract_friendly_name(payload.model_id)
    )
    api_key = f"syn_sec_{secrets.token_hex(16)}"
    endpoint_url = "https://router.huggingface.co/hf-inference/v1"

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
            f"curl https://router.huggingface.co/hf-inference/v1/chat/completions \\\n"
            f'  -H "Authorization: Bearer {api_key}" \\\n'
            '  -H "Content-Type: application/json" \\\n'
            f'  -d \'{{"model": "{deployment.model_id}", "messages": [{{"role": "user", "content": "Hello world"}}], "max_tokens": '
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

    if not models:
        hf_records = await hf_service.search_hf_models(
            task=task, limit=limit, token=current_user.hf_token
        )
        return [
            _hf_detail_to_out(await hf_service.get_hf_model_details(r.id))
            for r in hf_records
        ]

    if task and task != "All":
        models = [m for m in models if m.task.lower() == task.lower()]

    if max_latency_ms:
        models = [m for m in models if m.latency_ms <= max_latency_ms]

    if max_price:
        models = [m for m in models if m.price_per_m_input <= max_price]

    if min_trust:
        models = [m for m in models if m.trust_score >= min_trust]

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
        category=query.category,
        parameters=query.parameters,
        license=query.license,
        limit=query.limit,
        sort=query.sort or "downloads",
        token=current_user.hf_token,
    )


@router.post("/hf/sync", response_model=HFSyncResponse)
async def sync_hf_for_developers(
    payload: HFSyncRequest,
    current_user: User = Depends(require_developer),
) -> HFSyncResponse:
    token = payload.hf_token or current_user.hf_token
    total, created, updated = await hf_service.sync_hf_models_to_db(
        limit=payload.limit,
        sort=payload.sort,
        task=payload.task,
        owner_id=current_user.uuid,
        token=token,
    )
    return HFSyncResponse(
        status="success",
        total_synced=total,
        created_count=created,
        updated_count=updated,
        message=f"Successfully synced {total} models from Hugging Face Hub ({created} created, {updated} updated).",
    )
