'use client';

import { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import axios from 'axios';

interface DocumentCategory {
    id: string;
    name: string;
    type: 'document_type' | 'document_field';
    createdAt: string;
    updatedAt: string;
}

interface CategoryFormData {
    name: string;
    type: 'document_type' | 'document_field';
}

export default function DocumentCategoriesPage() {
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<DocumentCategory | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<DocumentCategory | null>(null);

    // Form states
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        type: 'document_type',
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/admin/categories/document');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter categories by type
    const getFilteredCategories = () => {
        const type = activeTab === 0 ? 'document_type' : 'document_field';
        return categories.filter((cat) => cat.type === type);
    };

    // Handle form
    const handleInputChange = (field: keyof CategoryFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Tên danh mục là bắt buộc';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);
        try {
            const currentType = activeTab === 0 ? 'document_type' : 'document_field';
            const dataToSubmit = {
                ...formData,
                type: currentType,
                name: formData.name.trim(),
            };

            if (editingCategory) {
                await axios.put(`/api/admin/categories/document/${editingCategory.id}`, dataToSubmit);
                toast.success('Cập nhật danh mục thành công!');
            } else {
                await axios.post('/api/admin/categories/document', dataToSubmit);
                toast.success('Thêm danh mục thành công!');
            }

            handleCloseDialog();
            fetchCategories();
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Có lỗi xảy ra';
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (category: DocumentCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            type: category.type,
        });
        setDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await axios.delete(`/api/admin/categories/document/${categoryToDelete.id}`);
            toast.success('Xóa danh mục thành công!');
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
            fetchCategories();
        } catch (error: unknown) {
            const errorMessage =
                (error as { response?: { data?: { error?: string } } }).response?.data?.error ||
                'Có lỗi xảy ra khi xóa danh mục';
            toast.error(errorMessage);
        }
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', type: 'document_type' });
        setFormErrors({});
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 2, display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 2 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                    Quản lý danh mục tài liệu
                </Typography>
            </Box>

            <Card>
                <CardContent>
                    {/* Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs value={activeTab} onChange={handleTabChange}>
                            <Tab label="Loại tài liệu" />
                            <Tab label="Lĩnh vực" />
                        </Tabs>
                    </Box>

                    {/* Add button */}
                    <Box sx={{ mb: 3 }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setDialogOpen(true)}
                            sx={{ bgcolor: 'var(--primary-color)' }}
                        >
                            Thêm {activeTab === 0 ? 'loại tài liệu' : 'lĩnh vực'}
                        </Button>
                    </Box>

                    {/* Table */}
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tên</TableCell>
                                    <TableCell>Loại</TableCell>
                                    <TableCell>Ngày tạo</TableCell>
                                    <TableCell align="center">Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getFilteredCategories().map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={category.type === 'document_type' ? 'Loại tài liệu' : 'Lĩnh vực'}
                                                color={category.type === 'document_type' ? 'primary' : 'secondary'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                onClick={() => handleEdit(category)}
                                                color="primary"
                                                size="small"
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    setCategoryToDelete(category);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {getFilteredCategories().length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                            <Typography color="text.secondary">Chưa có danh mục nào</Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục mới'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Tên danh mục"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                        />

                        <Alert severity="info">
                            Danh mục này sẽ được thêm vào {activeTab === 0 ? 'loại tài liệu' : 'lĩnh vực'}
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Hủy</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={submitting}
                        sx={{ bgcolor: 'var(--primary-color)' }}
                    >
                        {submitting ? <CircularProgress size={20} /> : editingCategory ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa danh mục &quot;{categoryToDelete?.name}&quot;?
                        <br />
                        <strong>Lưu ý:</strong> Không thể xóa danh mục đang được sử dụng bởi tài liệu.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
