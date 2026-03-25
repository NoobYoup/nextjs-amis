'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    FormControl,
    InputLabel,
    CircularProgress,
    Paper,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { api } from '@/lib/api';

interface GradeUpdateClientProps {
    id: string;
}

export default function GradeUpdateClient({ id }: GradeUpdateClientProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        description: '',
        grade: '',
        level: 'elementary' as 'elementary' | 'middle',
        tuition: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadTuition = async () => {
            try {
                const data = await api.get<any>(`/admin/tuition/${id}`);
                setFormData({
                    description: data.description || '',
                    grade: data.grade || '',
                    level: data.level || 'elementary',
                    tuition: data.tuition || '',
                });
            } catch (err) {
                setError((err as Error).message || 'Lỗi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadTuition();
        }
    }, [id]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setError('');
        if (!formData.description.trim() || !formData.grade.trim() || !formData.tuition.trim()) {
            setError('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        const saveData = { ...formData, type: 'grade' };
        try {
            await api.put(`/admin/tuition/${id}`, saveData);
            router.push('/admin/tuition/grade');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra');
        }
    };

    const handleCancel = () => router.push('/admin/tuition/grade');

    if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 10 }} />;

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        component="button"
                        onClick={() => router.push('/admin/tuition/grade')}
                        sx={{ cursor: 'pointer', color: 'var(--primary-color)' }}
                    >
                        Học Phí Theo Lớp
                    </Link>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        Cập Nhật Lớp
                    </Typography>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                    Cập Nhật Học Phí Lớp
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
                            label="Lớp / Grade *"
                            value={formData.grade}
                            onChange={(e) => handleChange('grade', e.target.value)}
                            placeholder="Lớp 1"
                            required
                        />
                        <FormControl fullWidth>
                            <InputLabel>Cấp học</InputLabel>
                            <Select
                                value={formData.level}
                                onChange={(e) => handleChange('level', e.target.value)}
                                label="Cấp học"
                            >
                                <MenuItem value="elementary">Tiểu học</MenuItem>
                                <MenuItem value="middle">Trung học</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Học Phí/Tháng (VND) *"
                            value={formData.tuition}
                            onChange={(e) => handleChange('tuition', e.target.value)}
                            placeholder="5,690,000"
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
                            Cập Nhật
                        </Button>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
