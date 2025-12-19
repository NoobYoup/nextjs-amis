'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Stack,
    Breadcrumbs,
    Link,
    Alert,
    CircularProgress,
    Paper,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

export default function UpdateTuitionSchedulePage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        description: '',
        period: '',
        date: '',
        months: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const loadSchedule = async () => {
            try {
                const res = await fetch(`/api/admin/tuition/${id}`);
                if (!res.ok) throw new Error('Error loading schedule');
                const data = await res.json();
                setFormData({
                    description: data.description || '',
                    period: data.period || '',
                    date: data.date ? data.date.split('T')[0] : '',
                    months: data.months || '',
                });
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || 'Lỗi tải dữ liệu');
                setLoading(false);
            }
        };

        if (id) {
            loadSchedule();
        }
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setError('');
        if (!formData.description || !formData.period || !formData.date || !formData.months) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            const res = await fetch(`/api/admin/tuition/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error('Error updating schedule');
            router.push('/admin/tuition/schedule');
        } catch (err) {
            setError((err as Error).message || 'Lỗi cập nhật lịch nộp');
        }
    };

    const handleCancel = () => {
        router.push('/admin/tuition/schedule');
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
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => router.push('/admin/tuition/schedule')}
                        sx={{ cursor: 'pointer', color: 'var(--primary-color)' }}
                    >
                        Lịch Nộp Học Phí
                    </Link>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        Cập Nhật Lịch Nộp
                    </Typography>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)', mb: 4 }}>
                    Cập Nhật Lịch Nộp Học Phí
                </Typography>

                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form>
                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Mô tả"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                multiline
                                rows={4}
                            />
                            <TextField
                                fullWidth
                                label="Đợt"
                                name="period"
                                value={formData.period}
                                onChange={handleInputChange}
                            />
                            <TextField
                                fullWidth
                                label="Ngày Nộp"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                fullWidth
                                label="Số Tháng"
                                name="months"
                                value={formData.months}
                                onChange={handleInputChange}
                            />
                        </Stack>

                        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleCancel}>
                                Hủy
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={<SaveIcon />}
                                onClick={handleSubmit}
                                sx={{ bgcolor: 'var(--primary-color)', '&:hover': { bgcolor: 'var(--accent-color)' } }}
                            >
                                Cập Nhật
                            </Button>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}
