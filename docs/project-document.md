
## 1. High-level design

- Monorepo (recommended):
  - `backend/` – FastAPI + LangChain + Gemini + SSH + metrics API.
  - `frontend/` – Next.js/React dashboard deployed to Vercel, calling the backend.
- Auth (for now):
  - Single admin user: `ADMIN_USERNAME`, `ADMIN_PASSWORD` from environment variables (`.env` in dev, platform secrets in prod).[2][7][8][9][10][1]
  - Simple session or signed JWT created by FastAPI after login.
- Main features:
  - Login page (frontend) → calls `/auth/login` (backend).
  - Dashboard:
    - Live metrics charts (CPU, RAM, disk, network, processes).
    - Open ports list.
    - Docker containers list.
  - Chat with agent (LangChain + Gemini) with tools:
    - Fetch snapshot metrics, ports, docker, logs.
  - Manual SSH command panel with basic safety.
- Error handling:
  - Central FastAPI exception handlers for auth errors, SSH errors, validation errors, and a global fallback.[11][12][5][6]

***

## 2. Backend project structure (FastAPI)

A simple but clean structure:[3][4][13]

```text
backend/
  app/
    __init__.py
    main.py
    config.py          # env, settings
    auth.py            # simple auth logic
    models.py          # Pydantic schemas
    errors.py          # custom exceptions
    dependencies.py    # auth dependency, common deps
    routers/
      auth_routes.py
      metrics_routes.py
      server_routes.py   # ports, docker, ssh
      agent_routes.py    # chat with LangChain+Gemini
      websocket_routes.py
    services/
      ssh_service.py
      metrics_service.py
      server_info_service.py  # ports, docker
      agent_service.py        # langchain+gemini
```

Key configuration:

- `config.py`:
  - Use Pydantic settings to read env:
    - `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
    - `GEMINI_API_KEY`.
    - `SSH_PRIVATE_KEY_PATH` or SSH password (if needed).
    - Allowed servers list.[7][8][9][10][1][2]

***

## 3. Auth (simple env-based)

### 3.1. Flow

1. Frontend shows login form (username + password).
2. POST `/auth/login` with JSON body.
3. Backend:
   - Compares with env values.
   - If OK, issues a short-lived JWT or sets httpOnly cookie (JWT recommended for future upgrade).[14][15]
4. Frontend stores JWT securely (memory or httpOnly cookie) and sends it in `Authorization: Bearer` header for every request.
5. Protected routes use `Depends(current_user)` to reject unauthenticated users.

### 3.2. Error handling

- On wrong credentials, return `HTTPException(status_code=401, detail="Invalid credentials")` with a consistent error schema.[5][6]
- Global error model for responses:
  - `{ "detail": "message", "code": "ERROR_CODE" }`.

***

## 4. Core API endpoints

### 4.1. Auth routes

- `POST /auth/login`:
  - Body: `{ username, password }`.
  - On success: `{ token: "<jwt>", user: { username } }`.
  - Errors:
    - 400 – Validation issue.
    - 401 – Invalid credentials.

- `GET /auth/me`:
  - Returns current user info, used on frontend for session check.

### 4.2. Metrics and dashboard

- `GET /servers`:
  - List configured servers (id, name, host).

- `GET /servers/{id}/metrics`:
  - Returns latest snapshot: CPU, RAM, disk, network, top processes.
  - Implementation: either Node Exporter/Prometheus or direct agent/psutil.[16][17][18][19][20]

- `GET /servers/{id}/ports`:
  - Returns open ports: port, protocol, process name, PID, listening address.
  - Implementation: SSH → `ss -tulnp` or `netstat` parsed into JSON.

- `GET /servers/{id}/docker`:
  - Returns running containers: name, image, status, ports, CPU%/mem% if available.

### 4.3. Manual SSH command

- `POST /servers/{id}/ssh/run`:
  - Body: `{ command: "uptime" }`.
  - Implementation: Paramiko or async SSH client; run command and return `{ stdout, stderr, exit_code }`.[21][22][23][24]
- Safety:
  - Only allow for authenticated user.
  - Optional: simple allowlist, e.g., forbid `rm`, `mkfs`, etc.

### 4.4. Agent (LangChain + Gemini)

- `POST /agent/chat`:
  - Body: `{ message, server_id }`.
  - Flow:
    - Initialize Gemini LLM via LangChain integration and a tool-using agent.[25][26][27][28][29]
    - Tools:
      - `tool_get_metrics(server_id)` → uses metrics service.
      - `tool_get_ports(server_id)` → uses ports service.
      - `tool_get_docker(server_id)` → uses docker service.
    - Agent calls tools as needed, builds answer.
    - Stream response tokens for better UX (FastAPI streaming).[30][31]
  - Errors:
    - Tool failures mapped to structured errors that the agent can surface to user (e.g., “SSH connection failed”).

### 4.5. WebSockets for live metrics

- `GET /ws/metrics/{server_id}`:
  - WebSocket endpoint (protected by token) that:
    - On connect, validates user.
    - Every second: uses metrics service to fetch CPU, RAM, etc., sends JSON.
  - Use FastAPI WebSocket patterns.[32][33][34][35]

***

## 5. Frontend (Next.js on Vercel) – simplified

### 5.1. Project structure

```text
frontend/
  app/
    login/page.tsx
    dashboard/page.tsx
    chat/page.tsx
  components/
    LoginForm.tsx
    MetricsDashboard.tsx
    PortsTable.tsx
    DockerTable.tsx
    AgentChat.tsx
    SshConsole.tsx
