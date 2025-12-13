from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.dependencies import get_current_user
from app.models import Server, CommandRequest, CommandResponse
import platform
import socket

router = APIRouter()

@router.get("/", response_model=List[Server])
async def get_servers(current_user: str = Depends(get_current_user)):
    """Get server information with OS and IP"""
    # Get OS name
    os_name = platform.system()  # Windows, Linux, Darwin (macOS)
    os_version = platform.release()
    server_name = f"{os_name} {os_version}"
    
    # Get IP address
    try:
        # Get hostname
        hostname = socket.gethostname()
        # Get IP address
        ip_address = socket.gethostbyname(hostname)
    except:
        ip_address = "127.0.0.1"
    
    return [
        Server(
            id="1", 
            name=server_name,  # e.g., "Windows 11" or "Linux 5.15"
            host=ip_address,   # e.g., "192.168.1.100"
            user=current_user
        )
    ]

@router.post("/{server_id}/ssh/run", response_model=CommandResponse)
async def run_command(server_id: str, cmd: CommandRequest, current_user: str = Depends(get_current_user)):
    # In Phase 2 this will call ssh_service
    # For now, return mock
    return CommandResponse(
        stdout=f"Mock output for command: {cmd.command} on server {server_id}",
        stderr="",
        exit_code=0
    )

@router.get("/{server_id}/ports")
async def get_ports(server_id: str, current_user: str = Depends(get_current_user)):
    from app.services.server_info_service import server_info_service
    return server_info_service.get_ports(server_id)

@router.get("/{server_id}/docker")
async def get_docker(server_id: str, current_user: str = Depends(get_current_user)):
    from app.services.server_info_service import server_info_service
    return server_info_service.get_docker_containers(server_id)
