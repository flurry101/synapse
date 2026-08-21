from datetime import datetime, timezone
from typing import Annotated, Any
from uuid import UUID, uuid4

from beanie import Document, Indexed
from pydantic import Field


class Model(Document):
    uuid: Annotated[UUID, Field(default_factory=uuid4), Indexed(unique=True)]
    slug: Annotated[str, Indexed(unique=True)]
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
    status: str = "Published"  # "Draft" | "Published" | "Paused" | "Deprecated"
    owner_id: UUID | None = None
    owner_name: str = ""
    owner_email: str = ""
    owner_org: str = ""
    context_window: str = "128K"
    parameters: str = "8B"
    license: str = "apache-2.0"
    downloads: int = 0
    likes: int = 0
    requests: int = 0
    revenue: float = 0.0
    benchmark_results: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "models"
