from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.models import ChatRequest, ChatResponse, User

from app.services.agent_service import agent_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    """
    Send a chat message to the agent service and return the agent's response.
    
    Parameters:
        request (ChatRequest): Contains the message to send and optional server_id to target a specific server.
        current_user (User): Authenticated user making the request.
    
    Returns:
        ChatResponse: Object containing the agent's textual response in the `response` field.
    """
    response = await agent_service.chat(request.message, request.server_id)
    return ChatResponse(response=response)