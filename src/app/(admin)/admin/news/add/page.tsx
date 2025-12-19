'use client';

import React, { useState } from 'react';
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
import { useRouter } from 'next/navigation';
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

export default function AddNewsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        content: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
    });
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const categories = ['Tiểu học', 'Trung học'];

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

        setImages((prev) => [...prev, ...files]);

        // Create previews
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews((prev) => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOpenImageGallery = (index: number) => {
        setSelectedImageIndex(index);
        setOpenImageGallery(true);
    };

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? imagePreviews.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev === imagePreviews.length - 1 ? 0 : prev + 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.content || !formData.category) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        if (images.length === 0) {
            toast.error('Vui lòng tải lên ít nhất một ảnh');
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

            // Append images
            images.forEach((image) => {
                submitData.append('images', image);
            });

            const response = await fetch('/api/admin/news', {
                method: 'POST',
                body: submitData,
            });

            if (!response.ok) {
                throw new Error('Failed to create news');
            }

            toast.success('Tạo tin tức thành công');
            router.push('/admin/news');
        } catch (error) {
            console.error('Error creating news:', error);
            toast.error('Có lỗi xảy ra khi tạo tin tức');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton onClick={() => router.back()} sx={{ mr: 2 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                    Thêm tin tức mới
                </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* Main Content */}
                    <Box sx={{ flex: 2 }}>
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
                    </Box>

                    {/* Sidebar */}
                    <Box sx={{ flex: 1 }}>
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

                        {/* Image Upload */}
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Hình ảnh *
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<CloudUploadIcon />}
                                fullWidth
                                sx={{ mb: 2 }}
                            >
                                Tải lên ảnh
                                <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
                            </Button>

                            {imagePreviews.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Ảnh đã tải lên ({imagePreviews.length})
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                                        {imagePreviews.map((preview, index) => (
                                            <Box key={index}>
                                                <Card sx={{ position: 'relative' }}>
                                                    <CardMedia
                                                        component="img"
                                                        height="100"
                                                        image={preview}
                                                        alt={`Preview ${index + 1}`}
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
                                                        onClick={() => removeImage(index)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Card>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Paper>
                    </Box>
                </Box>

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
                        {loading ? <CircularProgress size={24} /> : 'Tạo tin tức'}
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
                        {imagePreviews.length > 1 && (
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
                            src={imagePreviews[selectedImageIndex]}
                            alt={`Image ${selectedImageIndex + 1}`}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                            }}
                        />

                        {imagePreviews.length > 1 && (
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

                    {imagePreviews.length > 1 && (
                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'white',
                                py: 2,
                            }}
                        >
                            {selectedImageIndex + 1} / {imagePreviews.length}
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
