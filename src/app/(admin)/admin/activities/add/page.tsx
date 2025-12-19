'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    IconButton,
    SelectChangeEvent,
    CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { ActivityFormData } from '@/types/activity';
import { toast } from 'react-toastify';

interface Category {
    id: string;
    name: string;
}

export default function AddActivityPage() {
    const router = useRouter();
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
    const [dragActive, setDragActive] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/admin/categories/activity');
                if (!response.ok) throw new Error('Lỗi khi tải danh mục');
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

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
            handleFiles(files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const handleFiles = (files: FileList) => {
        const fileArray = Array.from(files).filter((file) => file.type.startsWith('image/'));
        const newPreviews: string[] = [];
        for (const file of fileArray) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    newPreviews.push(e.target.result as string);
                    if (newPreviews.length === fileArray.length) {
                        setImagePreviews((prev) => [...prev, ...newPreviews]);
                        setFormData((prev) => ({
                            ...prev,
                            images: [...(prev.images || []), ...fileArray],
                        }));
                    }
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (index: number) => {
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
        setFormData((prev) => ({
            ...prev,
            images: (prev.images || []).filter((_, i) => i !== index),
        }));
        if (thumbnailPreview === imagePreviews[index]) setThumbnailPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitLoading(true);

        const submitData = new FormData();
        submitData.append('title', formData.title || '');
        submitData.append('description', formData.description || '');
        submitData.append('category', formData.category || '');
        submitData.append('date', formData.date || '');
        submitData.append('author', formData.author || '');
        submitData.append('videos', formData.videos?.join('\n') || '');

        formData.images?.forEach((file) => submitData.append('images', file));

        try {
            const res = await fetch('/api/admin/activities', {
                method: 'POST',
                body: submitData,
            });
            if (!res.ok) {
                const err = await res.json();
                toast.error(err.error);
                setSubmitLoading(false);
                return;
            }
            router.push('/admin/activities');
        } catch (err) {
            toast.error((err as Error).message || 'Lỗi không mong muốn');
            setSubmitLoading(false);
        }
    };

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Thêm Hoạt Động Mới
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Điền thông tin để thêm hoạt động mới
                    </Typography>
                </Box>

                <Paper sx={{ p: 4, borderRadius: 2 }}>
                    {/* {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )} */}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={3}>
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
                                <InputLabel>Danh mục *</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category || ''}
                                    label="Danh mục *"
                                    onChange={handleSelectChange}
                                    required
                                    disabled={loading}
                                >
                                    {loading ? (
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
                                value={formData.date}
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

                            {/* Upload Area */}
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
                                        Ảnh đã chọn (Chọn một làm thumbnail)
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
                                    {submitLoading ? <CircularProgress size={20} /> : 'Thêm hoạt động'}
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
