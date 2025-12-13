from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import logging
from app.services.metrics_service import metrics_service
from app.services.monitoring_service import monitoring_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.websocket("/metrics/{server_id}")
async def websocket_endpoint(websocket: WebSocket, server_id: str):
    """
    Stream metric snapshots for a server over a WebSocket connection.
    
    Accepts the WebSocket and sends metrics snapshots for the given server_id as JSON once per second until the client disconnects or an unexpected error occurs. Logs connection, disconnection, and errors; attempts to close the WebSocket on error.
    
    Parameters:
        server_id (str): Identifier of the server whose metrics will be streamed.
    """
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

@router.websocket("/monitoring/{server_id}")
async def monitoring_websocket(websocket: WebSocket, server_id: str):
    """
    Stream comprehensive monitoring snapshots for a server over a WebSocket connection.
    
    Accepts the WebSocket, then repeatedly sends monitoring snapshots as JSON (approximately every 2 seconds) until the client disconnects. Logs connection, per-iteration debug information, and handles disconnects and other errors by closing the WebSocket when necessary.
    
    Parameters:
        server_id (str): Identifier of the server whose monitoring data will be streamed.
    """
    await websocket.accept()
    logger.info(f"Monitoring WebSocket connected for server {server_id}")
    try:
        while True:
            try:
                # Get comprehensive monitoring data
                logger.debug(f"Fetching monitoring data for server {server_id}")
                data = monitoring_service.get_monitoring_snapshot(server_id)
                logger.debug(f"Sending monitoring data: {len(str(data))} bytes")
                await websocket.send_json(data)
                await asyncio.sleep(2)  # Send every 2 seconds to reduce load
            except Exception as e:
                logger.error(f"Error in monitoring loop: {e}", exc_info=True)
                raise
    except WebSocketDisconnect:
        logger.info(f"Monitoring WebSocket disconnected for server {server_id}")
    except Exception as e:
        logger.error(f"Monitoring WebSocket error: {e}", exc_info=True)
        try:
            await websocket.close()
        except:
            pass