from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.models import SystemMetrics
from app.services.metrics_service import metrics_service

router = APIRouter()

@router.get("/{server_id}/snapshot", response_model=SystemMetrics)
async def get_metrics_snapshot(server_id: str, current_user: str = Depends(get_current_user)):
    """Get real system metrics"""
    metrics = metrics_service.get_snapshot(server_id)
    return SystemMetrics(**metrics)
