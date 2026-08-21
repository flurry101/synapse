from fastapi import APIRouter

from . import developer, login, owner, users

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(owner.router, prefix="/owner", tags=["owner"])
api_router.include_router(developer.router, prefix="/developer", tags=["developer"])


@api_router.get("/")
async def root():
    return {"message": "Backend API for synapse-docker operational !"}
