'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    IconButton,
    Button,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Close as CloseIcon,
    ExpandLess,
    ExpandMore,
    Logout as LogoutIcon,
    Dashboard as DashboardIcon,
    EventNote as EventNoteIcon,
    AttachMoney as AttachMoneyIcon,
    AttachFile as AttachFileIcon,
    FirstPage as FirstPageIcon,
    LastPage as LastPageIcon,
    Settings as SettingsIcon,
    School as SchoolIcon,
    Receipt as ReceiptIcon,
    Notifications,
} from '@mui/icons-material';
import { SidebarMenuItem } from '@/types/sidebar';
import { signOut } from 'next-auth/react';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 80;

const menuItems: SidebarMenuItem[] = [
    {
        id: 'activities',
        label: 'Hoạt động',
        icon: EventNoteIcon,
        subItems: [
            { id: 'activities-list', label: 'Danh sách hoạt động', href: '/admin/activities' },
            { id: 'activities-category', label: 'Danh mục hoạt động', href: '/admin/categories/activity' },
        ],
    },
    {
        id: 'reforms',
        label: 'Cải cách hành chính',
        icon: SchoolIcon,
        subItems: [{ id: 'reforms-list', label: 'Danh sách thông tin công khai', href: '/admin/reforms' }],
    },
    {
        id: 'procedures',
        label: 'Thủ tục',
        icon: ReceiptIcon,
        subItems: [{ id: 'procedures-list', label: 'Danh sách thủ tục', href: '/admin/procedures' }],
    },
    {
        id: 'news',
        label: 'Tin tức',
        icon: Notifications,
        subItems: [{ id: 'news-list', label: 'Danh sách tin tức', href: '/admin/news' }],
    },
    {
        id: 'tuition',
        label: 'Học phí',
        icon: AttachMoneyIcon,
        subItems: [
            { id: 'tuition-grade', label: 'Theo Lớp', href: '/admin/tuition/grade' },
            { id: 'tuition-discount', label: 'Giảm Giá', href: '/admin/tuition/discount' },
            { id: 'tuition-schedule', label: 'Lịch Nộp', href: '/admin/tuition/schedule' },
            { id: 'tuition-fee', label: 'Khoản Phí', href: '/admin/tuition/fee' },
        ],
    },
    {
        id: 'documents',
        label: 'Văn bản',
        icon: AttachFileIcon,
        subItems: [
            { id: 'documents-list', label: 'Danh sách văn bản', href: '/admin/documents' },
            { id: 'documents-categories', label: 'Danh mục văn bản', href: '/admin/categories/document' },
        ],
    },
    {
        id: 'settings',
        label: 'Cài đặt',
        icon: SettingsIcon,
        subItems: [
            { id: 'settings-school', label: 'Thông tin trường', href: '/admin/settings/school' },
            { id: 'settings-password', label: 'Đổi mật khẩu', href: '/admin/settings/password' },
        ],
    },
];

const Sidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const toggleCollapse = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    const toggleSubMenu = useCallback((itemId: string) => {
        setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
    }, []);

    const toggleMobileDrawer = useCallback(() => {
        setMobileOpen(!mobileOpen);
    }, [mobileOpen]);

    const isMenuItemActive = useCallback(
        (href?: string) => {
            return href ? pathname === href || pathname.startsWith(href) : false;
        },
        [pathname],
    );

    const isMenuItemExactActive = useCallback(
        (href?: string) => {
            return href ? pathname === href : false;
        },
        [pathname],
    );

    const isMenuItemOrSubItemActive = useCallback(
        (item: SidebarMenuItem) => {
            if (item.href && isMenuItemActive(item.href)) return true;
            if (item.subItems) {
                return item.subItems.some((sub) => isMenuItemExactActive(sub.href));
            }
            return false;
        },
        [isMenuItemActive, isMenuItemExactActive],
    );

    // Auto-expand main item if a sub-item is active
    useEffect(() => {
        const activeMainItems = menuItems.filter(isMenuItemOrSubItemActive).map((item) => item.id);
        setExpandedItems(activeMainItems);
    }, [isMenuItemOrSubItemActive]);

    // Define handleLogout nếu onLogout không được pass từ parent
    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
        router.refresh();
    };

    const sidebarContent = (
        <Box
            sx={{
                width: isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
                height: '100vh',
                bgcolor: 'var(--secondary-color)',
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transition: 'width 0.3s ease',
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isOpen ? 'space-between' : 'center',
                    p: 2,
                    height: 64,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                }}
            >
                {isOpen && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <DashboardIcon sx={{ fontSize: 28 }} />
                        <Box component="span" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            Admin Dashboard
                        </Box>
                    </Box>
                )}
                <IconButton
                    onClick={toggleCollapse}
                    sx={{ color: '#fff' }}
                    aria-label={isOpen ? 'Thu gọn sidebar' : 'Mở rộng sidebar'}
                >
                    {isOpen ? <FirstPageIcon /> : <LastPageIcon />}
                </IconButton>
            </Box>

            {/* Menu List */}
            <List
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 1,
                    '&::-webkit-scrollbar': {
                        width: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        borderRadius: '4px',
                    },
                }}
            >
                {menuItems.map((item) => {
                    const isActive = isMenuItemOrSubItemActive(item);
                    const isExpanded = expandedItems.includes(item.id);

                    return (
                        <React.Fragment key={item.id}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() =>
                                        item.subItems ? toggleSubMenu(item.id) : item.href && router.push(item.href)
                                    }
                                    selected={isActive}
                                    sx={{
                                        borderRadius: 2,
                                        mb: 0.5,
                                        px: isOpen ? 2 : 1.5,
                                        py: 1.5,
                                        minHeight: 48,
                                        justifyContent: isOpen ? 'initial' : 'center',
                                        color: isActive ? 'var(--primary-color)' : '#fff',
                                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: isOpen ? 2 : 'auto',
                                            justifyContent: 'center',
                                            color: 'inherit',
                                        }}
                                    >
                                        <item.icon />
                                    </ListItemIcon>
                                    {isOpen && (
                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontSize: '0.95rem',
                                                fontWeight: 500,
                                            }}
                                        />
                                    )}
                                    {isOpen && item.subItems && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
                                </ListItemButton>
                            </ListItem>
                            {item.subItems && (
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding sx={{ pl: isOpen ? 4 : 0 }}>
                                        {item.subItems.map((sub) => (
                                            <ListItem key={sub.id} disablePadding>
                                                <ListItemButton
                                                    onClick={() => sub.href && router.push(sub.href)}
                                                    selected={isMenuItemExactActive(sub.href)}
                                                    sx={{
                                                        pl: isOpen ? 4 : 2,
                                                        py: 1,
                                                        borderRadius: 2,
                                                        color: isMenuItemExactActive(sub.href)
                                                            ? 'var(--primary-color)'
                                                            : '#ddd',
                                                        '&:hover': {
                                                            color: '#fff',
                                                        },
                                                    }}
                                                >
                                                    {isOpen && (
                                                        <ListItemText
                                                            primary={sub.label}
                                                            primaryTypographyProps={{
                                                                fontSize: '0.9rem',
                                                            }}
                                                        />
                                                    )}
                                                </ListItemButton>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Collapse>
                            )}
                        </React.Fragment>
                    );
                })}
            </List>

            {/* Footer */}
            <Box
                sx={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '12px 8px',
                }}
            >
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{
                        color: '#fff',
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        justifyContent: isOpen ? 'flex-start' : 'center',
                        '&:hover': {
                            borderColor: '#fff',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                    }}
                    aria-label="Đăng xuất"
                >
                    {isOpen && 'Đăng xuất'}
                </Button>
            </Box>
        </Box>
    );

    return (
        <>
            {/* Mobile Toggle Button */}
            {isMobile && (
                <IconButton
                    onClick={toggleMobileDrawer}
                    sx={{
                        position: 'fixed',
                        top: 16,
                        left: 16,
                        zIndex: 1300,
                        backgroundColor: 'var(--secondary-color)',
                        color: '#fff',
                        '&:hover': {
                            backgroundColor: 'var(--secondary-color)',
                            opacity: 0.9,
                        },
                    }}
                    aria-label="Mở menu"
                >
                    {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
                <>
                    <Box
                        sx={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            width: isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
                            height: '100vh',
                            transition: 'width 0.3s ease',
                            zIndex: 1200,
                        }}
                    >
                        {sidebarContent}
                    </Box>
                    {/* Spacer to prevent content overlap */}
                    <Box
                        sx={{
                            width: isOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
                            flexShrink: 0,
                            transition: 'width 0.3s ease',
                        }}
                    />
                </>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    anchor="left"
                    open={mobileOpen}
                    onClose={toggleMobileDrawer}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: SIDEBAR_WIDTH,
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>
            )}
        </>
    );
};

export default Sidebar;
