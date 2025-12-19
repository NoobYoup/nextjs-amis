'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Stack,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { Activity } from '@/types/activity';
import dayjs from 'dayjs';

interface Category {
    id: string;
    name: string;
}

export default function ActivitiesPage() {
    const router = useRouter();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [error, setError] = useState('');

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/admin/categories/activity');
                if (!res.ok) throw new Error('Error loading categories');
                const data = await res.json();
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };

        fetchCategories();
    }, []);

    const loadActivities = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                category: selectedCategory,
                page: (page + 1).toString(),
            });
            const res = await fetch(`/api/admin/activities?${params}`);
            if (!res.ok) throw new Error('Error loading activities');
            const { data, total } = await res.json();

            setActivities(data);
            setTotal(total);
        } catch (err) {
            setError((err as Error).message || 'Lỗi tải dữ liệu');
        }
    }, [page, selectedCategory]); // Add dependencies here

    useEffect(() => {
        loadActivities();
    }, [loadActivities]); // Now this is the only dependency needed

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCategoryChange = (e: { target: { value: string } }) => {
        setSelectedCategory(e.target.value);
        setPage(0);
    };

    const filteredActivities = useMemo(() => activities, [activities]);

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
            const res = await fetch(`/api/admin/activities/${selectedId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error deleting');
            loadActivities(); // Refresh list
            handleCloseDeleteDialog();
        } catch (err) {
            setError((err as Error).message || 'Lỗi xóa hoạt động');
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
                        Quản Lý Hoạt Động
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Quản lý danh sách các hoạt động của trường
                    </Typography>
                </Box>

                {/* Filters */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <FormControl fullWidth>
                            <InputLabel>Phân loại</InputLabel>
                            <Select value={selectedCategory} onChange={handleCategoryChange} label="Phân loại">
                                <MenuItem value="">Tất cả</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => router.push('/admin/activities/add')}
                            sx={{ bgcolor: 'var(--primary-color)', minWidth: 180 }}
                        >
                            Thêm hoạt động
                        </Button>
                    </Stack>
                </Paper>

                {/* Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'var(--primary-color)' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tiêu đề</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Phân loại</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tác giả</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>
                                    Hành động
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredActivities.map((activity) => (
                                <TableRow key={activity.id} hover>
                                    <TableCell>{activity.title}</TableCell>
                                    <TableCell>{activity.category.name}</TableCell>
                                    <TableCell>{dayjs(activity.date).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell>{activity.author}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => router.push(`/admin/activities/update/${activity.id}`)}
                                            sx={{ color: 'var(--primary-color)' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDeleteDialog(activity.id)}
                                            sx={{ color: '#d32f2f' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[10]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ bgcolor: '#fff', mt: 2, display: 'flex', justifyContent: 'center' }}
                />

                {/* Delete Dialog */}
                <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                    <DialogTitle>Xác nhận xóa</DialogTitle>
                    <DialogContent>
                        <Typography>Bạn có chắc chắn muốn xóa hoạt động này không?</Typography>
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
