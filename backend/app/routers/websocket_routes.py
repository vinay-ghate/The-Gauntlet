from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import logging
from app.services.metrics_service import metrics_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/metrics/{server_id}")
async def websocket_endpoint(websocket: WebSocket, server_id: str):
    await websocket.accept()
    logger.info(f"WebSocket connected for server {server_id}")
    try:
        while True:
            # In a real scenario, this would authenticate the user first (via query param token)
            # Fetch metrics
            data = metrics_service.get_snapshot(server_id)
            await websocket.send_json(data)
            await asyncio.sleep(1) # Send every second
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for server {server_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()
