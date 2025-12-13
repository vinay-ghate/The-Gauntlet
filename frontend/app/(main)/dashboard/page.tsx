"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
    Box,
    Card,
    CardContent,
    Typography,
    LinearProgress,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Paper,
    CircularProgress
} from "@mui/material";
import Memory from "@mui/icons-material/Memory";
import Storage from "@mui/icons-material/Storage";
import Speed from "@mui/icons-material/Speed";
import Refresh from "@mui/icons-material/Refresh";
import Terminal from "@mui/icons-material/Terminal";

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
}

interface Metrics {
    // Basic metrics
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;

    // Detailed info
    cpu_count: number;
    cpu_count_logical: number;
    total_memory_gb: number;
    available_memory_gb: number;
    total_disk_gb: number;
    free_disk_gb: number;
    uptime: string;

    // Network
    network_sent_mb: number;
    network_recv_mb: number;

    // Top processes
    top_processes: Process[];
}

const MetricRow = ({ label, value, icon, color }: { label: string, value: number, icon: React.ReactNode, color: "primary" | "secondary" | "error" | "info" | "success" | "warning" }) => (
    <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icon}
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold">
                {value}%
            </Typography>
        </Box>
        <LinearProgress
            variant="determinate"
            value={value}
            color={color}
            sx={{ height: 8, borderRadius: 1 }}
        />
    </Box>
);

