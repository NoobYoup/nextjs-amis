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
    Button,
    TextField,
    MenuItem,
    IconButton,
    Stack,
    Chip,
    TablePagination,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Search as SearchIcon,
    Download as DownloadIcon,
    Image as ImageIcon,
    Close as CloseIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { SelectChangeEvent } from '@mui/material/Select';

interface DocumentFile {
    id: string;
    fileUrl: string;
    fileType: string;
    order: number;
}

interface Document {
    id: string;
    title: string;
    type: string;
    number: string;
    date: string;
    field: string;
    summary: string;
    isNew?: boolean;
    updatedAt: string;
    createdAt: string;
    files: DocumentFile[];
}

interface DocumentCategory {
    id: string;
    name: string;
    type: 'document_type' | 'document_field';
}

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [selectedField, setSelectedField] = useState('');
    const [error, setError] = useState('');

    // Categories state
    const [documentTypes, setDocumentTypes] = useState<string[]>([]);
    const [documentFields, setDocumentFields] = useState<string[]>([]);
    const [, setCategoriesLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Load categories from API
    const loadCategories = useCallback(async () => {
        try {
            setCategoriesLoading(true);
            const response = await fetch('/api/admin/categories/document');
            if (!response.ok) throw new Error('Error loading categories');

            const { data } = await response.json();
            const categories: DocumentCategory[] = data || [];

            // Separate types and fields
            const types = categories
                .filter((cat) => cat.type === 'document_type')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cat) => cat.name);

            const fields = categories
                .filter((cat) => cat.type === 'document_field')
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((cat) => cat.name);

            setDocumentTypes(types);
            setDocumentFields(fields);
        } catch (err) {
            console.error('Error loading categories:', err);
            // Fallback to hardcoded values if API fails
            setDocumentTypes(['Thông tư', 'Quyết định', 'Quy chế', 'Kế hoạch', 'Quy định', 'Hướng dẫn']);
            setDocumentFields(['Quản lý giáo dục', 'Tuyển sinh', 'Đánh giá', 'Kế hoạch', 'Học sinh', 'Chương trình']);
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    const loadDocuments = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                search: searchQuery,
                type: selectedType,
                field: selectedField,
                page: (page + 1).toString(),
            });
            const res = await fetch(`/api/admin/documents?${params}`);
            if (!res.ok) throw new Error('Error loading documents');
            const { data, total } = await res.json();

            setDocuments(data);
            setTotal(total);
        } catch (err) {
            setError((err as Error).message || 'Lỗi tải dữ liệu');
        }
    }, [page, searchQuery, selectedType, selectedField]);

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        loadDocuments();
    }, [loadDocuments]);

    const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);
    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const handleTypeChange = (e: SelectChangeEvent) => {
        setSelectedType(e.target.value);
        setPage(0);
    };

    const handleFieldChange = (e: SelectChangeEvent) => {
        setSelectedField(e.target.value);
        setPage(0);
    };

    const handleConfirmDelete = async () => {
        try {
            const res = await fetch(`/api/admin/documents/${selectedId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Error deleting');
            loadDocuments();
            handleCloseDeleteDialog();
        } catch (err) {
            setError((err as Error).message || 'Lỗi xóa tài liệu');
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
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                    Quản Lý Tài Liệu
                </Typography>

                <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm theo tiêu đề hoặc số văn bản"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#666' }} /> }}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Loại tài liệu</InputLabel>
                            <Select value={selectedType} onChange={handleTypeChange} label="Loại tài liệu">
                                <MenuItem value="">Tất cả</MenuItem>
                                {documentTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Lĩnh vực</InputLabel>
                            <Select value={selectedField} onChange={handleFieldChange} label="Lĩnh vực">
                                <MenuItem value="">Tất cả</MenuItem>
                                {documentFields.map((field) => (
                                    <MenuItem key={field} value={field}>
                                        {field}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => router.push('/admin/documents/add')}
                            sx={{ bgcolor: 'var(--primary-color)', minWidth: 180 }}
                        >
                            Thêm tài liệu
                        </Button>
                    </Stack>
                </Paper>

                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'var(--primary-color)' }}>
                            <TableRow>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Tiêu đề</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Loại</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Số</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Lĩnh vực</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày tạo</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600 }}>Ngày cập nhật</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 600, textAlign: 'center' }}>
                                    Hành động
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {documents.map((doc, index) => (
                                <TableRow key={index} hover>
                                    <TableCell>{doc.title}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={doc.type}
                                            size="small"
                                            sx={{ bgcolor: 'var(--primary-color)', color: 'white', fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    {doc.number ? (
                                        <TableCell sx={{ fontWeight: 600 }}>{doc.number}</TableCell>
                                    ) : (
                                        <TableCell sx={{ fontWeight: 600 }}>Trống</TableCell>
                                    )}

                                    <TableCell>{doc.field}</TableCell>

                                    <TableCell>{dayjs(doc.date).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell>{dayjs(doc.updatedAt).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell sx={{ textAlign: 'center', display: 'flex' }}>
                                        <IconButton
                                            size="small"
                                            href={`/admin/documents/update/${doc.id}`}
                                            component="a"
                                            sx={{ color: 'var(--primary-color)' }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        {doc.files && doc.files.length > 0 && (
                                            <>
                                                {doc.files.some((f) => f.fileType === 'image') ? (
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleOpenImageGallery(
                                                                doc.files
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
                                                        href={doc.files[0].fileUrl}
                                                        target="_blank"
                                                        title="Tải xuống"
                                                    >
                                                        <DownloadIcon />
                                                    </IconButton>
                                                )}
                                            </>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenDeleteDialog(doc.id)}
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

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    sx={{ bgcolor: '#fff' }}
                />

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

                {/* Image Gallery Modal */}
                <Dialog
                    open={openImageGallery}
                    onClose={handleCloseImageGallery}
                    maxWidth="lg"
                    fullWidth
                    PaperProps={{
                        sx: {
                            bgcolor: 'rgba(0, 0, 0, 0.95)',
                            boxShadow: 'none',
                        },
                    }}
                >
                    <DialogContent sx={{ position: 'relative', p: 0, overflow: 'hidden' }}>
                        <IconButton
                            onClick={handleCloseImageGallery}
                            sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                color: 'white',
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                                zIndex: 1,
                                '&:hover': {
                                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                                },
                            }}
                        >
                            <CloseIcon />
                        </IconButton>

                        <Box
                            sx={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: '80vh',
                            }}
                        >
                            {selectedImageUrls.length > 0 && (
                                <>
                                    <IconButton
                                        onClick={handlePrevImage}
                                        sx={{
                                            position: 'absolute',
                                            left: 16,
                                            color: 'white',
                                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                                            '&:hover': {
                                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                            },
                                        }}
                                    >
                                        <NavigateBeforeIcon sx={{ fontSize: 40 }} />
                                    </IconButton>

                                    <Box
                                        component="img"
                                        src={selectedImageUrls[selectedImageIndex]}
                                        alt={`Image ${selectedImageIndex + 1}`}
                                        sx={{
                                            maxWidth: '100%',
                                            maxHeight: '80vh',
                                            objectFit: 'contain',
                                        }}
                                    />

                                    <IconButton
                                        onClick={handleNextImage}
                                        sx={{
                                            position: 'absolute',
                                            right: 16,
                                            color: 'white',
                                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                                            '&:hover': {
                                                bgcolor: 'rgba(0, 0, 0, 0.7)',
                                            },
                                        }}
                                    >
                                        <NavigateNextIcon sx={{ fontSize: 40 }} />
                                    </IconButton>
                                </>
                            )}
                        </Box>

                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'white',
                                py: 2,
                            }}
                        >
                            {selectedImageIndex + 1} / {selectedImageUrls.length}
                        </Typography>
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
}
