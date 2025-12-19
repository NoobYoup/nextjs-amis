'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Button,
    Stack,
    IconButton,
    Alert,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';

interface TuitionGrade {
    id: string;
    description: string;
    grade: string;
    level: 'elementary' | 'middle';
    tuition: string;
    createdAt: string;
}

export default function TuitionGradePage() {
    const router = useRouter();
    const [tuitions, setTuitions] = useState<TuitionGrade[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [error, setError] = useState('');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

    const loadTuitions = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                type: 'grade',
                page: (page + 1).toString(),
            });
            const res = await fetch(`/api/admin/tuition?${params}`);
            if (!res.ok) throw new Error('Error loading');
            const { data, total } = await res.json();
            setTuitions(data);
            setTotal(total);
        } catch (err) {
            setError((err as Error).message || 'Lỗi tải dữ liệu');
        }
    }, [page]);

    useEffect(() => {
        loadTuitions();
    }, [loadTuitions]);

    const handleAdd = () => router.push('/admin/tuition/grade/add');

    const handleEdit = (id: string) => router.push(`/admin/tuition/grade/update/${id}`);

    const handleDeleteClick = (id: string) => {
        setDeleteDialog({ open: true, id });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.id) return;
        
        try {
            const res = await fetch(`/api/admin/tuition/${deleteDialog.id}`, { method: 'DELETE' });
            if (!res.ok) {
                const err = await res.json();
                setError(err.error || err.details || 'Lỗi xóa');
                return;
            }
            loadTuitions();
            setDeleteDialog({ open: false, id: null });
        } catch (err) {
            setError((err as Error).message || 'Lỗi xóa');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, id: null });
    };

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="xl">
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Học Phí Theo Lớp
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        sx={{ bgcolor: 'var(--primary-color)' }}
                    >
                        Thêm Lớp
                    </Button>
                </Stack>

                <TableContainer>
                    <Table>
                        <TableHead sx={{ bgcolor: 'var(--primary-color)' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mô Tả</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Lớp</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Cấp Học</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Học Phí/Tháng</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày Tạo</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>
                                    Hành Động
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tuitions.map((tuition) => (
                                <TableRow key={tuition.id} hover>
                                    <TableCell>{tuition.description}</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{tuition.grade}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={tuition.level === 'elementary' ? 'Tiểu học' : 'Trung học'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>{tuition.tuition} VND</TableCell>
                                    <TableCell>{new Date(tuition.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            onClick={() => handleEdit(tuition.id)}
                                            sx={{ color: 'var(--primary-color)' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteClick(tuition.id)} sx={{ color: '#d32f2f' }}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tuitions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: '#666' }}>
                                        Không có dữ liệu
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={total}
                    rowsPerPage={10}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={() => setPage(0)}
                    labelRowsPerPage="Hiển thị:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
                    sx={{ mt: 2 }}
                />

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}>
                    <DialogTitle>Xác nhận xóa</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Bạn có chắc chắn muốn xóa học phí này không? Hành động này không thể hoàn tác.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteCancel}>Hủy</Button>
                        <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                            Xóa
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
