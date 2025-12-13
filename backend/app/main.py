from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth_routes, server_routes, agent_routes, metrics_routes, websocket_routes, command_routes, monitoring_routes
import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("backend.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.PROJECT_NAME)

# CORS - Allow all localhost origins for development
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include Routers
app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
app.include_router(server_routes.router, prefix="/servers", tags=["servers"])
app.include_router(metrics_routes.router, prefix="/metrics", tags=["metrics"])
app.include_router(monitoring_routes.router, prefix="/monitoring", tags=["monitoring"])
app.include_router(agent_routes.router, prefix="/agent", tags=["agent"])
app.include_router(command_routes.router, prefix="/commands", tags=["commands"])
app.include_router(websocket_routes.router, prefix="/ws", tags=["websockets"])

@app.get("/")
def read_root():
    return {"message": "Welcome to The Gauntlet Backend"}

logger.info("Backend application started")
