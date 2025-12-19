'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    TextField,
    InputAdornment,
    Stack,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Breadcrumbs,
    Link,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    FilePresent as FileIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

interface ProcedureFile {
    id: string;
    fileUrl: string;
    fileType: string;
    fileName?: string;
}

interface ProcedureContent {
    id: string;
    title: string;
    items: string[];
}

interface Procedure {
    id: string;
    title: string;
    category: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    content: ProcedureContent[];
    files: ProcedureFile[];
    _count?: {
        content: number;
        files: number;
    };
}

export default function ProceduresPage() {
    const router = useRouter();
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; procedure: Procedure | null }>({
        open: false,
        procedure: null,
    });

    // Fetch procedures
    const fetchProcedures = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            const res = await fetch(`/api/admin/procedures?${params}`);
            if (!res.ok) {
                throw new Error('Failed to fetch procedures');
            }

            const data = await res.json();
            setProcedures(data);
            setError('');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra khi tải dữ liệu');
            console.error('Error fetching procedures:', err);
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchProcedures();
    }, [fetchProcedures]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchProcedures();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchProcedures]);

    const handleDelete = async () => {
        if (!deleteDialog.procedure) return;

        try {
            const res = await fetch(`/api/admin/procedures/${deleteDialog.procedure.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to delete procedure');
            }

            toast.success('Xóa quy chế thành công');
            fetchProcedures();
            setDeleteDialog({ open: false, procedure: null });
        } catch (err) {
            toast.error((err as Error).message || 'Có lỗi xảy ra khi xóa quy chế');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getCategoryColor = (category: string) => {
        const colors: { [key: string]: string } = {
            'Học sinh': '#1976d2',
            'Tuyển sinh': '#388e3c',
            'Học tập': '#f57c00',
            'An toàn': '#d32f2f',
            'Khen thưởng': '#7b1fa2',
        };
        return colors[category] || '#666';
    };

    if (loading) {
        return (
            <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
                <Container maxWidth="lg">
                    <Typography>Đang tải...</Typography>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                {/* Breadcrumb */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => router.push('/admin')}
                        sx={{ cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'none' }}
                    >
                        Trang chủ Admin
                    </Link>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        Quản Lý Nội Quy & Quy Chế
                    </Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                            Quản Lý Nội Quy & Quy Chế
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                            Quản lý các quy định và quy chế của trường
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/admin/procedures/add')}
                        sx={{
                            bgcolor: 'var(--primary-color)',
                            '&:hover': { bgcolor: 'var(--accent-color)' },
                            px: 3,
                        }}
                    >
                        Thêm Quy Chế Mới
                    </Button>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Search */}
                <Card sx={{ p: 3, mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Card>

                {/* Table */}
                <Card>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                    <TableCell sx={{ fontWeight: 600 }}>Tiêu đề</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Danh mục</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Nội dung</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Files</TableCell>
                                    <TableCell sx={{ fontWeight: 600 }}>Cập nhật</TableCell>
                                    <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {procedures.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                {searchTerm ? 'Không tìm thấy quy chế nào' : 'Chưa có quy chế nào'}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    procedures.map((procedure) => (
                                        <TableRow key={procedure.id} hover>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                                        {procedure.title}
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ color: '#666', fontSize: '0.875rem' }}
                                                    >
                                                        {procedure.description.length > 100
                                                            ? `${procedure.description.substring(0, 100)}...`
                                                            : procedure.description}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={procedure.category}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getCategoryColor(procedure.category),
                                                        color: 'white',
                                                        fontWeight: 600,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    {procedure._count?.content || procedure.content.length} mục
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                    <FileIcon sx={{ fontSize: 16, color: '#666' }} />
                                                    <Typography variant="body2" sx={{ color: '#666' }}>
                                                        {procedure._count?.files || procedure.files.length}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" sx={{ color: '#666' }}>
                                                    {formatDate(procedure.updatedAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" spacing={1} justifyContent="center">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            router.push(`/admin/procedures/update/${procedure.id}`)
                                                        }
                                                        sx={{ color: 'var(--primary-color)' }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setDeleteDialog({ open: true, procedure })}
                                                        sx={{ color: '#d32f2f' }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialog.open}
                    onClose={() => setDeleteDialog({ open: false, procedure: null })}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Xác nhận xóa</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Bạn có chắc chắn muốn xóa quy chế &quot;{deleteDialog.procedure?.title}&quot;?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#d32f2f', mt: 1 }}>
                            Hành động này không thể hoàn tác.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialog({ open: false, procedure: null })}>Hủy</Button>
                        <Button onClick={handleDelete} color="error" variant="contained">
                            Xóa
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}
