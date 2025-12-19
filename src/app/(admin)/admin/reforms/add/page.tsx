'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
    Visibility as VisibilityIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

export default function AddReformPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        details: [''],
        files: [] as File[],
        fileTypes: [] as string[],
    });
    const [dragActive, setDragActive] = useState(false);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState('');
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const handleChange = (field: keyof typeof formData, value: string | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleDetailChange = (index: number, value: string) => {
        const newDetails = [...formData.details];
        newDetails[index] = value;
        setFormData((prev) => ({ ...prev, details: newDetails }));
    };

    const addDetail = () => {
        setFormData((prev) => ({ ...prev, details: [...prev.details, ''] }));
    };

    const removeDetail = (index: number) => {
        if (formData.details.length > 1) {
            const newDetails = formData.details.filter((_, i) => i !== index);
            setFormData((prev) => ({ ...prev, details: newDetails }));
        }
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

        // Determine file types for all selected files
        const fileTypes = fileArray.map((file) => {
            if (file.type.startsWith('image/')) {
                return 'image';
            }
            return file.name.split('.').pop() || 'pdf';
        });

        // Create previews for all files
        const previews = fileArray.map((file) => URL.createObjectURL(file));

        setFormData((prev) => ({
            ...prev,
            files: fileArray,
            fileTypes,
        }));
        setFilePreviews(previews);
        setError('');
    };

    const handleRemoveFile = (index: number) => {
        const newFiles = formData.files.filter((_, i) => i !== index);
        const newFileTypes = formData.fileTypes.filter((_, i) => i !== index);
        const newPreviews = filePreviews.filter((_, i) => i !== index);

        // Revoke object URL to prevent memory leaks
        URL.revokeObjectURL(filePreviews[index]);

        setFormData({ ...formData, files: newFiles, fileTypes: newFileTypes });
        setFilePreviews(newPreviews);
    };

    const handleOpenImageGallery = (index: number) => {
        setSelectedImageIndex(index);
        setOpenImageGallery(true);
    };

    const handleCloseImageGallery = () => {
        setOpenImageGallery(false);
        setSelectedImageIndex(0);
    };

    const handlePrevImage = () => {
        const imageIndexes = getImageIndexes();
        const currentPos = imageIndexes.indexOf(selectedImageIndex);
        const newPos = currentPos === 0 ? imageIndexes.length - 1 : currentPos - 1;
        setSelectedImageIndex(imageIndexes[newPos]);
    };

    const handleNextImage = () => {
        const imageIndexes = getImageIndexes();
        const currentPos = imageIndexes.indexOf(selectedImageIndex);
        const newPos = currentPos === imageIndexes.length - 1 ? 0 : currentPos + 1;
        setSelectedImageIndex(imageIndexes[newPos]);
    };

    const getImageIndexes = () => {
        return filePreviews
            .map((_, index) => index)
            .filter((index) => {
                return formData.fileTypes[index] === 'image';
            });
    };

    const getImagePreviews = () => {
        return filePreviews.filter((_, index) => {
            return formData.fileTypes[index] === 'image';
        });
    };

    const handleSave = async () => {
        setError('');
        setSubmitLoading(true);

        // Validation
        if (!formData.title.trim() || !formData.description.trim()) {
            setError('Vui lòng điền đầy đủ tiêu đề và mô tả');
            setSubmitLoading(false);
            return;
        }

        const validDetails = formData.details.filter((detail) => detail.trim() !== '');
        if (validDetails.length === 0) {
            setError('Vui lòng thêm ít nhất một mục chi tiết');
            setSubmitLoading(false);
            return;
        }

        if (formData.files.length === 0) {
            setError('Vui lòng chọn ít nhất một file');
            setSubmitLoading(false);
            return;
        }

        try {
            // Send all files in one request
            const submitData = new FormData();
            submitData.append('title', formData.title.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('details', JSON.stringify(validDetails));

            // Append all files with same key 'file'
            for (let i = 0; i < formData.files.length; i++) {
                submitData.append('file', formData.files[i]);
                submitData.append(`fileType_${i}`, formData.fileTypes[i]);
            }

            const res = await fetch('/api/admin/reforms', {
                method: 'POST',
                body: submitData,
            });

            if (!res.ok) {
                const err = await res.json();
                setError(err.error || 'Lỗi tạo mục công khai');
                setSubmitLoading(false);
                return;
            }

            toast.success(`Đã tạo mục công khai với ${formData.files.length} file thành công`);
            router.push('/admin/reforms');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            setSubmitLoading(false);
        }
    };

    const handleCancel = () => {
        router.push('/admin/reforms');
    };

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                {/* Breadcrumb */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link
                        component="button"
                        variant="body2"
                        onClick={() => router.push('/admin/reforms')}
                        sx={{ cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'none' }}
                    >
                        Quản Lý Công Khai Thông Tin
                    </Link>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        Thêm Mục Công Khai Mới
                    </Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Thêm Mục Công Khai Thông Tin Mới
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Điền đầy đủ thông tin để thêm mục công khai mới vào hệ thống
                    </Typography>
                </Box>

                {/* Error Alert */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* Info Box */}
                <Card
                    sx={{
                        p: 3,
                        mb: 4,
                        bgcolor: 'rgba(124, 179, 66, 0.08)',
                        border: '1px solid rgba(124, 179, 66, 0.2)',
                    }}
                >
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--primary-color)', mb: 1 }}>
                        ℹ️ Hướng dẫn
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8 }}>
                        • Các trường có dấu <span style={{ color: '#d32f2f' }}>*</span> là bắt buộc
                        <br />
                        • Tiêu đề nên rõ ràng và mô tả đúng nội dung công khai
                        <br />
                        • Mô tả tóm tắt giúp người dùng hiểu nhanh mục đích công khai
                        <br />
                        • Chi tiết là danh sách các nội dung cụ thể được công khai
                        <br />• File đính kèm có thể là PDF hoặc hình ảnh minh họa
                    </Typography>
                </Card>

                {/* Form Card */}
                <Card sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        {/* Tiêu Đề */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Tiêu Đề *"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                multiline
                                rows={2}
                                placeholder="Nhập tiêu đề mục công khai..."
                                helperText="Tiêu đề đầy đủ của mục công khai thông tin"
                            />
                        </Grid>

                        {/* Mô Tả */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Mô Tả *"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                multiline
                                rows={3}
                                placeholder="Nhập mô tả tóm tắt..."
                                helperText="Mô tả ngắn gọn về nội dung công khai"
                            />
                        </Grid>

                        {/* Chi Tiết */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                Nội dung chi tiết *
                            </Typography>
                            {formData.details.map((detail, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label={`Chi tiết ${index + 1}`}
                                        value={detail}
                                        onChange={(e) => handleDetailChange(index, e.target.value)}
                                        placeholder="Nhập nội dung chi tiết..."
                                    />
                                    {formData.details.length > 1 && (
                                        <IconButton
                                            onClick={() => removeDetail(index)}
                                            color="error"
                                            sx={{ alignSelf: 'center' }}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}
                            <Button startIcon={<AddIcon />} onClick={addDetail} variant="outlined" sx={{ mt: 1 }}>
                                Thêm chi tiết
                            </Button>
                        </Grid>

                        {/* File Upload */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                File đính kèm *
                            </Typography>
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
                                    Kéo thả file vào đây hoặc click để chọn
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    Hỗ trợ: PDF, DOC, DOCX, JPG, PNG, GIF
                                </Typography>
                            </Box>

                            {/* File Previews */}
                            {formData.files.length > 0 && (
                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                                        File đã chọn ({formData.files.length}):
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {filePreviews.map((preview, index) => (
                                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                                <Card sx={{ position: 'relative', height: 200 }}>
                                                    {formData.fileTypes[index] === 'image' ? (
                                                        <CardMedia
                                                            component="img"
                                                            height="200"
                                                            image={preview}
                                                            alt={`Preview ${index + 1}`}
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
                                                            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
                                                                {formData.files[index].name}
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
                                                        {formData.fileTypes[index] === 'image' && (
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
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveFile(index)}
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
                                    onClick={handleSave}
                                    disabled={submitLoading}
                                    sx={{
                                        bgcolor: 'var(--primary-color)',
                                        '&:hover': { bgcolor: 'var(--accent-color)' },
                                        px: 4,
                                    }}
                                >
                                    {submitLoading ? 'Đang lưu...' : 'Lưu'}
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
                            {getImagePreviews().length > 0 && (
                                <>
                                    {getImagePreviews().length > 1 && (
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
                                        src={filePreviews[selectedImageIndex]}
                                        alt={`Image ${selectedImageIndex + 1}`}
                                        sx={{
                                            maxWidth: '100%',
                                            maxHeight: '80vh',
                                            objectFit: 'contain',
                                        }}
                                    />

                                    {getImagePreviews().length > 1 && (
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

                        {getImagePreviews().length > 1 && (
                            <Typography
                                sx={{
                                    textAlign: 'center',
                                    color: 'white',
                                    py: 2,
                                }}
                            >
                                {getImageIndexes().indexOf(selectedImageIndex) + 1} / {getImagePreviews().length}
                            </Typography>
                        )}
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
}
