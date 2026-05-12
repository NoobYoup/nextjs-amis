'use client';

import { useState, useEffect } from 'react';
import { api, API_URL, getMediaUrl } from '@/lib/api';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import DownloadIcon from '@mui/icons-material/Download';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

interface DocumentCategory {
    id: string;
    name: string;
    type: 'document_type' | 'document_field';
}

interface DocumentFile {
    id: string;
    fileUrl: string;
    fileType: string;
    order: number;
}

interface Document {
    id: string;
    title: string;
    type: string;
    number: string;
    date: string;
    field: string;
    summary: string | null;
    isNew: boolean;
    createdAt: string;
    updatedAt: string;
    files: DocumentFile[];
}

export default function DocumentsPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<DocumentCategory[]>([]);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const handleDownload = async (doc: Document, fileType: string) => {
        setDownloading(doc.id);
        try {
            const firstFile = doc.files[0];
            const response = await fetch(`${API_URL}/client/download?url=${encodeURIComponent(firstFile.fileUrl)}`);

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${doc.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileType}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert('Lỗi khi tải file. Vui lòng thử lại.');
        } finally {
            setDownloading(null);
        }
    };

    const handleOpenImageGallery = (imageUrls: string[]) => {
        setSelectedImageUrls(imageUrls);
        setSelectedImageIndex(0);
        setOpenImageGallery(true);
    };

    const handleCloseImageGallery = () => {
        setOpenImageGallery(false);
        setSelectedImageUrls([]);
        setSelectedImageIndex(0);
    };

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? selectedImageUrls.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev === selectedImageUrls.length - 1 ? 0 : prev + 1));
    };

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const data = await api.get<DocumentCategory[]>('/client/categories/document');
                const catArray = Array.isArray(data) ? data : (data as any)?.data || [];
                // We assume Filter Tabs use the 'document_field' type to match "Cấp trên, Nhà trường"
                setCategories(catArray.filter((c: DocumentCategory) => c.type === 'document_field'));
            } catch (err) {
                console.error('Error loading categories:', err);
            }
        };
        loadCategories();
    }, []);

    // Load documents
    useEffect(() => {
        const loadDocuments = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                if (selectedCategory !== 'all') {
                    params.append('field', selectedCategory);
                }

                const responseData = await api.get<Document[] | { data: Document[] }>(`/client/documents?${params.toString()}`);
                const docs = Array.isArray(responseData) ? responseData : responseData.data;
                setDocuments(docs);
            } catch (err) {
                console.error('Error loading documents:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDocuments();
    }, [selectedCategory]);

    const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedCategory(newValue);
    };

    return (
        <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Box
                sx={{
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
                    color: 'white',
                    py: 8,
                    mb: 6,
                }}
            >
                <Container maxWidth="lg">
                    <Typography variant="h2" sx={{ fontWeight: 700, textAlign: 'center', mb: 2 }}>
                        Văn bản pháp quy
                    </Typography>
                    <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
                        Hệ thống văn bản quản lý và điều hành nhà trường
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Filter Tabs */}
                <Box sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '1rem',
                            },
                            '& .Mui-selected': {
                                color: 'var(--primary-color) !important',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'var(--primary-color)',
                            },
                        }}
                    >
                        <Tab label="Tất cả" value="all" />
                        {categories.map((category) => (
                            <Tab key={category.id} label={category.name} value={category.name} />
                        ))}
                    </Tabs>
                </Box>

                <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                    {loading ? 'Đang tải...' : `Tìm thấy ${documents.length} văn bản`}
                </Typography>

                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6">Đang tải dữ liệu...</Typography>
                    </Box>
                ) : documents.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="h6">Không tìm thấy văn bản nào</Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {documents.map((doc) => (
                            <Card key={doc.id} sx={{ p: 3, '&:hover': { boxShadow: 4 } }}>
                                <Grid container spacing={2} alignItems="center">
                                    <Grid size={{ xs: 12, md: 8 }}>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                label={doc.type}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'var(--primary-color)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                }}
                                            />
                                            {doc.number && <Chip label={doc.number} size="small" variant="outlined" />}
                                            {/* <Chip label={doc.field} size="small" color="default" /> */}
                                            {/* {doc.isNew && (
                                                <Chip
                                                    label="Mới"
                                                    size="small"
                                                    sx={{ bgcolor: '#f44336', color: 'white' }}
                                                />
                                            )} */}
                                        </Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                            {doc.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                                            {doc.summary}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarTodayIcon sx={{ fontSize: 16, color: '#999' }} />
                                            <Typography variant="caption" sx={{ color: '#999' }}>
                                                Ngày ban hành: {new Date(doc.date).toLocaleDateString('vi-VN')}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                                        {doc.files && doc.files.length > 0 && (
                                            <>
                                                {doc.files.some((f) => f.fileType === 'image') ? (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<ImageIcon />}
                                                        onClick={() =>
                                                            handleOpenImageGallery(
                                                                doc.files
                                                                    .filter((f) => f.fileType === 'image')
                                                                    .map((f) => getMediaUrl(f.fileUrl)),
                                                            )
                                                        }
                                                        sx={{
                                                            bgcolor: 'var(--primary-color)',
                                                            '&:hover': { bgcolor: 'var(--accent-color)' },
                                                        }}
                                                    >
                                                        Xem ảnh
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<DownloadIcon />}
                                                        onClick={() => handleDownload(doc, doc.files[0].fileType)}
                                                        disabled={downloading === doc.id}
                                                        sx={{
                                                            bgcolor: 'var(--primary-color)',
                                                            '&:hover': { bgcolor: 'var(--accent-color)' },
                                                        }}
                                                    >
                                                        {downloading === doc.id
                                                            ? 'Đang tải...'
                                                            : `Tải xuống ${doc.files[0].fileType.toUpperCase()}`}
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </Grid>
                                </Grid>
                            </Card>
                        ))}
                    </Box>
                )}

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
                            {selectedImageUrls.length > 0 && (
                                <>
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

                                    <Box
                                        component="img"
                                        src={selectedImageUrls[selectedImageIndex]}
                                        alt={`Image ${selectedImageIndex + 1}`}
                                        sx={{
                                            maxWidth: '100%',
                                            maxHeight: '80vh',
                                            objectFit: 'contain',
                                        }}
                                    />

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
                                </>
                            )}
                        </Box>

                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'white',
                                py: 2,
                            }}
                        >
                            {selectedImageIndex + 1} / {selectedImageUrls.length}
                        </Typography>
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
}
