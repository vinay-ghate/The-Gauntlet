from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.dependencies import get_current_user
from app.models import Server, CommandRequest, CommandResponse, User
import platform
import socket

router = APIRouter()

@router.get("/", response_model=List[Server])
async def get_servers(current_user: User = Depends(get_current_user)):
    """
    Return a list with server information (OS name, host IP, and owning username) for the current host.
    
    Parameters:
    	current_user (User): Authenticated user whose username is recorded as the server's `user` field.
    
    Returns:
    	servers (List[Server]): A list containing a Server object for the current host. The Server's `name` is the OS name and version, `host` is the resolved IP address (falls back to "127.0.0.1" on resolution failure), and `user` is `current_user.username`.
    """
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
            user=current_user.username  # Extract username from User object
        )
    ]

@router.post("/{server_id}/ssh/run", response_model=CommandResponse)
async def run_command(server_id: str, cmd: CommandRequest, current_user: User = Depends(get_current_user)):
    # In Phase 2 this will call ssh_service
    # For now, return mock
    """
    Execute a command on the specified server (mock implementation).
    
    Parameters:
        server_id (str): Identifier of the target server.
        cmd (CommandRequest): Request object containing the command to run (accessible as `cmd.command`).
    
    Returns:
        CommandResponse: Response containing `stdout` with the mocked command output, `stderr` as an empty string, and `exit_code` set to 0.
    """
    return CommandResponse(
        stdout=f"Mock output for command: {cmd.command} on server {server_id}",
        stderr="",
        exit_code=0
    )

@router.get("/{server_id}/ports")
async def get_ports(server_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve open ports for the specified server.
    
    Parameters:
        server_id (str): Identifier of the server to inspect.
    
    Returns:
        A list of open ports for the specified server.
    """
    from app.services.server_info_service import server_info_service
    return server_info_service.get_ports(server_id)

@router.get("/{server_id}/docker")
async def get_docker(server_id: str, current_user: User = Depends(get_current_user)):
    """
    Retrieve Docker containers running on the specified server.
    
    Parameters:
        server_id (str): Identifier of the server to query for Docker containers.
    
    Returns:
        list: A list of container information objects for the server (e.g., metadata such as container id, image, and status).
    """
    from app.services.server_info_service import server_info_service
    return server_info_service.get_docker_containers(server_id)