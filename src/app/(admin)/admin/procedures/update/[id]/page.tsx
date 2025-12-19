'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Card,
    Grid,
    Stack,
    Breadcrumbs,
    Link,
    IconButton,
    Alert,
    Dialog,
    DialogContent,
    CardMedia,
} from '@mui/material';
import {
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Save as SaveIcon,
    Visibility as VisibilityIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
    Download as DownloadIcon,
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
    content: ProcedureContent[];
    files: ProcedureFile[];
}

interface ContentSection {
    title: string;
    items: string[];
}

export default function UpdateProcedurePage() {
    const router = useRouter();
    const params = useParams();
    const procedureId = params.id as string;

    const [procedure, setProcedure] = useState<Procedure | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        content: [{ title: '', items: [''] }] as ContentSection[],
    });
    const [existingFiles, setExistingFiles] = useState<ProcedureFile[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [newFileTypes, setNewFileTypes] = useState<string[]>([]);
    const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Fetch procedure data
    useEffect(() => {
        const fetchProcedure = async () => {
            try {
                const res = await fetch(`/api/admin/procedures/${procedureId}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch procedure');
                }

                const data = await res.json();
                setProcedure(data);
                setFormData({
                    title: data.title,
                    category: data.category,
                    description: data.description,
                    content: data.content.length > 0 ? data.content : [{ title: '', items: [''] }],
                });
                setExistingFiles(data.files || []);
                setError('');
            } catch (err) {
                setError((err as Error).message || 'Có lỗi xảy ra khi tải dữ liệu');
                console.error('Error fetching procedure:', err);
            } finally {
                setLoading(false);
            }
        };

        if (procedureId) {
            fetchProcedure();
        }
    }, [procedureId]);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleContentChange = (sectionIndex: number, field: 'title' | 'items', value: string | string[]) => {
        const newContent = [...formData.content];
        if (field === 'title') {
            newContent[sectionIndex].title = value as string;
        } else {
            newContent[sectionIndex].items = value as string[];
        }
        setFormData((prev) => ({ ...prev, content: newContent }));
    };

    const handleItemChange = (sectionIndex: number, itemIndex: number, value: string) => {
        const newContent = [...formData.content];
        newContent[sectionIndex].items[itemIndex] = value;
        setFormData((prev) => ({ ...prev, content: newContent }));
    };

    const addContentSection = () => {
        setFormData((prev) => ({
            ...prev,
            content: [...prev.content, { title: '', items: [''] }],
        }));
    };

    const removeContentSection = (index: number) => {
        if (formData.content.length > 1) {
            const newContent = formData.content.filter((_, i) => i !== index);
            setFormData((prev) => ({ ...prev, content: newContent }));
        }
    };

    const addItem = (sectionIndex: number) => {
        const newContent = [...formData.content];
        newContent[sectionIndex].items.push('');
        setFormData((prev) => ({ ...prev, content: newContent }));
    };

    const removeItem = (sectionIndex: number, itemIndex: number) => {
        const newContent = [...formData.content];
        if (newContent[sectionIndex].items.length > 1) {
            newContent[sectionIndex].items = newContent[sectionIndex].items.filter((_, i) => i !== itemIndex);
            setFormData((prev) => ({ ...prev, content: newContent }));
        }
    };

    // File handling functions
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
        const fileArray = Array.from(files).filter((file) =>
            [
                'image/jpeg',
                'image/png',
                'image/gif',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ].includes(file.type),
        );

        if (fileArray.length === 0) {
            toast.error('Vui lòng chọn file PDF, DOC, DOCX hoặc Hình ảnh');
            return;
        }

        const fileTypes = fileArray.map((file) => {
            if (file.type.startsWith('image/')) {
                return 'image';
            }
            return file.name.split('.').pop() || 'pdf';
        });

        const previews = fileArray.map((file) => URL.createObjectURL(file));

        setNewFiles(fileArray);
        setNewFileTypes(fileTypes);
        setNewFilePreviews(previews);
        setError('');
    };

    const handleRemoveExistingFile = (index: number) => {
        const newExistingFiles = existingFiles.filter((_, i) => i !== index);
        setExistingFiles(newExistingFiles);
    };

    const handleRemoveNewFile = (index: number) => {
        const newFilesList = newFiles.filter((_, i) => i !== index);
        const newFileTypesList = newFileTypes.filter((_, i) => i !== index);
        const newPreviewsList = newFilePreviews.filter((_, i) => i !== index);

        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(newFilePreviews[index]);

        setNewFiles(newFilesList);
        setNewFileTypes(newFileTypesList);
        setNewFilePreviews(newPreviewsList);
    };

    // Gallery functions
    const getAllFiles = () => [
        ...existingFiles,
        ...newFiles.map((file, index) => ({
            id: `new_${index}`,
            fileUrl: newFilePreviews[index],
            fileType: newFileTypes[index],
            fileName: file.name,
            isNew: true,
        })),
    ];

    const getImageFiles = () => getAllFiles().filter((file) => file.fileType === 'image');

    const handleOpenImageGallery = (fileIndex: number) => {
        const allFiles = getAllFiles();
        const imageFiles = getImageFiles();
        const targetFile = allFiles[fileIndex];
        const imageIndex = imageFiles.findIndex((img) => img.id === targetFile.id);

        if (imageIndex !== -1) {
            setSelectedImageIndex(imageIndex);
            setOpenImageGallery(true);
        }
    };

    const handleCloseImageGallery = () => {
        setOpenImageGallery(false);
        setSelectedImageIndex(0);
    };

    const handlePrevImage = () => {
        const imageFiles = getImageFiles();
        setSelectedImageIndex(selectedImageIndex === 0 ? imageFiles.length - 1 : selectedImageIndex - 1);
    };

    const handleNextImage = () => {
        const imageFiles = getImageFiles();
        setSelectedImageIndex(selectedImageIndex === imageFiles.length - 1 ? 0 : selectedImageIndex + 1);
    };

    const handleSave = async () => {
        setError('');
        setSubmitLoading(true);

        // Validation
        if (!formData.title.trim() || !formData.category.trim() || !formData.description.trim()) {
            setError('Vui lòng điền đầy đủ tiêu đề, danh mục và mô tả');
            setSubmitLoading(false);
            return;
        }

        const validContent = formData.content.filter(
            (section) => section.title.trim() !== '' && section.items.some((item) => item.trim() !== ''),
        );
        if (validContent.length === 0) {
            setError('Vui lòng thêm ít nhất một mục nội dung');
            setSubmitLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title.trim());
            submitData.append('category', formData.category.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('content', JSON.stringify(validContent));
            submitData.append('existingFiles', JSON.stringify(existingFiles));

            // Append new files
            for (let i = 0; i < newFiles.length; i++) {
                submitData.append('file', newFiles[i]);
                submitData.append(`fileType_${i}`, newFileTypes[i]);
            }

            const res = await fetch(`/api/admin/procedures/${procedureId}`, {
                method: 'PUT',
                body: submitData,
            });

            if (!res.ok) {
                const err = await res.json();
                setError(err.error || 'Lỗi cập nhật quy chế');
                setSubmitLoading(false);
                return;
            }

            toast.success('Cập nhật quy chế thành công');
            router.push('/admin/procedures');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            setSubmitLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/procedures');
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

    if (!procedure) {
        return (
            <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
                <Container maxWidth="lg">
                    <Alert severity="error">Không tìm thấy quy chế</Alert>
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
                        onClick={() => router.push('/admin/procedures')}
                        sx={{ cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'none' }}
                    >
                        Quản Lý Nội Quy & Quy Chế
                    </Link>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        Chỉnh Sửa Quy Chế
                    </Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Chỉnh Sửa Quy Chế
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Cập nhật thông tin quy chế: {procedure.title}
                    </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Form Card */}
                <Card sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        {/* Basic Info */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Tiêu đề *"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="Nhập tiêu đề quy chế..."
                                helperText="Tiêu đề đầy đủ của quy chế"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Danh mục *"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                                placeholder="Ví dụ: Học sinh, Tuyển sinh, Học tập..."
                                helperText="Phân loại quy chế"
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Mô tả *"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                multiline
                                rows={3}
                                placeholder="Nhập mô tả tóm tắt..."
                                helperText="Mô tả ngắn gọn về nội dung quy chế"
                            />
                        </Grid>

                        {/* Content Sections */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Nội dung chi tiết *
                            </Typography>
                            {formData.content.map((section, sectionIndex) => (
                                <Card key={sectionIndex} sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0' }}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            mb: 2,
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                            Mục {sectionIndex + 1}
                                        </Typography>
                                        {formData.content.length > 1 && (
                                            <IconButton
                                                onClick={() => removeContentSection(sectionIndex)}
                                                color="error"
                                                size="small"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <TextField
                                        fullWidth
                                        label="Tiêu đề mục"
                                        value={section.title}
                                        onChange={(e) => handleContentChange(sectionIndex, 'title', e.target.value)}
                                        placeholder="Ví dụ: Quy tắc ứng xử cơ bản"
                                        sx={{ mb: 2 }}
                                    />

                                    {section.items.map((item, itemIndex) => (
                                        <Box key={itemIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <TextField
                                                fullWidth
                                                label={`Nội dung ${itemIndex + 1}`}
                                                value={item}
                                                onChange={(e) =>
                                                    handleItemChange(sectionIndex, itemIndex, e.target.value)
                                                }
                                                placeholder="Nhập nội dung cụ thể..."
                                            />
                                            {section.items.length > 1 && (
                                                <IconButton
                                                    onClick={() => removeItem(sectionIndex, itemIndex)}
                                                    color="error"
                                                    sx={{ alignSelf: 'center' }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            )}
                                        </Box>
                                    ))}

                                    <Button
                                        startIcon={<AddIcon />}
                                        onClick={() => addItem(sectionIndex)}
                                        variant="outlined"
                                        size="small"
                                        sx={{ mt: 1 }}
                                    >
                                        Thêm nội dung
                                    </Button>
                                </Card>
                            ))}

                            <Button
                                startIcon={<AddIcon />}
                                onClick={addContentSection}
                                variant="outlined"
                                sx={{ mt: 1 }}
                            >
                                Thêm mục mới
                            </Button>
                        </Grid>

                        {/* File Management */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                File đính kèm
                            </Typography>

                            {/* Existing Files */}
                            {existingFiles.length > 0 && (
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                        File hiện có ({existingFiles.length}):
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {existingFiles.map((file, index) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
                                                <Card sx={{ position: 'relative', height: 200 }}>
                                                    {file.fileType === 'image' ? (
                                                        <CardMedia
                                                            component="img"
                                                            height="200"
                                                            image={file.fileUrl}
                                                            alt={file.fileName || `File ${index + 1}`}
                                                            sx={{ objectFit: 'cover', cursor: 'pointer' }}
                                                            onClick={() => handleOpenImageGallery(index)}
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                bgcolor: '#f5f5f5',
                                                                flexDirection: 'column',
                                                            }}
                                                        >
                                                            <CloudUploadIcon sx={{ fontSize: 48, color: '#999' }} />
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    mt: 1,
                                                                    color: '#666',
                                                                    textAlign: 'center',
                                                                    px: 1,
                                                                }}
                                                            >
                                                                {file.fileName || `File ${index + 1}`}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            display: 'flex',
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        {file.fileType === 'image' && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleOpenImageGallery(index)}
                                                                sx={{
                                                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                                                    color: 'white',
                                                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                                                }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                        {file.fileType !== 'image' && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => window.open(file.fileUrl, '_blank')}
                                                                sx={{
                                                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                                                    color: 'white',
                                                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                                                }}
                                                            >
                                                                <DownloadIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveExistingFile(index)}
                                                            sx={{
                                                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                                                            }}
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* New File Upload */}
                            <Box
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                sx={{
                                    border: `2px dashed ${dragActive ? 'var(--primary-color)' : '#ccc'}`,
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    bgcolor: dragActive ? 'rgba(124, 179, 66, 0.05)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                }}
                                onClick={() => document.getElementById('file-input')?.click()}
                            >
                                <input
                                    id="file-input"
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,image/*"
                                    onChange={handleFileInputChange}
                                    style={{ display: 'none' }}
                                />
                                <CloudUploadIcon sx={{ fontSize: 48, color: '#666', mb: 2 }} />
                                <Typography variant="h6" sx={{ mb: 1 }}>
                                    Thêm file mới
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Kéo thả file vào đây hoặc click để chọn
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Hỗ trợ: PDF, DOC, DOCX, JPG, PNG, GIF
                                </Typography>
                            </Box>

                            {/* New File Previews */}
                            {newFiles.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                        File mới ({newFiles.length}):
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {newFilePreviews.map((preview, index) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                                <Card sx={{ position: 'relative', height: 200 }}>
                                                    {newFileTypes[index] === 'image' ? (
                                                        <CardMedia
                                                            component="img"
                                                            height="200"
                                                            image={preview}
                                                            alt={`New file ${index + 1}`}
                                                            sx={{ objectFit: 'cover', cursor: 'pointer' }}
                                                            onClick={() =>
                                                                handleOpenImageGallery(existingFiles.length + index)
                                                            }
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                height: '100%',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                bgcolor: '#f5f5f5',
                                                                flexDirection: 'column',
                                                            }}
                                                        >
                                                            <CloudUploadIcon sx={{ fontSize: 48, color: '#999' }} />
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    mt: 1,
                                                                    color: '#666',
                                                                    textAlign: 'center',
                                                                    px: 1,
                                                                }}
                                                            >
                                                                {newFiles[index].name}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    <Box
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 8,
                                                            right: 8,
                                                            display: 'flex',
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        {newFileTypes[index] === 'image' && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() =>
                                                                    handleOpenImageGallery(existingFiles.length + index)
                                                                }
                                                                sx={{
                                                                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                                                                    color: 'white',
                                                                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                                                                }}
                                                            >
                                                                <VisibilityIcon fontSize="small" />
                                                            </IconButton>
                                                        )}
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveNewFile(index)}
                                                            sx={{
                                                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                                                            }}
                                                        >
                                                            <CloseIcon fontSize="small" />
                                                        </IconButton>
                                                    </Box>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Grid>

                        {/* Action Buttons */}
                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                                <Button
                                    variant="contained"
                                    startIcon={<SaveIcon />}
                                    onClick={handleSave}
                                    disabled={submitLoading}
                                    sx={{
                                        bgcolor: 'var(--primary-color)',
                                        '&:hover': { bgcolor: 'var(--accent-color)' },
                                        px: 4,
                                    }}
                                >
                                    {submitLoading ? 'Đang lưu...' : 'Cập nhật'}
                                </Button>
                                <Button variant="outlined" onClick={handleCancel} sx={{ px: 4 }}>
                                    Hủy
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Card>

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
                            {getImageFiles().length > 0 && (
                                <>
                                    {getImageFiles().length > 1 && (
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
                                        src={getImageFiles()[selectedImageIndex]?.fileUrl}
                                        alt={`Image ${selectedImageIndex + 1}`}
                                        sx={{
                                            maxWidth: '100%',
                                            maxHeight: '80vh',
                                            objectFit: 'contain',
                                        }}
                                    />

                                    {getImageFiles().length > 1 && (
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
                                </>
                            )}
                        </Box>

                        {getImageFiles().length > 1 && (
                            <Typography
                                sx={{
                                    textAlign: 'center',
                                    color: 'white',
                                    py: 2,
                                }}
                            >
                                {selectedImageIndex + 1} / {getImageFiles().length}
                            </Typography>
                        )}
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
}
