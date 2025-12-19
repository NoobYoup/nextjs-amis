'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, TextField, Button, Stack, Breadcrumbs, Link, Alert, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

export default function AddTuitionSchedulePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        description: '',
        period: '',
        date: '',
        months: '',
    });
    const [error, setError] = useState('');

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setError('');
        if (!formData.description.trim() || !formData.period.trim() || !formData.date || !formData.months.trim()) {
            setError('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        const saveData = { ...formData, type: 'schedule' };
        try {
            const res = await fetch('/api/admin/tuition', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saveData),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.error || 'Lỗi lưu');
                return;
            }
            router.push('/admin/tuition/schedule');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra');
        }
    };

    const handleCancel = () => router.push('/admin/tuition/schedule');

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        component="button"
                        onClick={() => router.push('/admin/tuition/schedule')}
                        sx={{ cursor: 'pointer', color: 'var(--primary-color)' }}
                    >
                        Lịch Nộp Học Phí
                    </Link>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        Thêm Lịch Nộp Mới
                    </Typography>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                    Thêm Lịch Nộp Học Phí
                </Typography>

                <Paper sx={{ p: 4, mt: 3, borderRadius: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Stack spacing={3}>
                        <TextField
                            fullWidth
                            label="Mô tả *"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            multiline
                            rows={3}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Đợt *"
                            value={formData.period}
                            onChange={(e) => handleChange('period', e.target.value)}
                            placeholder="Đợt 1"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Ngày Nộp *"
                            type="date"
                            value={formData.date}
                            onChange={(e) => handleChange('date', e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Số Tháng *"
                            value={formData.months}
                            onChange={(e) => handleChange('months', e.target.value)}
                            placeholder="2 tháng"
                            required
                        />
                    </Stack>

                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={handleCancel}>
                            Hủy
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            sx={{ bgcolor: 'var(--primary-color)' }}
                        >
                            Lưu
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
