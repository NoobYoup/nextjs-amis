'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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
    Button,
    IconButton,
    TablePagination,
    Alert,
    Paper,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Download as DownloadIcon,
    Image as ImageIcon,
    Close as CloseIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';

interface ReformFile {
    id: string;
    fileUrl: string;
    fileType: string;
    order: number;
}

interface Reform {
    id: string;
    title: string;
    description: string;
    details: string[];
    createdAt: string;
    updatedAt: string;
    files: ReformFile[];
}

export default function ReformsPage() {
    const router = useRouter();
    const [reforms, setReforms] = useState<Reform[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [error, setError] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [downloading, setDownloading] = useState<string | null>(null);

    const loadReforms = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page: (page + 1).toString(),
            });
            const res = await fetch(`/api/admin/reforms?${params}`);
            if (!res.ok) throw new Error('Error loading reforms');
            const { data, total } = await res.json();

            setReforms(data);
            setTotal(total);
        } catch (err) {
            setError((err as Error).message || 'Lỗi tải dữ liệu');
        }
    }, [page]);

    useEffect(() => {
        loadReforms();
    }, [loadReforms]);

    const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await fetch(`/api/admin/reforms/${selectedId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error deleting');
            loadReforms();
            handleCloseDeleteDialog();
        } catch (err) {
            setError((err as Error).message || 'Lỗi xóa reform');
        }
    };

    const handleOpenDeleteDialog = (id: string) => {
        setSelectedId(id);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedId(null);
    };

    const handleDownload = async (reform: Reform, fileType: string) => {
        setDownloading(reform.id);
        try {
            const firstFile = reform.files.find((f) => f.fileType !== 'image') || reform.files[0];
            const response = await fetch(`/api/download?url=${encodeURIComponent(firstFile.fileUrl)}`);

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${reform.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileType}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Lỗi khi tải file. Vui lòng thử lại.');
        } finally {
            setDownloading(null);
        }
    };

    const handleOpenImageGallery = (imageUrls: string[]) => {
        setSelectedImageUrls(imageUrls);
        setSelectedImageIndex(0);
        setOpenImageGallery(true);
    };

    const handleCloseImageGallery = () => {
        setOpenImageGallery(false);
        setSelectedImageUrls([]);
        setSelectedImageIndex(0);
    };

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? selectedImageUrls.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev === selectedImageUrls.length - 1 ? 0 : prev + 1));
    };

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Container maxWidth="xl">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Quản Lý Công Khai Thông Tin
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => router.push('/admin/reforms/add')}
                        sx={{ bgcolor: 'var(--primary-color)', minWidth: 180 }}
                    >
                        Thêm mục công khai
                    </Button>
                </Box>

                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'var(--primary-color)' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tiêu đề</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Mô tả</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Số chi tiết</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày tạo</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày cập nhật</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>
                                    Hành động
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reforms.map((reform, index) => (
                                <TableRow key={index} hover>
                                    <TableCell sx={{ maxWidth: 300 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {reform.title}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ maxWidth: 400 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {reform.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{reform.details.length} mục</TableCell>
                                    <TableCell>{dayjs(reform.createdAt).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell>{dayjs(reform.updatedAt).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            size="small"
                                            href={`/admin/reforms/update/${reform.id}`}
                                            component="a"
                                            sx={{ color: 'var(--primary-color)' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        {reform.files && reform.files.length > 0 && (
                                            <>
                                                {reform.files.some((f) => f.fileType === 'image') ? (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleOpenImageGallery(
                                                                reform.files
                                                                    .filter((f) => f.fileType === 'image')
                                                                    .map((f) => f.fileUrl),
                                                            )
                                                        }
                                                        title="Xem ảnh"
                                                        sx={{ color: 'var(--primary-color)' }}
                                                    >
                                                        <ImageIcon />
                                                    </IconButton>
                                                ) : (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            const nonImageFile = reform.files.find(
                                                                (f) => f.fileType !== 'image',
                                                            );
                                                            if (nonImageFile) {
                                                                handleDownload(reform, nonImageFile.fileType);
                                                            }
                                                        }}
                                                        disabled={downloading === reform.id}
                                                        title={downloading === reform.id ? 'Đang tải...' : 'Tải về'}
                                                        sx={{
                                                            color:
                                                                downloading === reform.id
                                                                    ? '#999'
                                                                    : 'var(--primary-color)',
                                                            opacity: downloading === reform.id ? 0.6 : 1,
                                                        }}
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                )}
                                            </>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDeleteDialog(reform.id)}
                                            sx={{ color: 'red' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {reforms.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">Chưa có mục công khai nào</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Số dòng mỗi trang:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
                />
            </Container>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>Bạn có chắc chắn muốn xóa mục công khai này không?</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Image Gallery Dialog */}
            <Dialog open={openImageGallery} onClose={handleCloseImageGallery} maxWidth="md" fullWidth>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                        Hình ảnh ({selectedImageIndex + 1}/{selectedImageUrls.length})
                    </Typography>
                    <IconButton onClick={handleCloseImageGallery}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', p: 2 }}>
                    {selectedImageUrls.length > 0 && (
                        <Box sx={{ position: 'relative' }}>
                            <Image
                                src={selectedImageUrls[selectedImageIndex]}
                                alt={`Image ${selectedImageIndex + 1}`}
                                width={800}
                                height={600}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                }}
                            />
                            {selectedImageUrls.length > 1 && (
                                <>
                                    <IconButton
                                        onClick={handlePrevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                                        }}
                                    >
                                        <NavigateBeforeIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={handleNextImage}
                                        sx={{
                                            position: 'absolute',
                                            right: 10,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            bgcolor: 'rgba(0,0,0,0.5)',
                                            color: 'white',
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                                        }}
                                    >
                                        <NavigateNextIcon />
                                    </IconButton>
                                </>
                            )}
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
