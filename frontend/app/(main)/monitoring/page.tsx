"use client";

import { useEffect, useState, useRef } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
    LinearProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Alert
} from "@mui/material";
import Refresh from "@mui/icons-material/Refresh";
import Stop from "@mui/icons-material/Stop";
import Pause from "@mui/icons-material/Pause";
import Delete from "@mui/icons-material/Delete";
import NetworkCheck from "@mui/icons-material/NetworkCheck";
import Router from "@mui/icons-material/Router";
import Speed from "@mui/icons-material/Speed";
import Memory from "@mui/icons-material/Memory";
import Storage from "@mui/icons-material/Storage";
import TrendingUp from "@mui/icons-material/TrendingUp";
import TrendingDown from "@mui/icons-material/TrendingDown";

interface Server {
    id: string;
    name: string;
    host: string;
    user: string;
}

interface Process {
    pid: number;
    name: string;
    cpu: number;
    memory: number;
    status: string;
    username: string;
}

interface NetworkConnection {
    local_address: string;
    remote_address: string;
    status: string;
    pid: number;
}

interface NetworkStats {
    bytes_sent: number;
    bytes_recv: number;
    packets_sent: number;
    packets_recv: number;
    errin: number;
    errout: number;
}

interface MonitoringData {
    processes: Process[];
    network_connections: NetworkConnection[];
    network_stats: NetworkStats;
    cpu_per_core: number[];
    port_usage: { [key: string]: number };
}

