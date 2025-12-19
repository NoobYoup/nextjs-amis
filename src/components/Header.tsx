'use client';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Link from 'next/link';
import Image from 'next/image';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import React, { useState } from 'react';

export default function Header() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('');

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        if (
            event.type === 'keydown' &&
            ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    const menuItems = [
        { text: 'Cải cách hành chính', path: '/reform' },
        { text: 'Dạy học online', path: '/online-learning' },
        { text: 'Văn bản', path: '/documents' },
        { text: 'Thủ tục', path: '/procedures' },
        { text: 'Tin tức', path: '/news' },
        { text: 'Liên hệ', path: '/contact' },
        { text: 'Hình ảnh', path: '/activities' },
        { text: 'Góp ý', path: '/feedback' },
    ];

    const drawerContent = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={item.path}
                            onClick={() => setActiveLink(item.path)}
                            sx={{
                                backgroundColor: activeLink === item.path ? 'rgba(0,0,0,0.04)' : 'transparent',
                            }}
                        >
                            <ListItemText
                                primary={item.text}
                                sx={{
                                    color: activeLink === item.path ? 'var(--primary-color)' : 'var(--secondary-color)',
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <AppBar position="sticky" color="inherit">
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ gap: 2 }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center' }} onClick={() => setActiveLink('/')}>
                        <Image src="/images/logo_amis.png" alt="AMIS" width={48} height={48} />
                        <Typography variant="h6" component="span" sx={{ ml: 1, color: '#183f6d', fontWeight: 700 }}>
                            AMIS
                        </Typography>
                    </Link>

                    <Box sx={{ flex: 1 }} />

                    <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
                        {menuItems.map((item) => (
                            <Button
                                key={item.text}
                                component={Link}
                                href={item.path}
                                variant="text"
                                onClick={() => setActiveLink(item.path)}
                                sx={{
                                    color: activeLink === item.path ? 'var(--primary-color)' : 'var(--secondary-color)',
                                    '&:hover': { color: 'var(--accent-color)' },
                                }}
                            >
                                {item.text}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
                        <IconButton color="inherit" onClick={toggleDrawer(true)}>
                            <MenuIcon />
                        </IconButton>
                        <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
                            {drawerContent}
                        </Drawer>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
