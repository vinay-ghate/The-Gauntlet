# Quick Start Guide - Monitoring Feature

## Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:3000`
- User authenticated with valid JWT token

## Starting the Servers

### Backend
```bash
cd backend
# Activate virtual environment (if using one)
# On Windows:
# .\venv\Scripts\activate
# On Linux/Mac:
# source venv/bin/activate

# Install dependencies (if not already installed)
pip install psutil fastapi websockets

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install  # If dependencies not installed
npm run dev
```

## Accessing the Monitoring Feature

1. Open browser: `http://localhost:3000`
2. Login with your credentials
3. Click **"Monitoring"** in the left sidebar
4. Select a server from the dropdown
5. View real-time monitoring data

## Key Features at a Glance

### 📊 Overview Metrics
- **Active Processes**: Total number of running processes
- **Network Connections**: Active network connections count
- **Data Sent**: Total bandwidth sent
- **Data Received**: Total bandwidth received

### 💻 CPU Per Core
- Visual bars showing usage for each CPU core
- Color-coded: Green (< 60%), Yellow (60-80%), Red (> 80%)

### 🔍 Process Explorer
**Columns:**
- PID, Name, User, Status, CPU %, Memory %

**Actions:**
- ⏸️ **Suspend**: Pause process
- ⏹️ **Terminate**: Stop gracefully
- 🗑️ **Kill**: Force stop

### 🌐 Network Monitoring
**Active Connections Table:**
- Local/Remote addresses
- Connection status
- Associated PID

**Top Ports Panel:**
- Most used ports
- Connection counts
- Visual usage bars

## Common Operations

### Terminate a High-CPU Process
1. Find the process in the Process Explorer
2. Click the **Stop** icon (⏹️)
3. Confirm in the dialog
4. Process will be terminated gracefully

### Monitor Network Activity
1. Scroll to "Active Network Connections"
2. Look for ESTABLISHED connections
3. Check "Top Ports by Usage" for high-traffic ports

### Check CPU Core Usage
1. View "CPU Usage Per Core" card
2. Identify cores with high usage
3. Cross-reference with process CPU usage

## Troubleshooting

### "WebSocket connection error"
- **Cause**: Backend not running or token expired
- **Fix**: Restart backend, re-login to get new token

### "Failed to terminate process"
- **Cause**: Insufficient permissions
- **Fix**: Run backend with elevated privileges (admin/sudo)

### No data showing
- **Cause**: Server not selected or backend error
- **Fix**: Select server from dropdown, check backend logs

## API Testing (Optional)

### Test Monitoring Snapshot
```bash
# Get auth token first
TOKEN="your_jwt_token_here"

# Get monitoring snapshot
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/monitoring/local/snapshot
```

### Test Process Termination
```bash
# Terminate process (replace PID)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/monitoring/local/process/1234/terminate
```

## WebSocket Testing

### Using JavaScript Console
```javascript
const token = localStorage.getItem('token');
const ws = new WebSocket(`ws://localhost:8000/ws/monitoring/local?token=${token}`);

ws.onmessage = (event) => {
  console.log('Monitoring data:', JSON.parse(event.data));
};
```

## Performance Tips

1. **Reduce Update Frequency**: Edit `websocket_routes.py`, increase `asyncio.sleep(2)` to `asyncio.sleep(5)`
2. **Limit Process Count**: Edit `monitoring_service.py`, change `limit=100` to `limit=50`
3. **Close Unused Tabs**: Each tab maintains a WebSocket connection

## Security Notes

⚠️ **Important:**
- Process control requires authentication
- Some system processes cannot be terminated
- Always confirm before killing processes
- Use terminate before kill when possible

## Next Steps

1. Explore the AI Agent feature for automated monitoring
2. Set up alerts for high resource usage (coming soon)
3. Export monitoring data for analysis (coming soon)

## Support

For issues or questions:
1. Check backend logs: `backend/backend.log`
2. Check browser console for frontend errors
3. Verify all dependencies are installed
4. Ensure proper permissions for process control

---

**Happy Monitoring! 🚀**
