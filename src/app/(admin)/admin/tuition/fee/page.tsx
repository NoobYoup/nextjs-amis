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
    Paper,
    TablePagination,
    TextField,
    Button,
    Stack,
    IconButton,
    Alert,
    InputAdornment,
    Chip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

interface TuitionFee {
    id: string;
    description: string;
    name: string;
    typeFee: 'included' | 'notIncluded';
    createdAt: string;
}

export default function TuitionFeePage() {
    const router = useRouter();
    const [tuitions, setTuitions] = useState<TuitionFee[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState('');

    const loadTuitions = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                type: 'fee',
                search: searchQuery,
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
    }, [page, searchQuery]);

    useEffect(() => {
        loadTuitions();
    }, [loadTuitions]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const handleAdd = () => router.push('/admin/tuition/fee/add');

    const handleEdit = (id: string) => router.push(`/admin/tuition/fee/update/${id}`);

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/tuition/${id}`, { method: 'DELETE' });
            if (res.ok) loadTuitions();
        } catch (err) {
            setError((err as Error).message || 'Lỗi xóa');
        }
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
                        Khoản Phí Khác
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                        Thêm Khoản Phí
                    </Button>
                </Stack>

                <Paper sx={{ p: 3, borderRadius: 2 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                        <TextField
                            variant="outlined"
                            placeholder="Tìm kiếm theo mô tả hoặc tên khoản phí..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            sx={{ flex: 1 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead sx={{ bgcolor: 'var(--primary-color)' }}>
                                <TableRow>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mô Tả</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tên Khoản Phí</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Loại Phí</TableCell>
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
                                        <TableCell sx={{ fontWeight: 600 }}>{tuition.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={tuition.typeFee}
                                                color={tuition.typeFee === 'included' ? 'success' : 'warning'}
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(tuition.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            <IconButton
                                                onClick={() => handleEdit(tuition.id)}
                                                sx={{ color: 'var(--primary-color)' }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => handleDelete(tuition.id)}
                                                sx={{ color: '#d32f2f' }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {tuitions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: '#666' }}>
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
                </Paper>
            </Container>
        </Box>
    );
}
