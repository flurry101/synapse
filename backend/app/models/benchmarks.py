from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID, uuid4

from beanie import Document, Indexed
from pydantic import Field


class Benchmark(Document):
    uuid: Annotated[UUID, Field(default_factory=uuid4), Indexed(unique=True)]
    model_id: Annotated[str, Indexed()]
    owner_id: UUID | None = None
    dataset: str
    test_date: str = ""
    accuracy: float = 0.0
    precision: float = 0.0
    recall: float = 0.0
    f1_score: float = 0.0
    latency_ms: int = 0
    throughput_rps: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "benchmarks"
