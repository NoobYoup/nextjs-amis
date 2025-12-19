'use client';

import { useState } from 'react';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    CircularProgress,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, School } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { toast } from 'react-toastify';

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!email || !password) {
                toast.error('Vui lòng nhập email và mật khẩu');
                setLoading(false);
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                toast.error('Email không hợp lệ');
                setLoading(false);
                return;
            }

            // Gọi NextAuth signIn
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false, // Không auto redirect, handle manual
            });

            if (!result?.ok) {
                toast.error('Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.');
                return;
            }

            // Demo success
            toast.success('Đăng nhập thành công!');
            router.push('/admin/activities');
            router.refresh();
        } catch (err) {
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',

                py: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    elevation={10}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                mb: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: '50%',
                                    background: 'var(--primary-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <School sx={{ fontSize: 32, color: 'white' }} />
                            </Box>
                        </Box>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                color: '#333',
                                mb: 1,
                            }}
                        >
                            Đăng Nhập Admin
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#666',
                            }}
                        >
                            Hệ thống quản lý trường học AMIS
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            // placeholder="admin@amis.edu.vn"
                            disabled={loading}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                },
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Mật khẩu"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            // placeholder="Amis@123"
                            disabled={loading}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={handleClickShowPassword} edge="end" disabled={loading}>
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                },
                            }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            type="submit"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                background: 'var(--primary-color)',
                                fontWeight: 600,
                                py: 1.5,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '1rem',
                                '&:hover': {
                                    background: 'var(--accent-color)',
                                },
                                '&:disabled': {
                                    background: '#ccc',
                                },
                            }}
                        >
                            {loading ? (
                                <>
                                    <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                                    Đang đăng nhập...
                                </>
                            ) : (
                                'Đăng Nhập'
                            )}
                        </Button>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                            © 2025 AMIS School Management System
                        </Typography>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
