'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, TextField, Button, Stack, Breadcrumbs, Link, Alert, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

export default function AddTuitionDiscountPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        description: '',
        discount: '',
    });
    const [error, setError] = useState('');

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setError('');
        if (!formData.description.trim() || !formData.discount.trim()) {
            setError('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        const saveData = { ...formData, type: 'discount' };
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
            router.push('/admin/tuition/discount');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra');
        }
    };

    const handleCancel = () => router.push('/admin/tuition/discount');

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        component="button"
                        onClick={() => router.push('/admin/tuition/discount')}
                        sx={{ cursor: 'pointer', color: 'var(--primary-color)' }}
                    >
                        Chính Sách Giảm Giá
                    </Link>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        Thêm Chính Sách Mới
                    </Typography>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                    Thêm Chính Sách Giảm Giá
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
                            label="Mức Giảm *"
                            value={formData.discount}
                            onChange={(e) => handleChange('discount', e.target.value)}
                            placeholder="Giảm 5%"
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