```

### 5.2. Screens and flow

- Login page:
  - Simple form; on submit, call `/auth/login`.
  - Store JWT and redirect to `/dashboard`.

- Dashboard page:
  - Server selector.
  - Use WebSocket `ws/metrics/{server_id}` to drive charts.
  - Call `/servers/{id}/ports` and `/servers/{id}/docker` periodically or on refresh.

- Chat page:
  - Pass `server_id` and `message` to `/agent/chat`, handle streamed text.

- SSH console:
  - Text input for command, result output area.
  - Call `/servers/{id}/ssh/run`.
  - Show error messages clearly if command fails.

***

## 6. Error handling strategy (must-have)

### 6.1. Backend

- Global model:
  - All errors return JSON: `{ "detail": "Human-readable", "code": "SOME_CODE" }`.[12][6][11][5]

- Custom exceptions:
  - `AuthError`, `SSHError`, `MetricsError`, `DockerError`.
  - Register `@app.exception_handler` for each, mapping to appropriate status codes and messages.

- Validation errors:
  - Rely on FastAPI’s built-in validation.
  - Optionally customize response format via exception handler.

- Logging:
  - Log all unexpected exceptions with stack trace to file or logging service (local or remote).
  - For SSH failures, include server id and command in log (but never plain passwords).

### 6.2. Frontend

- Central error handler:
  - Wrap API calls in a small helper that:
    - Checks if `response.ok`.
    - Parses `{ detail, code }` and shows toast/banner.
  - For WebSocket:
    - Handle `onerror` and `onclose` with user-friendly message (“Lost connection to metrics stream; retrying…”).

***

## 7. Simplified implementation steps

1. **Backend basics**
   - Setup FastAPI project and `config.py` to read env (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `GEMINI_API_KEY`, server list).[8][9][10][1][2][7]
   - Implement `auth.py`, `auth_routes.py` with simple login + JWT.

2. **Services**
   - `ssh_service.py`: wrapper around Paramiko to run a command given a server config.
   - `metrics_service.py`: use SSH to run a small Python script or `vmstat`/`top` style commands and parse.
   - `server_info_service.py`: functions `get_ports`, `get_docker_containers`.

3. **Routers**
   - Implement `/servers`, `/servers/{id}/metrics`, `/servers/{id}/ports`, `/servers/{id}/docker`, `/servers/{id}/ssh/run`.
   - Add WebSocket `/ws/metrics/{server_id}`.

4. **Agent**
   - In `agent_service.py`, create LangChain tools that internally call metrics/ports/docker services.[27][28][29]
   - Implement `/agent/chat` route that uses Gemini via LangChain.

5. **Error handling**
   - Define exceptions and register handlers (auth, SSH, metrics, generic).[6][11][12][5]

6. **Frontend**
   - Simple Next.js app with pages: login, dashboard, chat.
   - Integrate WebSocket for live metrics and basic charts.
   - Integrate chat, ports, docker tables, SSH console.

7. **Deploy**
   - Frontend to Vercel.
   - Backend to a suitable host (can also be Vercel’s Python/FastAPI runtime or another server) and configure environment variables/secrets.[36][37][38]
