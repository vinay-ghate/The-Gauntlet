from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.models import User
from app.services.monitoring_service import monitoring_service
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/{server_id}/snapshot")
async def get_monitoring_snapshot(server_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve a comprehensive monitoring snapshot for the specified server.
    
    Parameters:
        server_id (str): Identifier of the server to retrieve the snapshot for.
    
    Returns:
        dict: Monitoring snapshot data (e.g., metrics and process information) for the server.
    
    Raises:
        HTTPException: with status code 500 if snapshot retrieval fails.
    """
    try:
        data = monitoring_service.get_monitoring_snapshot(server_id)
        return data
    except Exception as e:
        logger.error(f"Error getting monitoring snapshot: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{server_id}/process/{pid}/terminate")
async def terminate_process(server_id: str, pid: int, current_user: User = Depends(get_current_user)):
    """
    Terminate a process on the specified server gracefully.
    
    Parameters:
        server_id (str): Identifier of the server hosting the process.
        pid (int): Process ID to terminate.
    
    Returns:
        dict: A JSON-like object with keys `status` and `message` confirming termination, e.g. `{"status": "success", "message": "Process <pid> terminated"}`.
    
    Raises:
        HTTPException: Raised with status code 400 if the termination fails.
    """
    success = monitoring_service.terminate_process(pid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to terminate process")
    return {"status": "success", "message": f"Process {pid} terminated"}

@router.post("/{server_id}/process/{pid}/kill")
async def kill_process(server_id: str, pid: int, current_user: User = Depends(get_current_user)):
    """
    Forcefully terminates the process with the given PID on the specified server.
    
    Returns:
        dict: {"status": "success", "message": "Process <pid> killed"} on successful termination.
    
    Raises:
        HTTPException: with status code 400 if the process could not be killed.
    """
    success = monitoring_service.kill_process(pid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to kill process")
    return {"status": "success", "message": f"Process {pid} killed"}

@router.post("/{server_id}/process/{pid}/suspend")
async def suspend_process(server_id: str, pid: int, current_user: User = Depends(get_current_user)):
    """
    Suspend the process with the given PID on the specified server.
    
    Parameters:
    	server_id (str): Identifier of the server where the process is running.
    	pid (int): Process ID to suspend.
    
    Returns:
    	response (dict): JSON object with `status` set to `"success"` and a `message` confirming the suspended PID.
    
    Raises:
    	HTTPException: With status code 400 if the process could not be suspended.
    """
    success = monitoring_service.suspend_process(pid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to suspend process")
    return {"status": "success", "message": f"Process {pid} suspended"}

@router.post("/{server_id}/process/{pid}/resume")
async def resume_process(server_id: str, pid: int, current_user: User = Depends(get_current_user)):
    """
    Resume a suspended process on the specified server.
    
    Returns:
        dict: Response object with keys:
            - status (str): "success"
            - message (str): human-readable confirmation including the process id
    
    Raises:
        HTTPException: status code 400 if the process could not be resumed.
    """
    success = monitoring_service.resume_process(pid)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to resume process")
    return {"status": "success", "message": f"Process {pid} resumed"}