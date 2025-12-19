'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Stack,
    Breadcrumbs,
    Link,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Paper,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';

export default function UpdateTuitionFeePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const [formData, setFormData] = useState({
        description: '',
        name: '',
        typeFee: 'included' as 'included' | 'notIncluded',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadTuition = useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/tuition/${id}`);
            if (!res.ok) throw new Error('Error loading');
            const data = await res.json();
            setFormData({
                description: data.description || '',
                name: data.name || '',
                typeFee: data.typeFee || 'included',
            });
        } catch (err) {
            setError((err as Error).message || 'Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        loadTuition();
    }, [loadTuition]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setError('');
        if (!formData.description.trim() || !formData.name.trim()) {
            setError('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        const saveData = { ...formData, type: 'fee' };
        try {
            const res = await fetch(`/api/admin/tuition/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saveData),
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.error || 'Lỗi cập nhật');
                return;
            }
            router.push('/admin/tuition/fee');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra');
        }
    };

    const handleCancel = () => router.push('/admin/tuition/fee');

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        component="button"
                        onClick={() => router.push('/admin/tuition/fee')}
                        sx={{ cursor: 'pointer', color: 'var(--primary-color)' }}
                    >
                        Khoản Phí Khác
                    </Link>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        Cập Nhật Khoản Phí
                    </Typography>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                    Cập Nhật Khoản Phí Khác
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
                            label="Tên Khoản Phí *"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Chi phí ăn uống"
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Loại Phí</InputLabel>
                            <Select
                                value={formData.typeFee}
                                onChange={(e) => handleChange('typeFee', e.target.value)}
                                label="Loại Phí"
                            >
                                <MenuItem value="included">Bao gồm</MenuItem>
                                <MenuItem value="notIncluded">Không bao gồm</MenuItem>
                            </Select>
                        </FormControl>
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
                            Cập Nhật
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
