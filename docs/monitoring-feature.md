# Advanced Monitoring Feature

## Overview
The Advanced Monitoring feature provides a comprehensive observability suite for real-time system monitoring, process management, and network analytics.

## Features

### 1. Live Process Explorer
- **Real-time Process Monitoring**: View all running processes with live updates via WebSocket
- **Detailed Process Information**:
  - Process ID (PID)
  - Process Name
  - Username
  - Status (Running, Sleeping, Stopped, Zombie)
  - CPU Usage (%)
  - Memory Usage (%)
  
- **Process Control Actions**:
  - **Suspend**: Pause a process temporarily
  - **Terminate**: Gracefully stop a process
  - **Kill**: Forcefully terminate a process
  
- **Interactive UI**:
  - Sortable table with sticky headers
  - Color-coded status indicators
  - Highlighted high-resource processes
  - Confirmation dialogs for destructive actions

### 2. Network Monitoring Dashboard

#### Active Connections
- Real-time view of all network connections
- Connection details:
  - Local address and port
  - Remote address and port
  - Connection status (ESTABLISHED, LISTEN, etc.)
  - Associated Process ID
  
#### Bandwidth Tracking
- Live network I/O statistics:
  - Bytes sent/received
  - Packets sent/received
  - Network errors (in/out)
  
#### Port Analytics
- Top ports by connection count
- Visual representation with progress bars
- Identify high-traffic ports instantly

### 3. System Metrics

#### CPU Per-Core Monitoring
- Individual CPU core usage tracking
- Visual progress bars for each core
- Color-coded alerts (green/yellow/red)
- Real-time updates

#### Overview Cards
- Active process count
- Network connection count
- Total data sent
- Total data received

## Technical Implementation

### Backend

#### Services
1. **MonitoringService** (`app/services/monitoring_service.py`)
   - `get_detailed_processes()`: Fetch process information
   - `get_network_connections()`: Retrieve active network connections
   - `get_network_stats()`: Get network I/O statistics
   - `get_cpu_per_core()`: CPU usage per core
   - `get_port_usage()`: Port usage analytics
   - `terminate_process()`: Gracefully terminate a process
   - `kill_process()`: Forcefully kill a process
   - `suspend_process()`: Suspend a process
   - `resume_process()`: Resume a suspended process

#### API Endpoints
- `GET /monitoring/{server_id}/snapshot`: Get monitoring snapshot
- `POST /monitoring/{server_id}/process/{pid}/terminate`: Terminate process
- `POST /monitoring/{server_id}/process/{pid}/kill`: Kill process
- `POST /monitoring/{server_id}/process/{pid}/suspend`: Suspend process
- `POST /monitoring/{server_id}/process/{pid}/resume`: Resume process

#### WebSocket
- `WS /ws/monitoring/{server_id}`: Real-time monitoring data stream
  - Updates every 2 seconds
  - Sends comprehensive monitoring snapshot
  - Auto-reconnects on disconnect

### Frontend

#### Components
1. **MonitoringPage** (`app/(main)/monitoring/page.tsx`)
   - Main monitoring dashboard
   - Server selection dropdown
   - Real-time WebSocket connection
   - Process explorer table
   - Network monitoring cards
   - CPU per-core visualization

#### Features
- **Material-UI Components**: Professional, responsive design
- **Real-time Updates**: WebSocket-based live data
- **Interactive Tables**: Sortable, scrollable, sticky headers
- **Confirmation Dialogs**: Prevent accidental process termination
- **Error Handling**: User-friendly error messages
- **Loading States**: Smooth loading indicators

## Usage

### Accessing the Monitoring Page
1. Navigate to the application
2. Click on "Monitoring" in the sidebar
3. Select a server from the dropdown
4. View real-time monitoring data

### Managing Processes
1. Locate the process in the Process Explorer table
2. Click the appropriate action button:
   - **Pause icon**: Suspend the process
   - **Stop icon**: Terminate the process
   - **Delete icon**: Kill the process
3. Confirm the action in the dialog

### Viewing Network Activity
1. Scroll to the Network Monitoring section
2. View active connections in the table
3. Check top ports in the side panel
4. Monitor bandwidth usage in the overview cards

## Security Considerations

### Authentication
- All endpoints require authentication via JWT token
- WebSocket connections validate token via query parameter

### Process Control
- Process control actions require elevated permissions
- Confirmation dialogs prevent accidental actions
- Access denied errors handled gracefully

### Rate Limiting
- WebSocket updates throttled to 2-second intervals
- Process list limited to top 100 processes
- Network connections limited to 100 entries

## Performance Optimization

### Backend
- Efficient psutil usage with minimal intervals
- Limited result sets to prevent memory issues
- Async WebSocket for non-blocking updates
- Error handling to prevent service crashes

### Frontend
- Virtualized tables for large datasets
- Debounced WebSocket reconnection
- Optimized re-renders with React hooks
- Lazy loading of components

## Future Enhancements

### Planned Features
1. **Process Filtering**: Search and filter processes
2. **Historical Data**: Charts showing trends over time
3. **Alerts**: Configurable alerts for high resource usage
4. **Process Details**: Detailed view with threads, files, etc.
5. **Network Graphs**: Visual network topology
6. **Export Data**: Download monitoring data as CSV/JSON
7. **Custom Dashboards**: User-configurable layouts
8. **Multi-Server View**: Compare metrics across servers

### Performance Improvements
1. **Data Compression**: Compress WebSocket payloads
2. **Incremental Updates**: Send only changed data
3. **Caching**: Cache static process information
4. **Batch Operations**: Bulk process control actions

## Troubleshooting

### WebSocket Connection Issues
- **Problem**: WebSocket fails to connect
- **Solution**: Check backend is running, verify token is valid

### Process Control Fails
- **Problem**: Cannot terminate/kill process
- **Solution**: Check user permissions, some system processes are protected

### High CPU Usage
- **Problem**: Monitoring causes high CPU usage
- **Solution**: Increase WebSocket update interval, reduce process limit

### Missing Data
- **Problem**: Some metrics not showing
- **Solution**: Ensure psutil has necessary permissions, check logs

## Dependencies

### Backend
- `psutil`: System and process utilities
- `fastapi`: Web framework
- `websockets`: WebSocket support

### Frontend
- `@mui/material`: UI components
- `next.js`: React framework
- Native WebSocket API

## API Reference

### REST Endpoints

#### Get Monitoring Snapshot
```http
GET /monitoring/{server_id}/snapshot
Authorization: Bearer {token}
```

**Response:**
```json
{
  "processes": [...],
  "network_connections": [...],
  "network_stats": {...},
  "cpu_per_core": [...],
  "port_usage": {...}
}
```

#### Process Control
```http
POST /monitoring/{server_id}/process/{pid}/{action}
Authorization: Bearer {token}
```

**Actions:** `terminate`, `kill`, `suspend`, `resume`

**Response:**
```json
{
  "status": "success",
  "message": "Process {pid} {action}ed"
}
```

### WebSocket

#### Monitoring Stream
```
ws://localhost:8000/ws/monitoring/{server_id}?token={token}
```

**Message Format:**
```json
{
  "processes": [...],
  "network_connections": [...],
  "network_stats": {...},
  "cpu_per_core": [...],
  "port_usage": {...}
}
```

## Conclusion

The Advanced Monitoring feature transforms basic system metrics into a comprehensive observability suite, providing administrators with powerful tools for real-time process and network management. With its intuitive interface and robust backend, it enables efficient system monitoring and control.
