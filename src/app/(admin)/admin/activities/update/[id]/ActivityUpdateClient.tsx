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
    Alert,
    CircularProgress,
    IconButton,
    SelectChangeEvent,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { api, getMediaUrl } from '@/lib/api';
import { ActivityFormData } from '@/types/activity';

interface Category {
    id: string;
    name: string;
}

interface ActivityUpdateClientProps {
    id: string;
}

export default function ActivityUpdateClient({ id }: ActivityUpdateClientProps) {
    const router = useRouter();
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
                const data = await api.get<Category[]>('/admin/categories/activity');
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

    // Load activity data
    useEffect(() => {
        const loadActivity = async () => {
            try {
                const data = await api.get<any>(`/admin/activities/${id}`);
                
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

        if (id) {
            loadActivity();
        }
    }, [id]);

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
        setNewImageFiles((prev) => [...prev, ...fileArray]);

        const newPreviews: string[] = [];
        for (const file of fileArray) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImagePreviews((prev) => [...prev, e.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (index: number) => {
        const removedPreview = imagePreviews[index];
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
        
        if (existingImages.includes(removedPreview)) {
            setExistingImages((prev) => prev.filter((img) => img !== removedPreview));
        } else {
            setNewImageFiles((prev) => prev.filter((_, i) => i !== (index - existingImages.length)));
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
        submitData.append('existingImages', JSON.stringify(existingImages));

        newImageFiles.forEach((file) => {
            submitData.append('images[]', file);
        });

        try {
            await api.post(`/admin/activities/${id}`, submitData);
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
            <Container maxWidth="xl">
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
                                value={formData.date ? formData.date.substring(0, 10) : ''}
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
                                                        image={getMediaUrl(preview)}
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
