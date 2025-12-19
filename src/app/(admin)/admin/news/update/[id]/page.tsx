'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Grid,
    Card,
    CardMedia,
    IconButton,
    Dialog,
    DialogContent,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    CloudUpload as CloudUploadIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Tiptap Editor Component
const TiptapEditor = ({ content, onChange }: { content: string; onChange: (content: string) => void }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <Box sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
            {/* Toolbar */}
            <Box sx={{ p: 1, borderBottom: '1px solid #ddd', display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                    size="small"
                    variant={editor.isActive('bold') ? 'contained' : 'outlined'}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    B
                </Button>
                <Button
                    size="small"
                    variant={editor.isActive('italic') ? 'contained' : 'outlined'}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    I
                </Button>
                <Button
                    size="small"
                    variant={editor.isActive('strike') ? 'contained' : 'outlined'}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    S
                </Button>
                <Button
                    size="small"
                    variant={editor.isActive('heading', { level: 1 }) ? 'contained' : 'outlined'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    H1
                </Button>
                <Button
                    size="small"
                    variant={editor.isActive('heading', { level: 2 }) ? 'contained' : 'outlined'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    H2
                </Button>
                <Button
                    size="small"
                    variant={editor.isActive('heading', { level: 3 }) ? 'contained' : 'outlined'}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                >
                    H3
                </Button>
                <Button
                    size="small"
                    variant={editor.isActive('bulletList') ? 'contained' : 'outlined'}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    •
                </Button>
                <Button
                    size="small"
                    variant={editor.isActive('orderedList') ? 'contained' : 'outlined'}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    1.
                </Button>
                <Button
                    size="small"
                    variant={editor.isActive('blockquote') ? 'contained' : 'outlined'}
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                >
                    &quot;
                </Button>
            </Box>

            {/* Editor Content */}
            <Box sx={{ p: 2, minHeight: 300 }}>
                <EditorContent
                    editor={editor}
                    style={{
                        outline: 'none',
                        minHeight: '250px',
                        fontSize: '16px',
                        lineHeight: '1.6',
                    }}
                />
            </Box>
        </Box>
    );
};

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
}

export default function UpdateNewsPage() {
    const router = useRouter();
    const params = useParams();
    const newsId = params.id as string;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        date: '',
    });
    const [existingImages, setExistingImages] = useState<NewsImage[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [allImageUrls, setAllImageUrls] = useState<string[]>([]);

    const categories = ['Tiểu học', 'Trung học'];

    // Load existing news data
    useEffect(() => {
        const loadNews = async () => {
            try {
                const response = await fetch(`/api/admin/news/${newsId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch news');
                }

                const news: News = await response.json();
                setFormData({
                    title: news.title,
                    description: news.description,
                    content: news.content,
                    category: news.category,
                    date: news.date.split('T')[0], // Convert to YYYY-MM-DD format
                });
                setExistingImages(news.images);
                setAllImageUrls(news.images.map((img) => img.imageUrl));
            } catch (error) {
                console.error('Error loading news:', error);
                toast.error('Có lỗi xảy ra khi tải thông tin tin tức');
                router.push('/admin/news');
            } finally {
                setInitialLoading(false);
            }
        };

        if (newsId) {
            loadNews();
        }
    }, [newsId, router]);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const invalidFiles = files.filter((file) => !validTypes.includes(file.type));

        if (invalidFiles.length > 0) {
            toast.error('Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WebP)');
            return;
        }

        // Validate file sizes (max 5MB each)
        const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            toast.error('Kích thước file không được vượt quá 5MB');
            return;
        }

        setNewImages((prev) => [...prev, ...files]);

        // Create previews
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = e.target?.result as string;
                setNewImagePreviews((prev) => [...prev, preview]);
                setAllImageUrls((prev) => [...prev, preview]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index: number) => {
        const removedImage = existingImages[index];
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
        setAllImageUrls((prev) => prev.filter((url) => url !== removedImage.imageUrl));
    };

    const removeNewImage = (index: number) => {
        const removedPreview = newImagePreviews[index];
        setNewImages((prev) => prev.filter((_, i) => i !== index));
        setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
        setAllImageUrls((prev) => prev.filter((url) => url !== removedPreview));
    };

    const handleOpenImageGallery = (index: number) => {
        setSelectedImageIndex(index);
        setOpenImageGallery(true);
    };

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? allImageUrls.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev === allImageUrls.length - 1 ? 0 : prev + 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.content || !formData.category) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (existingImages.length === 0 && newImages.length === 0) {
            toast.error('Vui lòng giữ lại hoặc tải lên ít nhất một ảnh');
            return;
        }

        try {
            setLoading(true);

            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('content', formData.content);
            submitData.append('category', formData.category);
            submitData.append('date', formData.date);

            // Only append new images if there are any
            if (newImages.length > 0) {
                newImages.forEach((image) => {
                    submitData.append('images', image);
                });
            }

            const response = await fetch(`/api/admin/news/${newsId}`, {
                method: 'PUT',
                body: submitData,
            });

            if (!response.ok) {
                throw new Error('Failed to update news');
            }

            toast.success('Cập nhật tin tức thành công');
            router.push('/admin/news');
        } catch (error) {
            console.error('Error updating news:', error);
            toast.error('Có lỗi xảy ra khi cập nhật tin tức');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                    Cập nhật tin tức
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Thông tin cơ bản
                            </Typography>

                            <TextField
                                fullWidth
                                label="Tiêu đề *"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                label="Mô tả ngắn *"
                                multiline
                                rows={3}
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                sx={{ mb: 2 }}
                                helperText="Mô tả ngắn sẽ hiển thị trong danh sách tin tức"
                            />

                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                                Nội dung *
                            </Typography>
                            <TiptapEditor
                                content={formData.content}
                                onChange={(content) => handleInputChange('content', content)}
                            />
                        </Paper>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Cài đặt
                            </Typography>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Danh mục *</InputLabel>
                                <Select
                                    value={formData.category}
                                    label="Danh mục *"
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Ngày xuất bản *"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleInputChange('date', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Paper>

                        {/* Image Management */}
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Hình ảnh
                            </Typography>

                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Ảnh hiện tại ({existingImages.length})
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {existingImages.map((image, index) => (
                                            <Grid item xs={6} key={image.id}>
                                                <Card sx={{ position: 'relative' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="100"
                                                        image={image.imageUrl}
                                                        alt={`Existing ${index + 1}`}
                                                        sx={{ cursor: 'pointer' }}
                                                        onClick={() => handleOpenImageGallery(index)}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 4,
                                                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                        }}
                                                        onClick={() => removeExistingImage(index)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* New Images */}
                            {newImagePreviews.length > 0 && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Ảnh mới ({newImagePreviews.length})
                                    </Typography>
                                    <Grid container spacing={1}>
                                        {newImagePreviews.map((preview, index) => (
                                            <Grid item xs={6} key={`new-${index}`}>
                                                <Card sx={{ position: 'relative' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="100"
                                                        image={preview}
                                                        alt={`New ${index + 1}`}
                                                        sx={{ cursor: 'pointer' }}
                                                        onClick={() =>
                                                            handleOpenImageGallery(existingImages.length + index)
                                                        }
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 4,
                                                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                        }}
                                                        onClick={() => removeNewImage(index)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} fullWidth>
                                Thêm ảnh mới
                                <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Submit Button */}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                        sx={{
                            bgcolor: 'var(--primary-color)',
                            '&:hover': { bgcolor: 'var(--accent-color)' },
                        }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Cập nhật tin tức'}
                    </Button>
                    <Button variant="outlined" size="large" onClick={() => router.back()} disabled={loading}>
                        Hủy
                    </Button>
                </Box>
            </form>

            {/* Image Gallery Modal */}
            <Dialog
                open={openImageGallery}
                onClose={() => setOpenImageGallery(false)}
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
                        onClick={() => setOpenImageGallery(false)}
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
                        {allImageUrls.length > 1 && (
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
                        )}

                        <Box
                            component="img"
                            src={allImageUrls[selectedImageIndex]}
                            alt={`Image ${selectedImageIndex + 1}`}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                            }}
                        />

                        {allImageUrls.length > 1 && (
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
                        )}
                    </Box>

                    {allImageUrls.length > 1 && (
                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'white',
                                py: 2,
                            }}
                        >
                            {selectedImageIndex + 1} / {allImageUrls.length}
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
