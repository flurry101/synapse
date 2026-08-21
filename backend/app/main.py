from contextlib import asynccontextmanager

from beanie import init_beanie
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from .auth.auth import get_hashed_password
from .config.config import settings
from .models import Benchmark, Deployment, Model, User
from .routers.api import api_router


async def seed_initial_data(admin_user: User) -> None:
    model_count = await Model.count()
    if model_count == 0:
        seed_models = [
            Model(
                slug="synapse-gpt-lite",
                name="Synapse GPT Lite",
                hugging_face_id="neuralforge/synapse-gpt-lite",
                description=(
                    "Balanced assistant model for product copilots and "
                    "workflow automation."
                ),
                task="General Chat",
                version="1.4.2",
                model_type="Decoder-only Transformer",
                tags=["writing", "enterprise", "safe-completion", "llm"],
                trust_score=92.0,
                accuracy=89.0,
                latency_ms=210,
                throughput_rps=48.0,
                price_per_request=0.0009,
                price_per_1k_tokens=0.014,
                price_per_m_input=0.16,
                price_per_m_output=0.65,
                monthly_price=199.0,
                currency="USD",
                status="Published",
                owner_id=admin_user.uuid,
                owner_name="NeuralForge Labs",
                owner_email=admin_user.email,
                owner_org="NeuralForge",
                context_window="128K",
                parameters="8B",
                license="apache-2.0",
                downloads=182000,
                likes=1240,
                requests=3800000,
                revenue=1240.0,
                benchmark_results={"mmlu": 84, "humaneval": 71, "longContext": 82},
            ),
            Model(
                slug="codepilot-x",
                name="CodePilot X",
                hugging_face_id="Qwen/Qwen2.5-Coder-7B-Instruct",
                description=(
                    "Code-first model tuned for repository understanding "
                    "and patch generation."
                ),
                task="Coding",
                version="2.0.0",
                model_type="Mixture of Experts",
                tags=["code", "review", "tool-calling", "coding"],
                trust_score=88.0,
                accuracy=91.0,
                latency_ms=260,
                throughput_rps=38.0,
                price_per_request=0.0012,
                price_per_1k_tokens=0.018,
                price_per_m_input=0.24,
                price_per_m_output=0.92,
                monthly_price=299.0,
                currency="USD",
                status="Published",
                owner_id=admin_user.uuid,
                owner_name="StackNeuron",
                owner_email=admin_user.email,
                owner_org="StackNeuron",
                context_window="128K",
                parameters="7B",
                license="apache-2.0",
                downloads=940000,
                likes=7600,
                requests=2100000,
                revenue=870.0,
                benchmark_results={"mmlu": 79, "humaneval": 86, "longContext": 76},
            ),
            Model(
                slug="neuron-write-1",
                name="Neuron Write 1",
                hugging_face_id="meta-llama/Llama-3.1-8B-Instruct",
                description=(
                    "Structured writing assistant for enterprise workflows "
                    "and summarization."
                ),
                task="General Chat",
                version="1.4.2",
                model_type="Decoder-only Transformer",
                tags=["writing", "enterprise", "safe-completion"],
                trust_score=93.0,
                accuracy=90.4,
                latency_ms=238,
                throughput_rps=42.0,
                price_per_request=0.0009,
                price_per_1k_tokens=0.014,
                price_per_m_input=0.18,
                price_per_m_output=0.75,
                monthly_price=199.0,
                currency="USD",
                status="Published",
                owner_id=admin_user.uuid,
                owner_name="Avery Johnson",
                owner_email=admin_user.email,
                owner_org="Neuron Labs",
                context_window="128K",
                parameters="8B",
                license="llama3.1",
                downloads=1850000,
                likes=14200,
                requests=182000,
                revenue=1240.0,
                benchmark_results={"mmlu": 88, "humaneval": 73, "longContext": 84},
            ),
            Model(
                slug="support-fast-1",
                name="Support Fast 1",
                hugging_face_id="mistralai/Mistral-7B-Instruct-v0.3",
                description=(
                    "Low-latency support model for ticket triage "
                    "and conversational workflows."
                ),
                task="Support",
                version="1.1.0",
                model_type="Decoder-only Transformer",
                tags=["support", "low-latency", "classification"],
                trust_score=85.0,
                accuracy=84.0,
                latency_ms=170,
                throughput_rps=65.0,
                price_per_request=0.0008,
                price_per_1k_tokens=0.012,
                price_per_m_input=0.12,
                price_per_m_output=0.50,
                monthly_price=129.0,
                currency="USD",
                status="Published",
                owner_id=admin_user.uuid,
                owner_name="ServiceMind",
                owner_email=admin_user.email,
                owner_org="ServiceMind",
                context_window="32K",
                parameters="7B",
                license="apache-2.0",
                downloads=1240000,
                likes=9800,
                requests=6200000,
                revenue=910.0,
                benchmark_results={"mmlu": 75, "humaneval": 55, "longContext": 78},
            ),
        ]
        for m in seed_models:
            await m.create()

        # Seed initial benchmarks
        benchmarks = [
            Benchmark(
                model_id="synapse-gpt-lite",
                owner_id=admin_user.uuid,
                dataset="Synapse Eval v2",
                test_date="2026-08-19",
                accuracy=90.4,
                precision=89.1,
                recall=88.6,
                f1_score=88.8,
                latency_ms=238,
                throughput_rps=42.0,
            ),
            Benchmark(
                model_id="codepilot-x",
                owner_id=admin_user.uuid,
                dataset="CodeBench Internal",
                test_date="2026-08-20",
                accuracy=92.2,
                precision=90.2,
                recall=91.8,
                f1_score=91.0,
                latency_ms=281,
                throughput_rps=35.0,
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
        document_models=[User, Model, Benchmark, Deployment],
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
