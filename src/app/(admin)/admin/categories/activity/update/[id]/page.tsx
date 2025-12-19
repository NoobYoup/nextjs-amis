'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Box, Container, Typography, TextField, Button, Paper, Stack, Alert, CircularProgress } from '@mui/material';

export default function UpdateCategoryPage() {
    const router = useRouter();
    const params = useParams();
    const categoryId = params?.id as string;
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadCategory = async () => {
            try {
                const res = await fetch(`/api/admin/categories/activity/${categoryId}`);
                if (!res.ok) throw new Error('Lỗi tải danh mục');
                const data = await res.json();
                setName(data.name);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || 'Lỗi tải dữ liệu');
                setLoading(false);
            }
        };

        if (categoryId) {
            loadCategory();
        }
    }, [categoryId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('Vui lòng nhập tên danh mục');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`/api/admin/categories/activity/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name.trim() }),
            });

            if (!res.ok) {
                const err = await res.json();
                setError(err.error || 'Lỗi cập nhật danh mục');
                return;
            }

            router.push('/admin/categories/activity');
        } catch (err) {
            setError((err as Error).message || 'Lỗi không mong muốn');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Cập Nhật Danh Mục
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Chỉnh sửa thông tin danh mục hoạt động
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
                                    disabled={submitting}
                                    sx={{
                                        bgcolor: 'var(--primary-color)',
                                        '&:hover': { bgcolor: 'var(--accent-color)' },
                                    }}
                                >
                                    {submitting ? 'Đang cập nhật...' : 'Cập nhật danh mục'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push('/admin/categories/activity')}
                                    disabled={submitting}
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
