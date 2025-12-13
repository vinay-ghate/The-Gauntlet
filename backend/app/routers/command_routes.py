from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from app.models import CommandRequest, CommandResponse, User
import subprocess
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/{server_id}/execute", response_model=CommandResponse)
async def execute_command(
    server_id: str,
    command_request: CommandRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Execute a shell command on the specified server and return its output, exit code, and any error text.
    
    The function runs the provided command (currently executed locally), prefers stdout for the returned output, falls back to stderr if stdout is empty, and returns a default success message when both are empty. The subprocess call uses a 30-second timeout.
    
    Parameters:
        server_id (str): Identifier of the target server (currently ignored; command runs on localhost).
        command_request (CommandRequest): Request body containing the shell command to execute (command attribute).
        current_user (User): Authenticated user invoking the command.
    
    Returns:
        CommandResponse: 
            - output: The command's stdout if non-empty, otherwise stderr if non-empty, otherwise "Command executed successfully (no output)".
            - exit_code: The subprocess return code.
            - error: The stderr text when exit_code is non-zero, otherwise an empty string.
    
    Raises:
        HTTPException(408): If the command times out.
        HTTPException(500): For unexpected execution errors.
    """
    try:
        # WARNING: All commands are now allowed - use with caution!
        # For production, implement proper command validation and sandboxing
        
        logger.info(f"Executing command by {current_user.username}: {command_request.command}")
        
        # Execute command
        result = subprocess.run(
            command_request.command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30,  # Increased timeout for longer commands
            cwd=None  # Use current working directory
        )
        
        logger.info(f"Command completed with exit code: {result.returncode}")
        logger.debug(f"Output: {result.stdout[:200]}...")  # Log first 200 chars
        
        # Get output - prefer stdout, fallback to stderr, then default message
        output = result.stdout.strip() if result.stdout.strip() else (
            result.stderr.strip() if result.stderr.strip() else "Command executed successfully (no output)"
        )
        
        return CommandResponse(
            output=output,
            exit_code=result.returncode,
            error=result.stderr if result.returncode != 0 else ""
        )
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=408, detail="Command timed out")
    except Exception as e:
        logger.error(f"Error executing command: {e}")
        raise HTTPException(status_code=500, detail=str(e))