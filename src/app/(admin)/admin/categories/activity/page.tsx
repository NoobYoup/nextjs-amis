'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Container,
    Stack,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Category } from '@/types/category';
import dayjs from 'dayjs';

export default function ActivityCategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [error, setError] = useState('');

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/categories/activity');
            if (!response.ok) throw new Error('Lỗi khi tải danh sách danh mục');
            const data = await response.json();
            setCategories(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleOpenDeleteDialog = (id: string) => {
        setSelectedId(id);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedId(null);
    };

    const handleConfirmDelete = async () => {
        if (!selectedId) return;
        try {
            const res = await fetch(`/api/admin/categories/activity/${selectedId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error deleting');
            fetchCategories();
            handleCloseDeleteDialog();
        } catch (err) {
            setError((err as Error).message || 'Lỗi xóa danh mục');
        }
    };

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Container maxWidth="xl">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Quản Lý Danh Mục Hoạt Động
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Quản lý danh sách các danh mục hoạt động của trường
                    </Typography>
                </Box>

                {/* Filters */}

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="flex-end" mb={2}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/admin/categories/activity/add')}
                        sx={{ bgcolor: 'var(--primary-color)', minWidth: 180 }}
                    >
                        Thêm danh mục
                    </Button>
                </Stack>

                {/* Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'var(--primary-color)' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>STT</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên danh mục</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày tạo</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày cập nhật</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>
                                    Hành động
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categories.map((category, index) => (
                                <TableRow key={category.id} hover>
                                    <TableCell>{index + 1}</TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{dayjs(category.createdAt).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell>{dayjs(category.updatedAt).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={() =>
                                                router.push(`/admin/categories/activity/update/${category.id}`)
                                            }
                                            sx={{ color: 'var(--primary-color)' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDeleteDialog(category.id)}
                                            sx={{ color: '#d32f2f' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {categories.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Delete Dialog */}
                <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                    <DialogTitle>Xác nhận xóa</DialogTitle>
                    <DialogContent>
                        <Typography>Bạn có chắc chắn muốn xóa danh mục này không?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleConfirmDelete} variant="contained" color="error">
                            Xóa
                        </Button>
                        <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
