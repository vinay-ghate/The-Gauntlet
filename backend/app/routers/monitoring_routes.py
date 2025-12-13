from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.models import User
from app.services.monitoring_service import monitoring_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{server_id}/snapshot")
async def get_monitoring_snapshot(server_id: str, current_user: User = Depends(get_current_user)):
    """Get comprehensive monitoring snapshot"""
    try:
        data = monitoring_service.get_monitoring_snapshot(server_id)
        return data
    except Exception as e:
        logger.error(f"Error getting monitoring snapshot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{server_id}/process/{pid}/terminate")
async def terminate_process(server_id: str, pid: int, current_user: User = Depends(get_current_user)):
    """Terminate a process gracefully"""
    success = monitoring_service.terminate_process(pid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to terminate process")
    return {"status": "success", "message": f"Process {pid} terminated"}

@router.post("/{server_id}/process/{pid}/kill")
async def kill_process(server_id: str, pid: int, current_user: User = Depends(get_current_user)):
    """Kill a process forcefully"""
    success = monitoring_service.kill_process(pid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to kill process")
    return {"status": "success", "message": f"Process {pid} killed"}

@router.post("/{server_id}/process/{pid}/suspend")
async def suspend_process(server_id: str, pid: int, current_user: User = Depends(get_current_user)):
    """Suspend a process"""
    success = monitoring_service.suspend_process(pid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to suspend process")
    return {"status": "success", "message": f"Process {pid} suspended"}

@router.post("/{server_id}/process/{pid}/resume")
async def resume_process(server_id: str, pid: int, current_user: User = Depends(get_current_user)):
    """Resume a suspended process"""
    success = monitoring_service.resume_process(pid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to resume process")
    return {"status": "success", "message": f"Process {pid} resumed"}
