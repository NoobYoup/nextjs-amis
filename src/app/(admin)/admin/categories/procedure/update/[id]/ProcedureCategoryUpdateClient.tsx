'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, TextField, Button, Paper, Stack, Alert, CircularProgress } from '@mui/material';
import { api } from '@/lib/api';

interface Props { id: string; }

export default function ProcedureCategoryUpdateClient({ id }: Props) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const loadCategory = async () => {
            try {
                const data = await api.get<{ name: string }>(`/admin/categories/procedure/${id}`);
                setName(data.name);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || 'Lỗi tải dữ liệu');
                setLoading(false);
            }
        };
        if (id) loadCategory();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) { setError('Vui lòng nhập tên danh mục'); return; }
        setSubmitting(true);
        try {
            await api.put(`/admin/categories/procedure/${id}`, { name: name.trim() });
            router.push('/admin/categories/procedure');
        } catch (err) {
            setError((err as Error).message || 'Lỗi không mong muốn');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Cập Nhật Danh Mục Thủ Tục
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Chỉnh sửa thông tin danh mục thủ tục
                    </Typography>
                </Box>
                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            <TextField fullWidth label="Tên danh mục" name="name" value={name}
                                onChange={(e) => setName(e.target.value)} required
                                placeholder="Ví dụ: Tuyển sinh" autoFocus />
                            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                                <Button type="submit" variant="contained" disabled={submitting}
                                    sx={{ bgcolor: 'var(--primary-color)', '&:hover': { bgcolor: 'var(--accent-color)' } }}>
                                    {submitting ? 'Đang cập nhật...' : 'Cập nhật danh mục'}
                                </Button>
                                <Button variant="outlined" onClick={() => router.push('/admin/categories/procedure')} disabled={submitting}>
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
