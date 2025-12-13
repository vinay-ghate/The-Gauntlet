"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api";
import {
    Box,
    Button,
    Container,
    TextField,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    InputAdornment
} from "@mui/material";
import Person from "@mui/icons-material/Person";
import Lock from "@mui/icons-material/Lock";
import Shield from "@mui/icons-material/Shield";

export default function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log("Attempting login to:", `${API_URL}/auth/login`);
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });

            console.log("Response status:", res.status);

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ detail: "Invalid credentials" }));
                throw new Error(errorData.detail || "Invalid credentials");
            }

            const data = await res.json();
            console.log("Login successful, token received");
            localStorage.setItem("token", data.access_token);
            router.push("/dashboard");
        } catch (err: any) {
            console.error("Login error:", err);
            if (err.message === "Failed to fetch") {
                setError("Cannot connect to backend server at http://localhost:8000. Please ensure the backend is running.");
            } else {
                setError(err.message || "Failed to connect to server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                >
                    <Box sx={{
                        m: 1,
                        bgcolor: 'primary.main',
                        borderRadius: '50%',
                        p: 1.5,
                        display: 'flex'
                    }}>
                        <Shield sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
                        The Gauntlet
                    </Typography>

                    <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                        {error && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Username"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 3 }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                background: 'linear-gradient(45deg, #9c27b0 30%, #651fff 90%)',
                                boxShadow: '0 3px 5px 2px rgba(101, 31, 255, .3)',
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}
