# MVP Checklist

## Phase 1: Setup & Configuration
- [x] Initialize Git repository (if not already)
- [x] Create `backend` folder and virtual environment
- [x] Install Python dependencies (FastAPI, Uvicorn, LangChain, Google-GenerativeAI, Paramiko, Pydantic)
- [x] Create `frontend` folder with Next.js (Completed)
- [x] Setup `docs` with tracking files

## Phase 2: Backend Development
- [x] **Core**: Setup `main.py`, `config.py`, global error handling
- [x] **Auth**: `auth.py`, `routers/auth_routes.py` (Login, Me)
- [x] **Services**:
    - [x] `ssh_service.py` (Paramiko connection)
    - [x] `metrics_service.py` (Fetch metrics via SSH)
    - [x] `server_info_service.py` (Ports, Docker)
- [x] **Routers**:
    - [x] `server_routes.py` (CRUD servers, ssh/run)
    - [x] `metrics_routes.py`
    - [x] `websocket_routes.py` (Live metrics)
- [x] **Agent**:
    - [x] `agent_service.py` (LangChain setup with Gemini)
    - [x] `routers/agent_routes.py` (Chat endpoint)

## Phase 3: Frontend Development
- [x] **Styling**: Setup Tailwind CSS (if requested) or global CSS variables for "Professional UI"
- [x] **Components**:
    - [x] Login Form
    - [x] Layout (Sidebar/Navbar)
    - [x] Metrics Cards/Charts
    - [x] Terminal/SSH Console (Integrated in Chat/Dashboard partly)
    - [x] Chat Interface
- [x] **Integration**:
    - [x] Connect Auth
    - [ ] Connect WebSockets for Dashboard (Using Polling for MVP)
    - [x] Connect Chat API

## Phase 4: Polish & "Kiggers" (Loggers)
- [x] Add logging configuration in Backend
- [x] Add loading states and error toasts in Frontend
- [x] Review UI for "Wow" factor (Glassmorpism, Animations)
- [x] Final Testing
