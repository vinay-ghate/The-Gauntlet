from pydantic import BaseModel

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str

class User(BaseModel):
    username: str

class UserLogin(BaseModel):
    username: str
    password: str

class Server(BaseModel):
    id: str
    name: str
    host: str
    user: str

class SystemMetrics(BaseModel):
    # Basic metrics
    cpu_usage: float
    memory_usage: float
    disk_usage: float
    
    # Detailed info
    cpu_count: int
    cpu_count_logical: int
    total_memory_gb: float
    available_memory_gb: float
    total_disk_gb: float
    free_disk_gb: float
    uptime: str
    
    # Network
    network_sent_mb: float
    network_recv_mb: float
    
    # Top processes
    top_processes: list

class CommandRequest(BaseModel):
    command: str

class CommandResponse(BaseModel):
    output: str
    exit_code: int
    error: str = ""

class ChatRequest(BaseModel):
    message: str
    server_id: str

class ChatResponse(BaseModel):
    response: str
