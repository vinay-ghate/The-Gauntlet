"use client";

import { useState, useRef, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Avatar,
    Fade,
    CircularProgress
} from "@mui/material";
import Send from "@mui/icons-material/Send";
import SmartToy from "@mui/icons-material/SmartToy";
import Person from "@mui/icons-material/Person";

interface Message {
    role: "user" | "bot";
    content: string;
}

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "bot", content: "Hello! I am your system operations agent. How can I assist you today?" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetchWithAuth("/agent/chat", {
                method: "POST",
                body: JSON.stringify({ message: userMsg.content, server_id: "1" }),
            });

            const data = await res.json();
            setMessages((prev) => [...prev, { role: "bot", content: data.response }]);
        } catch (error) {
            setMessages((prev) => [...prev, { role: "bot", content: "Error communicating with agent." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">AI Operations Agent</Typography>
                <Typography variant="body2" color="text.secondary">System Intelligence Interface</Typography>
            </Box>

            <Paper
                elevation={0}
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 4
                }}
            >
                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {messages.map((msg, idx) => (
                        <Fade in={true} key={idx} style={{ transitionDelay: '100ms' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                    gap: 2,
                                    maxWidth: '100%'
                                }}
                            >
                                {msg.role === 'bot' && (
                                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                        <SmartToy fontSize="small" />
                                    </Avatar>
                                )}

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        maxWidth: '70%',
                                        borderRadius: 3,
                                        borderTopLeftRadius: msg.role === 'bot' ? 4 : 24,
                                        borderTopRightRadius: msg.role === 'user' ? 4 : 24,
                                        bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(255, 255, 255, 0.05)',
                                        color: msg.role === 'user' ? 'white' : 'text.primary'
                                    }}
                                >
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {msg.content}
                                    </Typography>
                                </Paper>

                                {msg.role === 'user' && (
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        <Person fontSize="small" />
                                    </Avatar>
                                )}
                            </Box>
                        </Fade>
                    ))}

                    {loading && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                <SmartToy fontSize="small" />
                            </Avatar>
                            <Paper sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                                <CircularProgress size={20} color="secondary" />
                            </Paper>
                        </Box>
                    )}
                    <div ref={messagesEndRef} />
                </Box>

                <Box component="form" onSubmit={handleSend} sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <TextField
                        fullWidth
                        placeholder="Ask about system status..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={loading}
                        variant="outlined"
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    color="primary"
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                                    }}
                                >
                                    <Send fontSize="small" />
                                </IconButton>
                            ),
                            sx: { borderRadius: 4 }
                        }}
                    />
                </Box>
            </Paper>
        </Box>
    );
}
