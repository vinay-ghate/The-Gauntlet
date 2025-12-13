# 🎯 Advanced Monitoring Feature

> Real-time system observability suite with process management and network analytics

## 🌟 Overview

The Advanced Monitoring feature transforms The Gauntlet into a powerful system monitoring platform with real-time insights into processes, network activity, and system resources.

## 🚀 Quick Access

**Navigation**: Sidebar → **Monitoring** (Insights icon)

## 📊 Feature Highlights

### 1️⃣ Live Process Explorer
```
┌─────────────────────────────────────────────────────────┐
│ PID  │ Name        │ User  │ Status   │ CPU% │ MEM% │ ⚡ │
├─────────────────────────────────────────────────────────┤
│ 1234 │ chrome.exe  │ user  │ Running  │ 45.2 │ 12.3 │ ⏸⏹🗑│
│ 5678 │ python.exe  │ user  │ Running  │ 23.1 │  8.7 │ ⏸⏹🗑│
│ 9012 │ node.exe    │ user  │ Sleeping │  5.4 │  4.2 │ ⏸⏹🗑│
└─────────────────────────────────────────────────────────┘
```

**Actions Available:**
- ⏸️ **Suspend** - Pause process temporarily
- ⏹️ **Terminate** - Stop gracefully
- 🗑️ **Kill** - Force stop

### 2️⃣ Network Monitoring Dashboard

**Active Connections**
```
┌────────────────────────────────────────────────────────┐
│ Local Address    │ Remote Address   │ Status      │PID│
├────────────────────────────────────────────────────────┤
│ 192.168.1.5:443  │ 142.250.1.1:443 │ ESTABLISHED │123│
│ 192.168.1.5:8080 │ 0.0.0.0:0       │ LISTEN      │456│
└────────────────────────────────────────────────────────┘
```

**Top Ports**
```
Port 443  ████████████████░░░░  80 connections
Port 8080 ████████░░░░░░░░░░░░  40 connections
Port 3000 ████░░░░░░░░░░░░░░░░  20 connections
```

### 3️⃣ System Metrics

**Overview Cards**
```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🔢 Processes │ │ 🌐 Network   │ │ ⬆️ Data Sent │ │ ⬇️ Data Recv │
│     156      │ │      42      │ │   245.3 MB   │ │   512.7 MB   │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

**CPU Per Core**
```
Core 0  ████████████████████░░  85.2%  🔴
Core 1  ████████████░░░░░░░░░░  62.4%  🟡
Core 2  ████████░░░░░░░░░░░░░░  45.1%  🟢
Core 3  ██████░░░░░░░░░░░░░░░░  32.8%  🟢
```

## 🔧 Technical Architecture

### Backend Stack
```
FastAPI (REST API)
    ↓
WebSocket (Real-time)
    ↓
psutil (System Metrics)
    ↓
Monitoring Service
```

### Frontend Stack
```
Next.js (React)
    ↓
Material-UI (Components)
    ↓
WebSocket Client
    ↓
Monitoring Dashboard
```

## 🎨 UI/UX Features

- ✨ **Modern Design**: Premium Material-UI components
- 🎨 **Color-Coded**: Status indicators and alerts
- 📱 **Responsive**: Works on all screen sizes
- ⚡ **Real-time**: WebSocket updates every 2 seconds
- 🔒 **Safe**: Confirmation dialogs for destructive actions
- 🎯 **Intuitive**: Clear labels and tooltips

## 🔐 Security

- 🔑 JWT authentication required
- 🛡️ Permission-based process control
- ⚠️ Confirmation dialogs
- 🚫 Protected system processes
- 📝 Audit logging

## 📈 Performance

| Metric | Value |
|--------|-------|
| Update Interval | 2 seconds |
| Max Processes | 100 |
| Max Connections | 100 |
| WebSocket Latency | < 50ms |

## 🎯 Use Cases

### 1. Identify Resource Hogs
```
1. Open Monitoring page
2. Sort processes by CPU%
3. Identify high-usage processes
4. Terminate if necessary
```

### 2. Monitor Network Activity
```
1. Check Active Connections table
2. Look for unusual remote addresses
3. Check Top Ports for anomalies
4. Cross-reference with process PIDs
```

### 3. Track System Health
```
1. View CPU Per Core metrics
2. Check overview cards for trends
3. Monitor bandwidth usage
4. Identify bottlenecks
```

## 🛠️ API Reference

### REST Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/monitoring/{server_id}/snapshot` | Get monitoring data |
| POST | `/monitoring/{server_id}/process/{pid}/terminate` | Terminate process |
| POST | `/monitoring/{server_id}/process/{pid}/kill` | Kill process |
| POST | `/monitoring/{server_id}/process/{pid}/suspend` | Suspend process |

### WebSocket
```javascript
ws://localhost:8000/ws/monitoring/{server_id}?token={jwt_token}
```

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `monitoring-feature.md` | Complete feature documentation |
| `monitoring-quickstart.md` | Quick start guide |
| `monitoring-implementation-summary.md` | Implementation details |

## 🚦 Getting Started

### 1. Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### 2. Start Frontend
```bash
cd frontend
npm run dev
```

### 3. Access Monitoring
```
http://localhost:3000/monitoring
```

## 🎓 Tips & Tricks

💡 **Pro Tip 1**: Sort processes by CPU% to quickly find resource hogs

💡 **Pro Tip 2**: Use "Suspend" instead of "Kill" when possible

💡 **Pro Tip 3**: Check Top Ports to identify unusual network activity

💡 **Pro Tip 4**: Monitor CPU Per Core to identify single-threaded bottlenecks

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| WebSocket won't connect | Check backend is running, verify token |
| Can't kill process | Run backend with admin/sudo privileges |
| No data showing | Select server from dropdown |
| High CPU usage | Increase WebSocket interval |

## 🔮 Future Enhancements

- [ ] Historical data charts
- [ ] Configurable alerts
- [ ] Process filtering/search
- [ ] Network topology visualization
- [ ] Data export (CSV/JSON)
- [ ] Custom dashboards
- [ ] Multi-server comparison

## 🎉 Success Metrics

✅ Real-time process monitoring  
✅ Network connection tracking  
✅ Process control actions  
✅ CPU per-core monitoring  
✅ Bandwidth analytics  
✅ Port usage statistics  
✅ WebSocket live updates  
✅ Professional UI/UX  

## 📞 Support

Need help? Check:
1. 📖 Documentation in `docs/`
2. 🔍 Backend logs: `backend/backend.log`
3. 🌐 Browser console for errors
4. 🔧 Verify dependencies installed

---

<div align="center">

**Built with ❤️ for The Gauntlet**

[Dashboard](../README.md) • [Documentation](monitoring-feature.md) • [Quick Start](monitoring-quickstart.md)

</div>
