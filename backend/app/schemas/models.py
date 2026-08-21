from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

# -------------------------------------------------------------
# Model Schemas
# -------------------------------------------------------------


class OwnerInfo(BaseModel):
    name: str = ""
    email: str = ""
    organization: str = ""


class PricingInfo(BaseModel):
    price_per_request: float = 0.001
    price_per_1k_tokens: float = 0.015
    price_per_m_input: float = 0.15
    price_per_m_output: float = 0.60
    monthly_price: float | None = None
    currency: str = "USD"


class ModelBase(BaseModel):
    name: str
    hugging_face_id: str = ""
    description: str = ""
    task: str = "General Chat"
    version: str = "1.0.0"
    model_type: str = "Decoder-only Transformer"
    tags: list[str] = Field(default_factory=list)
    trust_score: float = 90.0
    accuracy: float = 88.0
    latency_ms: int = 220
    throughput_rps: float = 40.0
    price_per_request: float = 0.001
    price_per_1k_tokens: float = 0.015
    price_per_m_input: float = 0.15
    price_per_m_output: float = 0.60
    monthly_price: float | None = None
    currency: str = "USD"
    status: str = "Published"
    context_window: str = "128K"
    parameters: str = "8B"
    license: str = "apache-2.0"
    benchmark_results: dict[str, Any] = Field(default_factory=dict)


class ModelCreate(ModelBase):
    slug: str | None = None


class ModelUpdate(BaseModel):
    name: str | None = None
    hugging_face_id: str | None = None
    description: str | None = None
    task: str | None = None
    version: str | None = None
    model_type: str | None = None
    tags: list[str] | None = None
    trust_score: float | None = None
    accuracy: float | None = None
    latency_ms: int | None = None
    throughput_rps: float | None = None
    price_per_request: float | None = None
    price_per_1k_tokens: float | None = None
    price_per_m_input: float | None = None
    price_per_m_output: float | None = None
    monthly_price: float | None = None
    currency: str | None = None
    status: str | None = None
    context_window: str | None = None
    parameters: str | None = None
    license: str | None = None
    benchmark_results: dict[str, Any] | None = None


class ModelPricingUpdate(BaseModel):
    price_per_request: float | None = None
    price_per_1k_tokens: float | None = None
    price_per_m_input: float | None = None
    price_per_m_output: float | None = None
    monthly_price: float | None = None
    currency: str = "USD"


class ModelOut(ModelBase):
    id: str
    uuid: UUID
    slug: str
    owner_id: UUID | None = None
    owner: OwnerInfo
    pricing: PricingInfo
    downloads: int = 0
    likes: int = 0
    requests: int = 0
    revenue: float = 0.0
    created_at: datetime
    updated_at: datetime


# -------------------------------------------------------------
# Benchmark Schemas
# -------------------------------------------------------------


class BenchmarkCreate(BaseModel):
    model_id: str
    dataset: str
    test_date: str | None = None
    accuracy: float = 0.0
    precision: float = 0.0
    recall: float = 0.0
    f1_score: float = 0.0
    latency_ms: int = 0
    throughput_rps: float = 0.0


class BenchmarkOut(BenchmarkCreate):
    id: str
    uuid: UUID
    owner_id: UUID | None = None
    created_at: datetime


# -------------------------------------------------------------
# Deployment Schemas
# -------------------------------------------------------------


class DeploymentCreate(BaseModel):
    model_id: str
    environment: str = "production"
    region: str = "us-east-1"
    max_tokens: int = 1024
    temperature: float = 0.3
    rate_limit_rpm: int = 180


class DeploymentOut(BaseModel):
    id: str
    uuid: UUID
    user_id: UUID
    model_id: str
    model_name: str
    api_key: str
    environment: str
    region: str
    max_tokens: int
    temperature: float
    rate_limit_rpm: int
    endpoint_url: str
    status: str
    created_at: datetime
    curl_example: str = ""


# -------------------------------------------------------------
# Hugging Face Hub Schemas
# -------------------------------------------------------------


class HFSearchQuery(BaseModel):
    q: str = ""
    task: str | None = None
    limit: int = 50
    sort: str | None = "downloads"


class HFModelRecord(BaseModel):
    id: str  # e.g. "meta-llama/Llama-3.1-8B-Instruct"
    name: str
    author: str
    downloads: int = 0
    likes: int = 0
    task: str = ""
    tags: list[str] = Field(default_factory=list)
    license: str = "apache-2.0"
    parameters: str = "Unknown"
    context_window: str = "128K"
    description: str = ""
    is_gated: bool | str = False


class HFImportRequest(BaseModel):
    repo_id: str
    hf_token: str | None = None


class HFSyncRequest(BaseModel):
    limit: int = 50
    sort: str = "downloads"
    task: str | None = None
    hf_token: str | None = None


class HFSyncResponse(BaseModel):
    status: str = "success"
    total_synced: int
    created_count: int
    updated_count: int
    message: str


# -------------------------------------------------------------
# Playground & Comparison Schemas
# -------------------------------------------------------------


class PlaygroundRequest(BaseModel):
    model_id: str
    prompt: str
    temperature: float = 0.7
    max_tokens: int = 256
    hf_token: str | None = None


class PlaygroundResponse(BaseModel):
    model_id: str
    output_text: str
    latency_ms: int
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost_usd: float
    cost_formatted: str


class CompareRequest(BaseModel):
    model_ids: list[str]


class CompareResponse(BaseModel):
    models: list[ModelOut]
    benchmarks: list[BenchmarkOut]


class RecommendationQuery(BaseModel):
    task: str | None = None
    max_latency_ms: int | None = None
    max_price_per_m_input: float | None = None
    min_trust_score: float | None = None
    limit: int = 5


# -------------------------------------------------------------
# Owner Analytics Schemas
# -------------------------------------------------------------


class UsagePoint(BaseModel):
    label: str
    requests: int
    revenue: float


class UsageRow(BaseModel):
    id: str
    app: str
    model: str
    requests: int
    success_rate: float
    revenue: float
    avg_latency_ms: int
    timestamp: str


class OwnerAnalyticsOut(BaseModel):
    total_revenue: float
    total_requests: int
    average_trust_score: float
    active_models_count: int
    time_series: list[dict[str, Any]]
    recent_usage: list[UsageRow]
