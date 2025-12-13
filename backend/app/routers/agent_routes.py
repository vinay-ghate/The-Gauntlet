from fastapi import APIRouter, Depends
from app.dependencies import get_current_user
from app.models import ChatRequest, ChatResponse

from app.services.agent_service import agent_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest, current_user: str = Depends(get_current_user)):
    response = await agent_service.chat(request.message, request.server_id)
    return ChatResponse(response=response)
