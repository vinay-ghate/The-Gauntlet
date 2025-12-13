"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Typography,
    Divider,
    useTheme,
    useMediaQuery
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BotIcon from "@mui/icons-material/SmartToy";
import MonitoringIcon from "@mui/icons-material/Insights";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Logout from "@mui/icons-material/Logout";

const drawerWidth = 240;
const collapsedWidth = 72;

const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
    { name: "Monitoring", href: "/monitoring", icon: <MonitoringIcon /> },
    { name: "AI Agent", href: "/chat", icon: <BotIcon /> },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const theme = useTheme();
    // We can add mobile responsiveness later if requested, simpler for MVP
    const [open, setOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem("token");
        router.push("/login");
    };

    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: open ? drawerWidth : collapsedWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: open ? drawerWidth : collapsedWidth,
                    boxSizing: 'border-box',
                    backgroundColor: 'background.default',
                    borderRight: '1px solid rgba(255, 255, 255, 0.12)',
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                    overflowX: 'hidden',
                },
            }}
        >
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: open ? 'space-between' : 'center',
                p: 2,
                height: 64
            }}>
                {open && (
                    <Typography variant="h6" noWrap component="div" sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #9c27b0, #651fff)',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Gauntlet
                    </Typography>
                )}
                <IconButton onClick={toggleDrawer} >
                    {open ? <ChevronLeft /> : <ChevronRight />}
                </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <List>
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <ListItem key={item.href} disablePadding sx={{ display: 'block' }}>
                            <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <ListItemButton
                                    sx={{
                                        minHeight: 48,
                                        justifyContent: open ? 'initial' : 'center',
                                        px: 2.5,
                                        mx: 1,
                                        borderRadius: 2,
                                        bgcolor: isActive ? 'rgba(156, 39, 176, 0.15)' : 'transparent',
                                        color: isActive ? 'primary.main' : 'text.primary',
                                        '&:hover': {
                                            bgcolor: isActive ? 'rgba(156, 39, 176, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                                        }
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: open ? 3 : 'auto',
                                            justifyContent: 'center',
                                            color: isActive ? 'primary.main' : 'inherit'
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.name} sx={{ opacity: open ? 1 : 0 }} />
                                </ListItemButton>
                            </Link>
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{ flexGrow: 1 }} />
            <Divider />

            <List>
                <ListItem disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                        onClick={handleLogout}
                        sx={{
                            minHeight: 48,
                            justifyContent: open ? 'initial' : 'center',
                            px: 2.5,
                        }}
                    >
                        <ListItemIcon
                            sx={{
                                minWidth: 0,
                                mr: open ? 3 : 'auto',
                                justifyContent: 'center',
                                color: 'error.main'
                            }}
                        >
                            <Logout />
                        </ListItemIcon>
                        <ListItemText primary="Logout" sx={{ opacity: open ? 1 : 0, color: 'error.main' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Drawer>
    );
}
