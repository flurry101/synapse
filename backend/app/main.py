from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from .auth.auth import get_hashed_password
from .config.config import settings
from .models import Benchmark, Deployment, Model, UsageEvent, User
from .routers.api import api_router
from .services.huggingface import hf_service


async def seed_initial_data(admin_user: User) -> None:
    if settings.HF_AUTO_SYNC_ON_STARTUP:
        # Automatically sync and populate 50+ Hugging Face models into MongoDB
        await hf_service.sync_hf_models_to_db(
            limit=settings.HF_SYNC_MODEL_LIMIT,
            sort="downloads",
            owner_id=admin_user.uuid,
        )

    # Ensure initial benchmark suite exists
    benchmark_count = await Benchmark.count()
    if benchmark_count == 0:
        benchmarks = [
            Benchmark(
                model_id="meta-llama-llama-3-1-8b-instruct",
                owner_id=admin_user.uuid,
                dataset="MMLU Multi-Task",
                test_date="2026-08-20",
                accuracy=91.4,
                precision=90.2,
                recall=89.8,
                f1_score=90.0,
                latency_ms=210,
                throughput_rps=48.0,
            ),
            Benchmark(
                model_id="mistralai-mistral-7b-instruct-v0-3",
                owner_id=admin_user.uuid,
                dataset="MT-Bench Conversational",
                test_date="2026-08-20",
                accuracy=88.6,
                precision=87.4,
                recall=88.1,
                f1_score=87.7,
                latency_ms=180,
                throughput_rps=56.0,
            ),
            Benchmark(
                model_id="qwen-qwen2-5-coder-7b-instruct",
                owner_id=admin_user.uuid,
                dataset="HumanEval Python Code",
                test_date="2026-08-21",
                accuracy=92.8,
                precision=91.5,
                recall=93.1,
                f1_score=92.3,
                latency_ms=240,
                throughput_rps=42.0,
            ),
            Benchmark(
                model_id="deepseek-ai-deepseek-r1-distill-qwen-7b",
                owner_id=admin_user.uuid,
                dataset="GSM8K Math Reasoning",
                test_date="2026-08-21",
                accuracy=94.2,
                precision=93.8,
                recall=94.0,
                f1_score=93.9,
                latency_ms=260,
                throughput_rps=38.0,
            ),
        ]
        for b in benchmarks:
            await b.create()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup mongoDB
    if settings.MONGO_URI:
        app.state.client = AsyncIOMotorClient(settings.MONGO_URI)
    else:
        app.state.client = AsyncIOMotorClient(
            settings.MONGO_HOST,
            settings.MONGO_PORT,
            username=settings.MONGO_USER,
            password=settings.MONGO_PASSWORD,
        )
    await init_beanie(
        database=app.state.client[settings.MONGO_DB],
        document_models=[User, Model, Benchmark, Deployment, UsageEvent],
    )

    user = await User.find_one({"email": settings.FIRST_SUPERUSER})
    if not user:
        user = User(
            email=settings.FIRST_SUPERUSER,
            hashed_password=get_hashed_password(settings.FIRST_SUPERUSER_PASSWORD),
            is_superuser=True,
            roles=["developer", "owner"],
        )
        await user.create()

    await seed_initial_data(user)

    # yield app
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            # See https://github.com/pydantic/pydantic/issues/7186
            # for reason of using rstrip
            str(origin).rstrip("/")
            for origin in settings.BACKEND_CORS_ORIGINS
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


app.include_router(api_router, prefix=settings.API_V1_STR)
