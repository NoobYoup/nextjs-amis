'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, TextField, Button, Paper, Stack, Alert } from '@mui/material';

export default function AddCategoryPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Vui lòng nhập tên danh mục');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/admin/categories/activity', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!res.ok) {
                const err = await res.json();

                setError(err.error || err.details || 'Lỗi thêm danh mục');
                return;
            }

            router.push('/admin/categories/activity');
        } catch (err) {
            setError((err as Error).message || 'Lỗi không mong muốn');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Thêm Danh Mục Mới
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Điền thông tin để thêm danh mục hoạt động mới
                    </Typography>
                </Box>

                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Tên danh mục"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Ví dụ: Hoạt động ngoại khóa"
                                autoFocus
                            />

                            {/* Buttons */}
                            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                    sx={{
                                        bgcolor: 'var(--primary-color)',
                                        '&:hover': { bgcolor: 'var(--accent-color)' },
                                    }}
                                >
                                    {loading ? 'Đang thêm...' : 'Thêm danh mục'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push('/admin/categories/activity')}
                                    disabled={loading}
                                >
                                    Hủy
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}