const MetricCard = ({
    title,
    value,
    icon,
    color,
    trend
}: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    trend?: number;
}) => (
    <Card sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`
    }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
                        {title}
                    </Typography>
                    <Typography variant="h4" sx={{ mt: 1, fontWeight: 'bold', color }}>
                        {value}
                    </Typography>
                    {trend !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
                            {trend > 0 ? (
                                <TrendingUp fontSize="small" color="success" />
                            ) : (
                                <TrendingDown fontSize="small" color="error" />
                            )}
                            <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                                {Math.abs(trend)}%
                            </Typography>
                        </Box>
                    )}
                </Box>
                <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: `${color}20`,
                    color
                }}>
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

export default function MonitoringPage() {
    const [servers, setServers] = useState<Server[]>([]);
    const [selectedServer, setSelectedServer] = useState<string>("");
    const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; action: string; pid?: number }>({ open: false, action: "" });
    const wsRef = useRef<WebSocket | null>(null);

    // Load servers
    useEffect(() => {
        const loadServers = async () => {
            try {
                const res = await fetchWithAuth("/servers/");
                if (res.ok) {
                    const data = await res.json();
                    setServers(data);
                    if (data.length > 0) {
                        setSelectedServer(data[0].id);
                    }
                }
            } catch (err) {
                console.error("Error loading servers:", err);
                setError("Failed to load servers");
            } finally {
                setLoading(false);
            }
        };
        loadServers();
    }, []);

    // WebSocket connection for real-time monitoring
    useEffect(() => {
        if (!selectedServer) return;

        const connectWebSocket = () => {
            const token = localStorage.getItem("token");
            // Get backend URL from environment or default to localhost
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
            // Convert http/https to ws/wss
            const wsProtocol = backendUrl.startsWith('https') ? 'wss' : 'ws';
            const wsHost = backendUrl.replace(/^https?:\/\//, '');
            const wsUrl = `${wsProtocol}://${wsHost}/ws/monitoring/${selectedServer}?token=${token}`;

            const ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                console.log("WebSocket connected for monitoring");
                setError(null);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setMonitoringData(data);
                } catch (err) {
                    console.error("Error parsing WebSocket data:", err);
                }
            };

            ws.onerror = (error) => {
                console.error("WebSocket error:", error);
                setError("WebSocket connection error");
            };

            ws.onclose = () => {
                console.log("WebSocket disconnected, reconnecting...");
                setTimeout(connectWebSocket, 3000);
            };

            wsRef.current = ws;
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [selectedServer]);

    const handleProcessAction = async (action: string, pid: number) => {
        try {
            const res = await fetchWithAuth(`/monitoring/${selectedServer}/process/${pid}/${action}`, {
                method: "POST",
            });

            if (res.ok) {
                setConfirmDialog({ open: false, action: "" });
            } else {
                const data = await res.json();
                setError(data.detail || `Failed to ${action} process`);
            }
        } catch (err) {
            console.error(`Error ${action} process:`, err);
            setError(`Failed to ${action} process`);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'running': return 'success';
            case 'sleeping': return 'info';
            case 'stopped': return 'warning';
            case 'zombie': return 'error';
            default: return 'default';
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    const currentServer = servers.find(s => s.id === selectedServer);

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        Advanced Monitoring
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Real-time process and network observability suite
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Server</InputLabel>
                        <Select
                            value={selectedServer}
                            label="Server"
                            onChange={(e) => setSelectedServer(e.target.value)}
                        >
                            {servers.map((server) => (
                                <MenuItem key={server.id} value={server.id}>
                                    {server.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <IconButton sx={{ bgcolor: 'background.paper' }}>
                        <Refresh />
                    </IconButton>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {monitoringData ? (
                <>
                    {/* Metrics Overview */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
                        <MetricCard
                            title="Active Processes"
                            value={monitoringData.processes.length}
                            icon={<Memory />}
                            color="#9c27b0"
                        />
                        <MetricCard
                            title="Network Connections"
                            value={monitoringData.network_connections.length}
                            icon={<NetworkCheck />}
                            color="#2196f3"
                        />
                        <MetricCard
                            title="Data Sent"
                            value={`${(monitoringData.network_stats.bytes_sent / (1024 ** 2)).toFixed(2)} MB`}
                            icon={<TrendingUp />}
                            color="#4caf50"
                        />
                        <MetricCard
                            title="Data Received"
                            value={`${(monitoringData.network_stats.bytes_recv / (1024 ** 2)).toFixed(2)} MB`}
                            icon={<TrendingDown />}
                            color="#ff9800"
                        />
                    </Box>

                    {/* CPU Per Core */}
                    {monitoringData.cpu_per_core && monitoringData.cpu_per_core.length > 0 && (
                        <Card sx={{ mb: 4 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    CPU Usage Per Core
                                </Typography>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mt: 1 }}>
                                    {monitoringData.cpu_per_core.map((usage, idx) => (
                                        <Box key={idx}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Core {idx}
                                                </Typography>
                                                <Typography variant="caption" fontWeight="bold">
                                                    {usage.toFixed(1)}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress
                                                variant="determinate"
                                                value={usage}
                                                color={usage > 80 ? "error" : usage > 60 ? "warning" : "primary"}
                                                sx={{ height: 8, borderRadius: 1 }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    )}

                    {/* Process Explorer */}
                    <Card sx={{ mb: 4 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Live Process Explorer
                                </Typography>
                                <Chip
                                    label={`${monitoringData.processes.length} Processes`}
                                    color="primary"
                                    size="small"
                                />
                            </Box>
                            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>PID</strong></TableCell>
                                            <TableCell><strong>Name</strong></TableCell>
                                            <TableCell><strong>User</strong></TableCell>
                                            <TableCell><strong>Status</strong></TableCell>
                                            <TableCell align="right"><strong>CPU %</strong></TableCell>
                                            <TableCell align="right"><strong>Memory %</strong></TableCell>
                                            <TableCell align="center"><strong>Actions</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {monitoringData.processes.map((proc) => (
                                            <TableRow key={proc.pid} hover>
                                                <TableCell sx={{ fontFamily: 'monospace' }}>{proc.pid}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{
                                                        maxWidth: 200,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {proc.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                                                    {proc.username}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={proc.status}
                                                        color={getStatusColor(proc.status) as any}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography
                                                        variant="body2"
                                                        color={proc.cpu > 50 ? 'error' : 'primary'}
                                                        fontWeight={proc.cpu > 50 ? 'bold' : 'normal'}
                                                    >
                                                        {proc.cpu.toFixed(1)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Typography
                                                        variant="body2"
                                                        color={proc.memory > 50 ? 'error' : 'secondary'}
                                                        fontWeight={proc.memory > 50 ? 'bold' : 'normal'}
                                                    >
                                                        {proc.memory.toFixed(1)}%
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                        <Tooltip title="Suspend">
                                                            <IconButton
                                                                size="small"
                                                                color="warning"
                                                                onClick={() => setConfirmDialog({ open: true, action: 'suspend', pid: proc.pid })}
                                                            >
                                                                <Pause fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Terminate">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => setConfirmDialog({ open: true, action: 'terminate', pid: proc.pid })}
                                                            >
                                                                <Stop fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Kill">
                                                            <IconButton
                                                                size="small"
                                                                sx={{ color: '#d32f2f' }}
                                                                onClick={() => setConfirmDialog({ open: true, action: 'kill', pid: proc.pid })}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>

                    {/* Network Monitoring */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
                        {/* Network Connections */}
                        <Box>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Typography variant="h6" fontWeight="bold">
                                            Active Network Connections
                                        </Typography>
                                        <Chip
                                            label={`${monitoringData.network_connections.length} Active`}
                                            color="info"
                                            size="small"
                                        />
                                    </Box>
                                    <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                                        <Table stickyHeader size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Local Address</strong></TableCell>
                                                    <TableCell><strong>Remote Address</strong></TableCell>
                                                    <TableCell><strong>Status</strong></TableCell>
                                                    <TableCell><strong>PID</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {monitoringData.network_connections.slice(0, 50).map((conn, idx) => (
                                                    <TableRow key={idx} hover>
                                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                            {conn.local_address}
                                                        </TableCell>
                                                        <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                                            {conn.remote_address}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={conn.status}
                                                                size="small"
                                                                variant="outlined"
                                                                color={conn.status === 'ESTABLISHED' ? 'success' : 'default'}
                                                            />
                                                        </TableCell>
                                                        <TableCell sx={{ fontFamily: 'monospace' }}>
                                                            {conn.pid || '-'}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Box>

                        {/* Top Ports */}
                        <Box>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Top Ports by Usage
                                    </Typography>
                                    <Box sx={{ mt: 2 }}>
                                        {Object.entries(monitoringData.port_usage || {})
                                            .sort(([, a], [, b]) => b - a)
                                            .slice(0, 10)
                                            .map(([port, count]) => (
                                                <Box key={port} sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                                            Port {port}
                                                        </Typography>
                                                        <Typography variant="body2" fontWeight="bold">
                                                            {count} connections
                                                        </Typography>
                                                    </Box>
                                                    <LinearProgress
                                                        variant="determinate"
                                                        value={Math.min((count / Math.max(...Object.values(monitoringData.port_usage || {}))) * 100, 100)}
                                                        sx={{ height: 6, borderRadius: 1 }}
                                                    />
                                                </Box>
                                            ))}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>
                    </Box>
                </>
            ) : (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress />
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                        Connecting to monitoring service...
                    </Typography>
                </Box>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, action: "" })}
            >
                <DialogTitle>
                    Confirm Process {confirmDialog.action}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {confirmDialog.action} process {confirmDialog.pid}?
                        This action may affect system stability.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, action: "" })}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => confirmDialog.pid && handleProcessAction(confirmDialog.action, confirmDialog.pid)}
                        color="error"
                        variant="contained"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
