'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    TextField,
    MenuItem,
    Button,
    Card,
    Grid,
    Stack,
    Breadcrumbs,
    Link,
    Alert,
    IconButton,
    CircularProgress,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
} from '@mui/icons-material';

interface DocumentCategory {
    id: string;
    name: string;
    type: 'document_type' | 'document_field';
}

export default function UpdateDocumentPage() {
    const router = useRouter();
    const params = useParams();
    const documentId = params?.id as string;
    const [formData, setFormData] = useState({
        title: '',
        type: '',
        number: '',
        date: '',
        field: '',
        summary: '',
        fileUrl: '',
        files: [] as File[],
        fileTypes: [] as string[],
        isNew: false,
    });
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    // Categories state
    const [documentTypes, setDocumentTypes] = useState<string[]>([]);
    const [documentFields, setDocumentFields] = useState<string[]>([]);
    const [, setCategoriesLoading] = useState(true);
    const [previewFileTypes, setPreviewFileTypes] = useState<string[]>([]);

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

    useEffect(() => {
        loadCategories();
    }, [loadCategories]);

    useEffect(() => {
        const loadDocument = async () => {
            try {
                const res = await fetch(`/api/admin/documents/${documentId}`);
                if (!res.ok) throw new Error('Error loading document');
                const data = await res.json();

                // Extract file URLs and types from files array
                interface FileItem {
                    fileUrl: string;
                    fileType: string;
                }
                const fileUrls = data.files?.map((f: FileItem) => f.fileUrl) || [];
                const fileTypes = data.files?.map((f: FileItem) => f.fileType) || [];

                setFormData({
                    title: data.title,
                    type: data.type,
                    number: data.number,
                    date: data.date.split('T')[0], // Format date input
                    field: data.field,
                    summary: data.summary || '',
                    fileUrl: fileUrls[0] || '', // Keep first URL for backward compatibility
                    files: [],
                    fileTypes: [],
                    isNew: data.isNew || false,
                });
                setFilePreviews(fileUrls); // Preview existing URLs
                setPreviewFileTypes(fileTypes); // Store file types for preview
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || 'Lỗi tải dữ liệu');
                setLoading(false);
            }
        };

        if (documentId) {
            loadDocument();
        }
    }, [documentId]);

    const handleChange = (field: string, value: string | File | null | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
            setError('Vui lòng chọn file PDF, DOC, DOCX hoặc Hình ảnh');
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
        setPreviewFileTypes(fileTypes);
        setError('');
    };

    const handleRemoveFile = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            files: prev.files.filter((_, i) => i !== index),
            fileTypes: prev.fileTypes.filter((_, i) => i !== index),
        }));
        setFilePreviews((prev) => prev.filter((_, i) => i !== index));
        setPreviewFileTypes((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        setError('');
        if (!formData.title || !formData.type || !formData.number || !formData.date || !formData.field) {
            setError('Vui lòng điền đầy đủ các trường bắt buộc');
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('type', formData.type);
            submitData.append('number', formData.number);
            submitData.append('date', formData.date);
            submitData.append('field', formData.field);
            submitData.append('summary', formData.summary);
            submitData.append('isNew', formData.isNew.toString());

            // Append all new files with same key 'file'
            for (let i = 0; i < formData.files.length; i++) {
                submitData.append('file', formData.files[i]);
                submitData.append(`fileType_${i}`, formData.fileTypes[i]);
            }

            const res = await fetch(`/api/admin/documents/${documentId}`, {
                method: 'PUT',
                body: submitData,
            });

            if (!res.ok) {
                const err = await res.json();
                setError(err.error || 'Lỗi cập nhật tài liệu');
                return;
            }

            router.push('/admin/documents');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra. Vui lòng thử lại.');
        }
    };

    const handleCancel = () => {
        router.push('/admin/documents');
    };

    if (loading) {
        return (
            <Box
                sx={{
                    py: 4,
                    bgcolor: 'var(--background)',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error && error === 'Không tìm thấy tài liệu') {
        return (
            <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
                <Container maxWidth="lg">
                    <Alert severity="error">{error}</Alert>
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.push('/admin/documents')}
                        sx={{ mt: 2 }}
                    >
                        Quay Lại
                    </Button>
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
                        onClick={() => router.push('/admin/documents')}
                        sx={{ cursor: 'pointer', color: 'var(--primary-color)', textDecoration: 'none' }}
                    >
                        Quản Lý Tài Liệu
                    </Link>
                    <Typography variant="body2" sx={{ color: 'var(--foreground)' }}>
                        Chỉnh Sửa Tài Liệu
                    </Typography>
                </Breadcrumbs>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Chỉnh Sửa Tài Liệu Văn Bản
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                        Cập nhật thông tin tài liệu trong hệ thống
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
                        {/* Tiêu Đề */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Tiêu Đề *"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                multiline
                                rows={3}
                                placeholder="Nhập tiêu đề tài liệu..."
                                helperText="Tiêu đề đầy đủ của tài liệu"
                            />
                        </Grid>

                        {/* Loại Văn Bản & Số Văn Bản */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Loại Văn Bản *"
                                value={formData.type}
                                onChange={(e) => handleChange('type', e.target.value)}
                                required
                            >
                                {documentTypes.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Số Văn Bản *"
                                value={formData.number}
                                onChange={(e) => handleChange('number', e.target.value)}
                                placeholder="09/2024/TT-BGDĐT"
                                helperText="Ví dụ: 09/2024/TT-BGDĐT"
                            />
                        </Grid>

                        {/* Ngày Ban Hành & Lĩnh Vực */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Ngày Ban Hành *"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Lĩnh Vực *"
                                value={formData.field}
                                onChange={(e) => handleChange('field', e.target.value)}
                                required
                            >
                                {documentFields.map((field) => (
                                    <MenuItem key={field} value={field}>
                                        {field}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Tóm Tắt */}
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Tóm Tắt"
                                value={formData.summary}
                                onChange={(e) => handleChange('summary', e.target.value)}
                                multiline
                                rows={4}
                                placeholder="Nhập tóm tắt nội dung tài liệu..."
                                helperText="Mô tả ngắn gọn nội dung chính của tài liệu"
                            />
                        </Grid>

                        {/* File Upload - Drag & Drop */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                                Tải lên tài liệu {formData.files.length > 0 ? '(Tùy chọn)' : '(Tùy chọn)'}
                            </Typography>
                            <Box
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                sx={{
                                    border: '2px dashed',
                                    borderColor: dragActive ? 'var(--primary-color)' : '#ccc',
                                    borderRadius: 2,
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    bgcolor: dragActive ? 'rgba(124, 179, 66, 0.05)' : 'transparent',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <input
                                    type="file"
                                    accept="image/*,.pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                    onChange={handleFileInputChange}
                                    style={{ display: 'none' }}
                                    id="file-input"
                                    multiple
                                />
                                <label htmlFor="file-input" style={{ cursor: 'pointer', display: 'block' }}>
                                    <CloudUploadIcon sx={{ fontSize: 48, color: 'var(--primary-color)', mb: 1 }} />
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        Kéo thả tài liệu vào đây hoặc nhấp để chọn
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#999' }}>
                                        Hỗ trợ các định dạng: PDF, DOC, DOCX, Hình ảnh
                                    </Typography>
                                </label>
                            </Box>
                        </Grid>

                        {/* File Previews - New Files */}
                        {filePreviews.length > 0 && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                                    Các file đã chọn ({filePreviews.length})
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {filePreviews.map((preview, index) => (
                                        <Card
                                            key={index}
                                            sx={{
                                                p: 2,
                                                bgcolor: formData.files[index]
                                                    ? 'rgba(124, 179, 66, 0.05)'
                                                    : 'rgba(33, 150, 243, 0.05)',
                                                border: formData.files[index]
                                                    ? '1px solid var(--primary-color)'
                                                    : '1px solid rgba(33, 150, 243, 0.3)',
                                            }}
                                        >
                                            {previewFileTypes[index] === 'image' ? (
                                                // Image Preview
                                                <Box sx={{ position: 'relative' }}>
                                                    <Box
                                                        component="img"
                                                        src={preview}
                                                        alt="Preview"
                                                        sx={{
                                                            width: '100%',
                                                            maxHeight: 300,
                                                            objectFit: 'contain',
                                                            borderRadius: 1,
                                                            mb: 2,
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                    >
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {formData.files[index]?.name || 'Hình ảnh hiện tại'}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#999' }}>
                                                                Loại: Hình ảnh
                                                                {formData.files[index] && ' (mới)'}
                                                            </Typography>
                                                        </Box>
                                                        {formData.files[index] && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRemoveFile(index)}
                                                                sx={{
                                                                    bgcolor: '#d32f2f',
                                                                    color: '#fff',
                                                                    '&:hover': { bgcolor: '#b71c1c' },
                                                                }}
                                                            >
                                                                <CloseIcon />
                                                            </IconButton>
                                                        )}
                                                    </Box>
                                                </Box>
                                            ) : (
                                                // File Preview
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                    }}
                                                >
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Box
                                                            sx={{
                                                                width: 40,
                                                                height: 40,
                                                                borderRadius: 1,
                                                                bgcolor: formData.files[index]
                                                                    ? 'var(--primary-color)'
                                                                    : 'rgba(33, 150, 243, 0.8)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: 'white',
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {previewFileTypes[index]?.toUpperCase().charAt(0) || '?'}
                                                        </Box>
                                                        <Box>
                                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                                {formData.files[index]?.name || 'File hiện tại'}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#999' }}>
                                                                Loại:{' '}
                                                                {previewFileTypes[index]?.toUpperCase() || 'UNKNOWN'}
                                                                {formData.files[index] && ' (mới)'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                    {formData.files[index] && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleRemoveFile(index)}
                                                            sx={{
                                                                bgcolor: '#d32f2f',
                                                                color: '#fff',
                                                                '&:hover': { bgcolor: '#b71c1c' },
                                                            }}
                                                        >
                                                            <CloseIcon />
                                                        </IconButton>
                                                    )}
                                                </Box>
                                            )}
                                        </Card>
                                    ))}
                                </Box>
                            </Grid>
                        )}

                        {/* Divider */}
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ borderTop: '1px solid #e0e0e0', my: 2 }} />
                        </Grid>

                        {/* Action Buttons */}
                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<ArrowBackIcon />}
                                        onClick={handleCancel}
                                        sx={{ color: '#666', borderColor: '#ddd' }}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={<SaveIcon />}
                                        onClick={handleSave}
                                        sx={{ bgcolor: 'var(--primary-color)' }}
                                    >
                                        Cập Nhật Tài Liệu
                                    </Button>
                                </Stack>
                            </Stack>
                        </Grid>
                    </Grid>
                </Card>

                {/* Info Box */}
                <Card
                    sx={{
                        p: 3,
                        mt: 4,
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
                        • Tiêu đề nên đầy đủ và mô tả rõ nội dung tài liệu
                        <br />
                        • Số văn bản phải theo định dạng chuẩn (ví dụ: 09/2024/TT-BGDĐT)
                        <br />
                        • Tóm tắt giúp người dùng nhanh chóng hiểu nội dung chính
                        <br />
                        • File hiện tại sẽ được giữ nguyên nếu không tải lên file mới
                        <br />• Nhấn &ldquo;Xóa Tài Liệu&rdquo; để xóa vĩnh viễn tài liệu này khỏi hệ thống
                    </Typography>
                </Card>
            </Container>
        </Box>
    );
}
