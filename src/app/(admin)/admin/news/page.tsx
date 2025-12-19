'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TablePagination,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Avatar,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Image as ImageIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface NewsImage {
    id: string;
    imageUrl: string;
    order: number;
}

interface News {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    date: string;
    thumbnail: string | null;
    images: NewsImage[];
    createdAt: string;
    updatedAt: string;
}

export default function NewsListPage() {
    const router = useRouter();
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [newsToDelete, setNewsToDelete] = useState<News | null>(null);

    const categories = ['all', 'Tiểu học', 'Trung học'];

    // Fetch news data
    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: (page + 1).toString(),
                limit: rowsPerPage.toString(),
            });

            if (searchTerm) {
                params.append('search', searchTerm);
            }

            if (categoryFilter !== 'all') {
                params.append('category', categoryFilter);
            }

            const response = await fetch(`/api/admin/news?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }

            const data = await response.json();
            setNews(data.data);
            setTotalCount(data.pagination.total);
        } catch (error) {
            console.error('Error fetching news:', error);
            toast.error('Có lỗi xảy ra khi tải danh sách tin tức');
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, searchTerm, categoryFilter]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleSearch = () => {
        setPage(0);
        fetchNews();
    };

    const handleDelete = async () => {
        if (!newsToDelete) return;

        try {
            const response = await fetch(`/api/admin/news/${newsToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete news');
            }

            toast.success('Xóa tin tức thành công');
            setDeleteDialogOpen(false);
            setNewsToDelete(null);
            fetchNews();
        } catch (error) {
            console.error('Error deleting news:', error);
            toast.error('Có lỗi xảy ra khi xóa tin tức');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Tiểu học':
                return 'primary';
            case 'Trung học':
                return 'secondary';
            default:
                return 'default';
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                    Quản lý Tin tức
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/admin/news/add')}
                    sx={{
                        bgcolor: 'var(--primary-color)',
                        '&:hover': { bgcolor: 'var(--accent-color)' },
                    }}
                >
                    Thêm tin tức
                </Button>
            </Box>

            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Tìm kiếm tin tức..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    sx={{ minWidth: 300 }}
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={handleSearch}>
                                <SearchIcon />
                            </IconButton>
                        ),
                    }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Danh mục</InputLabel>
                    <Select value={categoryFilter} label="Danh mục" onChange={(e) => setCategoryFilter(e.target.value)}>
                        {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                                {category === 'all' ? 'Tất cả' : category}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Table */}
            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Ảnh</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Tiêu đề</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Danh mục</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Ngày xuất bản</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Số ảnh</TableCell>
                            <TableCell sx={{ fontWeight: 700, textAlign: 'center' }}>Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                                    Đang tải...
                                </TableCell>
                            </TableRow>
                        ) : news.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                                    Không có tin tức nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            news.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell>
                                        <Avatar
                                            src={item.thumbnail || undefined}
                                            variant="rounded"
                                            sx={{ width: 60, height: 40 }}
                                        >
                                            <ImageIcon />
                                        </Avatar>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {item.description.substring(0, 100)}...
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={item.category}
                                            color={
                                                getCategoryColor(item.category) as
                                                    | 'default'
                                                    | 'primary'
                                                    | 'secondary'
                                                    | 'error'
                                                    | 'info'
                                                    | 'success'
                                                    | 'warning'
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>{formatDate(item.date)}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={`${item.images.length} ảnh`}
                                            variant="outlined"
                                            size="small"
                                            icon={<ImageIcon />}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>
                                        <IconButton
                                            onClick={() => router.push(`/admin/news/update/${item.id}`)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setNewsToDelete(item);
                                                setDeleteDialogOpen(true);
                                            }}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
                component="div"
                count={totalCount}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                labelRowsPerPage="Số dòng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>Xác nhận xóa</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa tin tức &quot;{newsToDelete?.title}&quot;?
                        <br />
                        <strong>Hành động này không thể hoàn tác.</strong>
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
