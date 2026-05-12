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
    Dialog,
    DialogContent,
    CardMedia,
    CircularProgress,
    MenuItem
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
import { api, getMediaUrl } from '@/lib/api';

interface ProcedureFile {
    id: string;
    fileUrl: string;
    fileType: string;
    fileName?: string;
    isNew?: boolean;
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

interface ProcedureUpdateClientProps {
    id: string;
}

export default function ProcedureUpdateClient({ id }: ProcedureUpdateClientProps) {
    const router = useRouter();

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
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await api.get<{ id: string; name: string }[]>('/admin/categories/procedure');
                setCategories(data);
            } catch (err) {
                console.error('Lỗi tải danh mục:', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProcedure = async () => {
            try {
                const data = await api.get<Procedure>(`/admin/procedures/${id}`);
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

        if (id) {
            fetchProcedure();
        }
    }, [id]);

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

        setNewFiles((prev) => [...prev, ...fileArray]);
        setNewFileTypes((prev) => [...prev, ...fileTypes]);
        setNewFilePreviews((prev) => [...prev, ...previews]);
    };

    const handleRemoveExistingFile = (index: number) => {
        setExistingFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveNewFile = (index: number) => {
        URL.revokeObjectURL(newFilePreviews[index]);
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setNewFileTypes((prev) => prev.filter((_, i) => i !== index));
        setNewFilePreviews((prev) => prev.filter((_, i) => i !== index));
    };

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
    };

    const handlePrevImage = () => {
        const imageFiles = getImageFiles();
        setSelectedImageIndex((prev) => (prev === 0 ? imageFiles.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        const imageFiles = getImageFiles();
        setSelectedImageIndex((prev) => (prev === imageFiles.length - 1 ? 0 : prev + 1));
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
            submitData.append('content', JSON.stringify(formData.content.filter(s => s.title.trim() !== '')));
            submitData.append('existingFiles', JSON.stringify(existingFiles));

            newFiles.forEach((file, i) => {
                submitData.append('file[]', file);
                submitData.append(`fileType_${i}`, newFileTypes[i]);
            });

            await api.post(`/admin/procedures/${id}`, submitData);
            toast.success('Cập nhật quy chế thành công');
            router.push('/admin/procedures');
        } catch (err) {
            setError((err as Error).message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg">
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

                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--foreground)' }}>
                        Chỉnh Sửa Quy Chế
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <Card sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Tiêu đề *"
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
                                label="Mô tả *"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                multiline
                                rows={3}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Nội dung chi tiết</Typography>
                            {formData.content.map((section, sectionIndex) => (
                                <Card key={sectionIndex} sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Typography variant="subtitle1">Mục {sectionIndex + 1}</Typography>
                                        <IconButton onClick={() => removeContentSection(sectionIndex)} color="error"><DeleteIcon /></IconButton>
                                    </Box>
                                    <TextField
                                        fullWidth
                                        label="Tiêu đề mục"
                                        value={section.title}
                                        onChange={(e) => handleContentChange(sectionIndex, 'title', e.target.value)}
                                        sx={{ mb: 2 }}
                                    />
                                    {section.items.map((item, itemIndex) => (
                                        <Box key={itemIndex} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <TextField
                                                fullWidth
                                                label={`Nội dung ${itemIndex + 1}`}
                                                value={item}
                                                onChange={(e) => handleItemChange(sectionIndex, itemIndex, e.target.value)}
                                            />
                                            <IconButton onClick={() => removeItem(sectionIndex, itemIndex)} color="error"><DeleteIcon /></IconButton>
                                        </Box>
                                    ))}
                                    <Button startIcon={<AddIcon />} onClick={() => addItem(sectionIndex)}>Thêm nội dung</Button>
                                </Card>
                            ))}
                            <Button startIcon={<AddIcon />} onClick={addContentSection} variant="outlined">Thêm mục mới</Button>
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
                                {getAllFiles().map((file, index) => (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={file.id}>
                                        <Card sx={{ position: 'relative', height: 150 }}>
                                            {file.fileType === 'image' ? (
                                                <CardMedia component="img" height="150" image={file.isNew ? file.fileUrl : getMediaUrl(file.fileUrl)} onClick={() => handleOpenImageGallery(index)} sx={{ cursor: 'pointer' }} />
                                            ) : (
                                                <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                                                    <Typography variant="body2">{file.fileName || 'Document'}</Typography>
                                                </Box>
                                            )}
                                            <IconButton
                                                sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)' }}
                                                onClick={() => file.isNew ? handleRemoveNewFile(index - existingFiles.length) : handleRemoveExistingFile(index)}
                                            >
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
                                    {submitLoading ? 'Đang lưu...' : 'Cập nhật'}
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
                            <IconButton onClick={handlePrevImage} sx={{ color: 'white' }}><NavigateBeforeIcon /></IconButton>
                            <Box component="img" src={getImageFiles()[selectedImageIndex]?.isNew ? getImageFiles()[selectedImageIndex]?.fileUrl : getMediaUrl(getImageFiles()[selectedImageIndex]?.fileUrl)} sx={{ maxHeight: '100%', maxWidth: '100%' }} />
                            <IconButton onClick={handleNextImage} sx={{ color: 'white' }}><NavigateNextIcon /></IconButton>
                        </Box>
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
}
