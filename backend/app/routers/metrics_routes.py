from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.models import SystemMetrics, User
from app.services.metrics_service import metrics_service

router = APIRouter()

@router.get("/{server_id}/snapshot", response_model=SystemMetrics)
async def get_metrics_snapshot(server_id: str, current_user: User = Depends(get_current_user)):
    """
    Return the latest system metrics snapshot for the given server.
    
    Parameters:
        server_id (str): Identifier of the server whose metrics to retrieve.
        current_user (User): Authenticated user performing the request (injected dependency).
    
    Returns:
        SystemMetrics: SystemMetrics model populated from the latest snapshot for the server.
    """
    metrics = metrics_service.get_snapshot(server_id)
    return SystemMetrics(**metrics)