function ServerCard({ server }: { server: Server }) {
    const [metrics, setMetrics] = useState<Metrics | null>(null);
    const [commandDialogOpen, setCommandDialogOpen] = useState(false);
    const [command, setCommand] = useState("");
    const [commandHistory, setCommandHistory] = useState<Array<{ command: string, output: string, timestamp: string }>>([]);
    const [commandLoading, setCommandLoading] = useState(false);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetchWithAuth(`/metrics/${server.id}/snapshot`);
                if (res.ok) {
                    const data = await res.json();
                    setMetrics(data);
                }
            } catch (error) {
                console.error("Failed to fetch metrics", error);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 2000);
        return () => clearInterval(interval);
    }, [server.id]);

    const handleExecuteCommand = async () => {
        if (!command.trim()) return;

        const timestamp = new Date().toLocaleTimeString();
        setCommandLoading(true);

        try {
            const res = await fetchWithAuth(`/commands/${server.id}/execute`, {
                method: "POST",
                body: JSON.stringify({ command: command.trim() }),
            });

            console.log("Command response status:", res.status);
            const data = await res.json();
            console.log("Command response data:", data);

            const output = data.output || data.error || data.detail || "Command executed (no output)";

            setCommandHistory(prev => [...prev, {
                command: command.trim(),
                output: output,
                timestamp: timestamp
            }]);
            setCommand("");
        } catch (error) {
            console.error("Command execution error:", error);
            setCommandHistory(prev => [...prev, {
                command: command.trim(),
                output: `Error: ${error}`,
                timestamp: timestamp
            }]);
        } finally {
            setCommandLoading(false);
        }
    };

    const handleClearTerminal = () => {
        setCommandHistory([]);
    };

    return (
        <>
            <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                }
            }}>
                <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 3 }}>
                        <Box>
                            <Typography variant="h6" component="div" fontWeight="bold">
                                {server.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                {server.host}
                            </Typography>
                        </Box>
                        <Chip
                            label="Online"
                            color="success"
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>

                    {metrics ? (
                        <Box>
                            {/* Basic Metrics */}
                            <MetricRow
                                label="CPU"
                                value={metrics.cpu_usage}
                                icon={<Speed fontSize="small" color="primary" />}
                                color="primary"
                            />
                            <MetricRow
                                label="RAM"
                                value={metrics.memory_usage}
                                icon={<Memory fontSize="small" color="secondary" />}
                                color="secondary"
                            />
                            <MetricRow
                                label="Disk"
                                value={metrics.disk_usage}
                                icon={<Storage fontSize="small" color="warning" />}
                                color="warning"
                            />

                            {/* System Info */}
                            <Box sx={{ mt: 3, mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                    SYSTEM INFO
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    CPU Cores: {metrics.cpu_count} ({metrics.cpu_count_logical} logical)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Uptime: {metrics.uptime}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    RAM: {metrics.available_memory_gb}GB / {metrics.total_memory_gb}GB
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Disk: {metrics.free_disk_gb}GB / {metrics.total_disk_gb}GB
                                </Typography>
                            </Box>

                            {/* Network Stats */}
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                    NETWORK
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                                <Typography variant="caption" color="text.secondary">
                                    ↑ Sent: {metrics.network_sent_mb} MB
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    ↓ Recv: {metrics.network_recv_mb} MB
                                </Typography>
                            </Box>

                            {/* Top Processes */}
                            {metrics.top_processes && metrics.top_processes.length > 0 && (
                                <>
                                    <Box sx={{ mt: 2, mb: 1 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                            TOP PROCESSES
                                        </Typography>
                                    </Box>
                                    <Box sx={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {metrics.top_processes.map((proc, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    py: 0.5,
                                                    borderBottom: idx < metrics.top_processes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                                                }}
                                            >
                                                <Typography variant="caption" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {proc.name}
                                                </Typography>
                                                <Typography variant="caption" color="primary.main" sx={{ ml: 1, minWidth: '45px', textAlign: 'right' }}>
                                                    {proc.cpu}%
                                                </Typography>
                                                <Typography variant="caption" color="secondary.main" sx={{ ml: 1, minWidth: '45px', textAlign: 'right' }}>
                                                    {proc.memory}%
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            )}

                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    onClick={() => setCommandDialogOpen(true)}
                                    startIcon={<Terminal />}
                                >
                                    Terminal
                                </Button>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ width: '100%' }}>
                            <LinearProgress />
                            <Typography variant="caption" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                                Connecting to agent...
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            <Dialog
                open={commandDialogOpen}
                onClose={() => setCommandDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        bgcolor: '#1e1e1e',
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle sx={{
                    bgcolor: '#2d2d2d',
                    color: '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #3d3d3d'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Terminal />
                        <Typography variant="h6">Terminal - {server.name}</Typography>
                    </Box>
                    <Button
                        size="small"
                        onClick={handleClearTerminal}
                        sx={{ color: '#888' }}
                    >
                        Clear
                    </Button>
                </DialogTitle>
                <DialogContent sx={{ p: 0, bgcolor: '#1e1e1e' }}>
                    <Box sx={{
                        p: 2,
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                        fontSize: '0.875rem',
                        minHeight: '400px',
                        maxHeight: '500px',
                        overflowY: 'auto',
                        color: '#d4d4d4'
                    }}>
                        {/* Terminal Header */}
                        <Box sx={{ mb: 2, color: '#6a9955' }}>
                            <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
                                # Connected to {server.host}
                            </Typography>
                            <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
                                # Allowed commands: ls, pwd, whoami, date, uptime, df, free, ps
                            </Typography>
                            <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit', mb: 1 }}>
                                # Type a command and press Enter
                            </Typography>
                        </Box>

                        {/* Command History */}
                        {commandHistory.map((entry, idx) => (
                            <Box key={idx} sx={{ mb: 2 }}>
                                <Typography sx={{
                                    fontFamily: 'inherit',
                                    fontSize: 'inherit',
                                    color: '#569cd6',
                                    mb: 0.5
                                }}>
                                    <span style={{ color: '#4ec9b0' }}>user@{server.host}</span>
                                    <span style={{ color: '#d4d4d4' }}>:</span>
                                    <span style={{ color: '#c586c0' }}>~</span>
                                    <span style={{ color: '#d4d4d4' }}>$ </span>
                                    <span style={{ color: '#ce9178' }}>{entry.command}</span>
                                </Typography>
                                <Typography sx={{
                                    fontFamily: 'inherit',
                                    fontSize: 'inherit',
                                    whiteSpace: 'pre-wrap',
                                    color: '#d4d4d4',
                                    pl: 2
                                }}>
                                    {entry.output}
                                </Typography>
                            </Box>
                        ))}

                        {/* Loading Indicator */}
                        {commandLoading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#888' }}>
                                <CircularProgress size={16} sx={{ color: '#888' }} />
                                <Typography sx={{ fontFamily: 'inherit', fontSize: 'inherit' }}>
                                    Executing...
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Command Input */}
                    <Box sx={{
                        p: 2,
                        bgcolor: '#252526',
                        borderTop: '1px solid #3d3d3d',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}>
                        <Typography sx={{
                            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                            fontSize: '0.875rem',
                            color: '#4ec9b0'
                        }}>
                            $
                        </Typography>
                        <TextField
                            fullWidth
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            placeholder="Enter command..."
                            disabled={commandLoading}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleExecuteCommand();
                                }
                            }}
                            variant="standard"
                            InputProps={{
                                disableUnderline: true,
                                sx: {
                                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                                    fontSize: '0.875rem',
                                    color: '#d4d4d4',
                                    '& input': {
                                        padding: 0
                                    }
                                }
                            }}
                            sx={{
                                '& .MuiInput-root': {
                                    '&:before, &:after': {
                                        display: 'none'
                                    }
                                }
                            }}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function Dashboard() {
    const [servers, setServers] = useState<Server[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadServers = async () => {
            try {
                console.log("Fetching servers...");
                const res = await fetchWithAuth("/servers/");
                console.log("Response status:", res.status);

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();
                console.log("Servers data:", data);
                setServers(data);
                setError(null);
            } catch (err) {
                console.error("Error loading servers:", err);
                setError(err instanceof Error ? err.message : "Failed to load servers");
            } finally {
                setLoading(false);
            }
        };

        loadServers();
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
                        System Overview
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Real-time infrastructure monitoring
                    </Typography>
                </Box>
                <IconButton sx={{ bgcolor: 'background.paper' }}>
                    <Refresh />
                </IconButton>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 5 }}>
                {loading ? (
                    <Box sx={{ gridColumn: '1/-1', p: 4, textAlign: 'center' }}>
                        <CircularProgress />
                        <Typography color="text.secondary" sx={{ mt: 2 }}>Loading servers...</Typography>
                    </Box>
                ) : error ? (
                    <Box sx={{ gridColumn: '1/-1', p: 4, textAlign: 'center' }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                ) : servers.length > 0 ? (
                    servers.map((server) => (
                        <Box key={server.id}>
                            <ServerCard server={server} />
                        </Box>
                    ))
                ) : (
                    <Box sx={{ gridColumn: '1/-1', p: 4, textAlign: 'center' }}>
                        <Typography color="text.secondary">No servers found</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
