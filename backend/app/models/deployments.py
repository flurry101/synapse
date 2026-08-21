from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID, uuid4

from beanie import Document, Indexed
from pydantic import Field


class Deployment(Document):
    uuid: Annotated[UUID, Field(default_factory=uuid4), Indexed(unique=True)]
    user_id: Annotated[UUID, Indexed()]
    model_id: str
    model_name: str
    api_key: str
    environment: str = "production"
    region: str = "us-east-1"
    max_tokens: int = 1024
    temperature: float = 0.3
    rate_limit_rpm: int = 180
    endpoint_url: str = ""
    status: str = "active"
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )

    class Settings:
        name = "deployments"

