'use client';

import React, { useState, useEffect } from 'react';
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
    CircularProgress,
    Dialog,
    DialogContent,
    CardMedia,
    MenuItem,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    Save as SaveIcon,
    CloudUpload as CloudUploadIcon,
    Close as CloseIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    NavigateBefore as NavigateBeforeIcon,
    NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { api, getMediaUrl } from '@/lib/api';

interface ReformUpdateClientProps {
    id: string;
}

export default function ReformUpdateClient({ id }: ReformUpdateClientProps) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        description: '',
        details: [''],
        files: [] as File[],
        fileTypes: [] as string[],
    });
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [existingFiles, setExistingFiles] = useState<{ id: string; fileUrl: string; fileType: string }[]>([]);
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.get<{ id: string; name: string }[]>('/admin/categories/reform');
                setCategories(data);
            } catch (err) {
                console.error('Lỗi tải danh mục:', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const loadReform = async () => {
            try {
                const data = await api.get<any>(`/admin/reforms/${id}`);

                setFormData({
                    title: data.title,
                    category: data.category || '',
                    description: data.description,
                    details: data.details || [''],
                    files: [],
                    fileTypes: [],
                });
                setExistingFiles(data.files || []);
                setLoading(false);
            } catch (err) {
                setError((err as Error).message || 'Lỗi tải dữ liệu');
                setLoading(false);
            }
        };

        if (id) {
            loadReform();
        }
    }, [id]);

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

        const fileTypes = fileArray.map((file) => {
            if (file.type.startsWith('image/')) {
                return 'image';
            }
            return file.name.split('.').pop() || 'pdf';
        });

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

    const getImageIndexes = () => {
        const allPreviews = [...existingFiles.map((f) => getMediaUrl(f.fileUrl)), ...filePreviews];
        return allPreviews
            .map((_, index) => index)
            .filter((index) => {
                const fileType =
                    index < existingFiles.length
                        ? existingFiles[index].fileType
                        : formData.fileTypes[index - existingFiles.length];
                return fileType === 'image';
            });
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

    const handleRemoveExistingFile = (index: number) => {
        const newExistingFiles = existingFiles.filter((_, i) => i !== index);
        setExistingFiles(newExistingFiles);
    };

    const handleSave = async () => {
        setError('');
        setSubmitLoading(true);

        if (!formData.title.trim() || !formData.category.trim() || !formData.description.trim()) {
            setError('Vui lòng điền đầy đủ tiêu đề, danh mục và mô tả');
            setSubmitLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title.trim());
            submitData.append('category', formData.category.trim());
            submitData.append('description', formData.description.trim());
            submitData.append('details', JSON.stringify(formData.details.filter(d => d.trim() !== '')));
            submitData.append('existingFiles', JSON.stringify(existingFiles));

            for (let i = 0; i < formData.files.length; i++) {
                submitData.append('file[]', formData.files[i]);
                submitData.append(`fileType_${i}`, formData.fileTypes[i]);
            }

            await api.post(`/admin/reforms/${id}`, submitData);
            toast.success('Cập nhật mục công khai thành công');
            router.push('/admin/reforms');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="xl">
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
                        Cập Nhật Mục Công Khai
                    </Typography>
                </Breadcrumbs>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Cập Nhật Mục Công Khai Thông Tin
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Card sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Tiêu Đề *"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                select
                                fullWidth
                                label="Danh mục *"
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value)}
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.id} value={cat.name}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Mô Tả *"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                multiline
                                rows={3}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Nội dung chi tiết *</Typography>
                            {formData.details.map((detail, index) => (
                                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField
                                        fullWidth
                                        label={`Chi tiết ${index + 1}`}
                                        value={detail}
                                        onChange={(e) => handleDetailChange(index, e.target.value)}
                                    />
                                    <IconButton onClick={() => removeDetail(index)} color="error"><DeleteIcon /></IconButton>
                                </Box>
                            ))}
                            <Button startIcon={<AddIcon />} onClick={addDetail} variant="outlined">Thêm chi tiết</Button>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>File đính kèm</Typography>
                            <Box
                                onDragEnter={handleDrag}
                                onDragOver={handleDrag}
                                onDragLeave={handleDrag}
                                onDrop={handleDrop}
                                sx={{
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    p: 4,
                                    textAlign: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('file-input')?.click()}
                            >
                                <input id="file-input" type="file" multiple onChange={handleFileInputChange} style={{ display: 'none' }} />
                                <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
                                <Typography>Kéo thả hoặc click để upload</Typography>
                            </Box>

                            <Grid container spacing={2} sx={{ mt: 2 }}>
                                {existingFiles.map((file, index) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`existing-${index}`}>
                                        <Card sx={{ position: 'relative', height: 150 }}>
                                            {file.fileType === 'image' ? (
                                                <CardMedia component="img" height="150" image={getMediaUrl(file.fileUrl)} onClick={() => handleOpenImageGallery(index)} sx={{ cursor: 'pointer' }} />
                                            ) : (
                                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                                                    <Typography variant="body2">PDF File</Typography>
                                                </Box>
                                            )}
                                            <IconButton sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)' }} onClick={() => handleRemoveExistingFile(index)}>
                                                <CloseIcon />
                                            </IconButton>
                                        </Card>
                                    </Grid>
                                ))}
                                {filePreviews.map((preview, index) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`new-${index}`}>
                                        <Card sx={{ position: 'relative', height: 150 }}>
                                            {formData.fileTypes[index] === 'image' ? (
                                                <CardMedia component="img" height="150" image={preview} onClick={() => handleOpenImageGallery(existingFiles.length + index)} sx={{ cursor: 'pointer' }} />
                                            ) : (
                                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                                                    <Typography variant="body2">{formData.files[index].name}</Typography>
                                                </Box>
                                            )}
                                            <IconButton sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)' }} onClick={() => handleRemoveFile(index)}>
                                                <CloseIcon />
                                            </IconButton>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={submitLoading}>
                                    {submitLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                                </Button>
                                <Button variant="outlined" onClick={() => router.back()}>Hủy</Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Card>

                <Dialog open={openImageGallery} onClose={handleCloseImageGallery} maxWidth="lg" fullWidth>
                    <DialogContent sx={{ position: 'relative', p: 0, bgcolor: 'black' }}>
                        <IconButton onClick={handleCloseImageGallery} sx={{ position: 'absolute', top: 10, right: 10, color: 'white', zIndex: 1 }}><CloseIcon /></IconButton>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
                            {getImageIndexes().length > 1 && <IconButton onClick={handlePrevImage} sx={{ color: 'white' }}><NavigateBeforeIcon /></IconButton>}
                            <Box
                                component="img"
                                src={[...existingFiles.map(f => getMediaUrl(f.fileUrl)), ...filePreviews][selectedImageIndex]}
                                sx={{ maxHeight: '100%', maxWidth: '100%' }}
                            />
                            {getImageIndexes().length > 1 && <IconButton onClick={handleNextImage} sx={{ color: 'white' }}><NavigateNextIcon /></IconButton>}
                        </Box>
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
}
