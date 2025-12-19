'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Paper,
    Stack,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardMedia,
    Alert,
    CircularProgress,
    SelectChangeEvent,
    IconButton,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { ActivityFormData } from '@/types/activity';

interface Category {
    id: string;
    name: string;
}

export default function UpdateActivityPage() {
    const router = useRouter();
    const params = useParams();
    const activityId = params?.id as string;
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<Partial<ActivityFormData>>({
        title: '',
        description: '',
        category: '',
        date: '',
        author: '',
        images: [],
        videos: [],
    });
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/admin/categories/activity');
                if (!response.ok) throw new Error('Lỗi khi tải danh mục');
                const data = await response.json();

                setCategories(data);
            } catch (err) {
                setError('Không thể tải danh sách danh mục');
                console.error('Error fetching categories:', err);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const loadActivity = async () => {
            try {
                const res = await fetch(`/api/admin/activities/${activityId}`);
                if (!res.ok) throw new Error('Error loading activity');
                const data = await res.json();

                // Extract categoryId from category object
                const categoryId = data.categoryId || data.category?.id || '';

                setFormData({
                    title: data.title,
                    description: data.description,
                    category: categoryId,
                    date: data.date,
                    author: data.author,
                    images: data.images || [],
                    videos: data.videos || [],
                });
                setExistingImages(data.images || []);
                setImagePreviews(data.images || []);
                setThumbnailPreview(data.thumbnail || data.images?.[0] || null);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || 'Lỗi tải dữ liệu');
                setLoading(false);
            }
        };

        if (activityId) {
            loadActivity();
        }
    }, [activityId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        setFormData((prev) => ({ ...prev, category: e.target.value }));
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleImageUpload(files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleImageUpload(e.target.files);
        }
    };

    const handleImageUpload = (files: FileList) => {
        const newFiles = Array.from(files);
        const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

        setNewImageFiles((prev) => [...prev, ...newFiles]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);

        if (!thumbnailPreview && newPreviews.length > 0) {
            setThumbnailPreview(newPreviews[0]);
        }
    };

    const handleRemoveImage = (index: number) => {
        const imageUrl = imagePreviews[index];

        // Check if it's an existing image or new file
        const existingIndex = existingImages.indexOf(imageUrl);
        if (existingIndex !== -1) {
            // Remove from existing images
            setExistingImages((prev) => prev.filter((_, i) => i !== existingIndex));
        } else {
            // Remove from new files
            const newFileIndex = imagePreviews.slice(existingImages.length).indexOf(imageUrl);
            if (newFileIndex !== -1) {
                setNewImageFiles((prev) => prev.filter((_, i) => i !== newFileIndex));
                // Revoke object URL to prevent memory leaks
                URL.revokeObjectURL(imageUrl);
            }
        }

        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
        if (thumbnailPreview === imageUrl) {
            setThumbnailPreview(imagePreviews.length > 1 ? imagePreviews[0] : null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitLoading(true);

        const submitData = new FormData();
        submitData.append('title', formData.title || '');
        submitData.append('description', formData.description || '');
        submitData.append('category', formData.category || '');
        submitData.append('date', formData.date || '');
        submitData.append('author', formData.author || '');
        submitData.append('videos', formData.videos?.join('\n') || '');

        // Send existing images that should be kept
        submitData.append('existingImages', JSON.stringify(existingImages));

        // Send new image files
        newImageFiles.forEach((file) => {
            submitData.append('images', file);
        });

        try {
            const res = await fetch(`/api/admin/activities/${activityId}`, {
                method: 'PUT',
                body: submitData,
            });
            if (!res.ok) {
                const err = await res.json();
                setError(err.error || 'Lỗi cập nhật');
                return;
            }
            setSubmitLoading(false);
            router.push('/admin/activities');
        } catch (err) {
            setError((err as Error).message || 'Lỗi không mong muốn');
            setSubmitLoading(false);
        }
    };

    if (loading) return <CircularProgress sx={{ display: 'block', m: 'auto', mt: 10 }} />;

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Cập Nhật Hoạt Động
                    </Typography>
                </Box>

                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
                            {/* Fields tương tự add, value từ formData */}
                            <TextField
                                fullWidth
                                label="Tiêu đề"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Mô tả"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                multiline
                                rows={4}
                                required
                            />
                            <FormControl fullWidth>
                                <InputLabel>Phân loại</InputLabel>
                                <Select
                                    value={formData.category || ''}
                                    onChange={handleSelectChange}
                                    label="Phân loại"
                                    required
                                >
                                    {categoriesLoading ? (
                                        <MenuItem disabled>Đang tải danh mục...</MenuItem>
                                    ) : categories.length === 0 ? (
                                        <MenuItem disabled>Không có danh mục nào</MenuItem>
                                    ) : (
                                        categories.map((category) => (
                                            <MenuItem key={category.id} value={category.id}>
                                                {category.name}
                                            </MenuItem>
                                        ))
                                    )}
                                </Select>
                            </FormControl>
                            <TextField
                                fullWidth
                                label="Ngày"
                                name="date"
                                type="date"
                                value={formData.date?.split('T')[0]} // Format date
                                onChange={handleInputChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Tác giả"
                                name="author"
                                value={formData.author}
                                onChange={handleInputChange}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Videos (mỗi link một dòng)"
                                name="videos"
                                value={formData.videos?.join('\n')}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, videos: e.target.value.split('\n') }))
                                }
                                multiline
                                rows={3}
                            />

                            {/* Upload Area (tương tự add) */}
                            <Box
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                sx={{
                                    border: `2px dashed ${dragActive ? 'var(--primary-color)' : '#ccc'}`,
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    bgcolor: dragActive ? 'rgba(124, 179, 66, 0.1)' : '#fafafa',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileInputChange}
                                    style={{ display: 'none' }}
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload">
                                    <CloudUploadIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                                    <Typography variant="body1" sx={{ color: '#666' }}>
                                        Kéo thả ảnh vào đây hoặc click để chọn
                                    </Typography>
                                </label>
                            </Box>

                            {imagePreviews.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                        Ảnh thumbnail
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {imagePreviews.map((preview, index) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                                <Card sx={{ position: 'relative' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="200"
                                                        image={preview}
                                                        alt={`Preview ${index + 1}`}
                                                    />
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            bottom: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bgcolor: 'rgba(0,0,0,0.6)',
                                                            color: '#fff',
                                                            p: 1,
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                        }}
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveImage(index)}
                                                            sx={{
                                                                bgcolor: '#d32f2f',
                                                                color: '#fff',
                                                                m: 1,
                                                                '&:hover': { bgcolor: '#b71c1c' },
                                                            }}
                                                        >
                                                            <CloseIcon />
                                                        </IconButton>
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* Buttons */}
                            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'var(--primary-color)',
                                        '&:hover': { bgcolor: 'var(--accent-color)' },
                                    }}
                                    onClick={handleSubmit}
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? <CircularProgress size={20} /> : 'Cập nhật hoạt động'}
                                </Button>
                                <Button variant="outlined" onClick={() => router.push('/admin/activities')}>
                                    Hủy
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}
