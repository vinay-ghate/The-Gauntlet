# The Gauntlet 🛡️

A powerful AI-powered system operations dashboard with real-time monitoring, terminal access, and intelligent agent assistance.

### Preview : [The Gauntlet](https://the-gauntlet-756t.vercel.app/login)

![The Gauntlet](https://img.shields.io/badge/Status-Active-success)
![Python](https://img.shields.io/badge/Python-3.13-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/vinay-ghate/The-Gauntlet?utm_source=oss&utm_medium=github&utm_campaign=vinay-ghate%2FThe-Gauntlet&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## 🌟 Features

### 🖥️ **System Monitoring**
- **Real-time Metrics**: Live CPU, RAM, and Disk usage monitoring using `psutil`
- **Auto-refresh**: Metrics update every 2 seconds
- **Beautiful UI**: Material-UI components with dark theme

### 💻 **Terminal Interface**
- **Full Command Execution**: Run any system command directly from the browser
- **Terminal-like UI**: VS Code-inspired terminal with syntax highlighting
- **Command History**: Persistent session with all executed commands
- **Real-time Output**: See command results instantly

### 🤖 **AI Agent**
- **Powered by Google Gemini 1.5 Pro**: Advanced AI assistance
- **Tool Calling**: AI can execute file system operations
- **File Management**: List files, navigate directories, show file details
- **Search Capabilities**: Find files using glob patterns
- **Smart Responses**: Context-aware assistance

### 🔐 **Security**
- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: All endpoints require authentication
- **CORS Configuration**: Properly configured for development

## 🚀 Quick Start

### Prerequisites

- **Python 3.13+**
- **Node.js 18+**
- **npm or yarn**
- **Google Gemini API Key** ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

#### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/The-Gauntlet.git
cd The-Gauntlet
```

#### 2️⃣ Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env  # Windows
# OR
cp .env.example .env    # Linux/Mac

# Edit .env and add your Gemini API key
# GEMINI_API_KEY=your_api_key_here
```

#### 3️⃣ Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# (Optional) Create .env.local for custom backend URL
# Copy env.example to .env.local if needed
```

### Running the Application

#### Start Backend Server

```bash
# From backend directory
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at: **http://localhost:8000**

#### Start Frontend Server

```bash
# From frontend directory (in a new terminal)
npm run dev
```

The frontend will be available at: **http://localhost:3000**

### 🔑 Default Login Credentials

- **Username**: `admin`
- **Password**: `admin`

> ⚠️ **Important**: Change these credentials in production by updating the `.env` file

## 📁 Project Structure

```
The-Gauntlet/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   │   ├── auth_routes.py
│   │   │   ├── server_routes.py
│   │   │   ├── metrics_routes.py
│   │   │   ├── agent_routes.py
│   │   │   └── command_routes.py
│   │   ├── services/       # Business logic
│   │   │   ├── agent_service.py
│   │   │   └── metrics_service.py
│   │   ├── models.py       # Pydantic models
│   │   ├── config.py       # Configuration
│   │   ├── auth.py         # JWT authentication
│   │   └── main.py         # FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/               # Next.js Frontend
│   ├── app/
│   │   ├── (main)/        # Protected routes
│   │   │   ├── dashboard/ # Dashboard page
│   │   │   └── chat/      # AI Chat page
│   │   ├── api/           # Next.js API routes (proxy)
│   │   ├── login/         # Login page
│   │   └── layout.tsx
│   ├── components/        # React components
│   │   ├── LoginForm.tsx
│   │   └── Sidebar.tsx
│   ├── lib/              # Utilities
│   │   ├── api.ts
│   │   └── config.ts
│   ├── package.json
│   └── env.example
│
└── docs/                 # Documentation
    ├── architecture.md
    ├── checklist.md
    └── project-document.md
```

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Uvicorn**: ASGI server
- **LangChain**: AI agent framework
- **Google Gemini**: AI model
- **psutil**: System metrics
- **python-jose**: JWT tokens
- **passlib**: Password hashing

### Frontend
- **Next.js 16**: React framework with App Router
- **Material-UI (MUI)**: Component library
- **TypeScript**: Type safety
- **Emotion**: CSS-in-JS styling

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Servers
- `GET /servers/` - List all servers

### Metrics
- `GET /metrics/{server_id}/snapshot` - Get real-time metrics

### Commands
- `POST /commands/{server_id}/execute` - Execute system command

### AI Agent
- `POST /agent/chat` - Chat with AI agent

## 🔧 Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (defaults shown)
SECRET_KEY=your-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin
PROJECT_NAME=The Gauntlet Backend
```

### Frontend Environment Variables

Create `frontend/.env.local` (optional):

```env
# Backend URL for client-side (optional)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Backend URL for server-side API routes (optional)
BACKEND_URL=http://localhost:8000
```

## 🎨 Features in Detail

### Dashboard
- Real-time system metrics (CPU, RAM, Disk)
- Server cards with live updates
- Terminal access button
- Responsive grid layout

### Terminal
- Execute any system command
- Command history with timestamps
- Syntax-highlighted output
- VS Code-inspired dark theme
- Clear terminal functionality

### AI Chat
- Natural language queries
- File system operations
- Command execution via AI
- Context-aware responses
- Tool calling capabilities

## 🔒 Security Notes

⚠️ **This application allows unrestricted command execution. Use with caution!**

For production deployment:
1. Change default admin credentials
2. Implement proper command sandboxing
3. Add rate limiting
4. Use HTTPS
5. Implement proper user management
6. Add audit logging
7. Use environment-specific configurations

## 🐛 Troubleshooting

### Backend won't start
- Check if port 8000 is already in use
- Verify Python version (3.13+)
- Ensure all dependencies are installed
- Check if `GEMINI_API_KEY` is set in `.env`

### Frontend won't start
- Check if port 3000 is already in use
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `npm install`

### Commands not working
- Check backend logs for errors
- Verify command syntax
- Check timeout settings (30s default)

### AI Agent not responding
- Verify `GEMINI_API_KEY` is valid
- Check backend logs for errors
- Ensure internet connection is active

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Material-UI for beautiful components
- FastAPI for the amazing backend framework
- Next.js for the powerful frontend framework

---

**Built with ❤️ for The Gauntlet Hackathon**
