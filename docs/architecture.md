# Project Architecture

## Monorepo Structure
- **Root**: `d:/Programming/HackAThons/The-Gauntlet/`
- **Backend**: Python FastAPI
- **Frontend**: Next.js (React)

## Backend Architecture (MVC/Service Pattern)
The backend follows a modular structure focusing on separation of concerns.

### Directory Structure
```
backend/
  app/
    __init__.py
    main.py
    config.py          # Configuration and Environment Variables
    auth.py            # Authentication Logic
    models.py          # Data Models (Pydantic)
    errors.py          # Custom Error Handling
    dependencies.py    # Dependency Injection
    routers/           # Controllers (API Endpoints)
      auth_routes.py
      metrics_routes.py
      server_routes.py
      agent_routes.py
      websocket_routes.py
    services/          # Business Logic
      ssh_service.py
      metrics_service.py
      server_info_service.py
      agent_service.py
```

### Key Components
- **FastAPI**: Main web framework.
- **LangChain + Gemini**: AI Agent capabilities.
- **Paramiko**: SSH communication.
- **WebSockets**: Real-time metrics.

## Frontend Architecture
Next.js application with a focus on professional, responsive UI.

### Directory Structure
```
frontend/
  app/
    login/page.tsx
    dashboard/page.tsx
    chat/page.tsx
    layout.tsx
    page.tsx
  components/
    ui/                # Reusable UI components (buttons, inputs, cards)
    LoginForm.tsx
    Dashboard/
      MetricsDashboard.tsx
      PortsTable.tsx
      DockerTable.tsx
    Chat/
      AgentChat.tsx
    SSH/
      SshConsole.tsx
  lib/                 # Utilities and API clients
    api.ts
    websocket.ts
  styles/
    globals.css
```
