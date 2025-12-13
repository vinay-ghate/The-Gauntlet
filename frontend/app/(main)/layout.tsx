"use client";

import Sidebar from "@/components/Sidebar";
import { Box } from "@mui/material";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0f172a' }}>
            <Sidebar />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    overflow: 'auto',
                    height: '100vh'
                }}
            >
                <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
