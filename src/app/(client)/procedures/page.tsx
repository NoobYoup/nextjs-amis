'use client';

import { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import DownloadIcon from '@mui/icons-material/Download';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import GavelIcon from '@mui/icons-material/Gavel';
import SecurityIcon from '@mui/icons-material/Security';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
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

export default function ProceduresPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [currentProcedureImages, setCurrentProcedureImages] = useState<ProcedureFile[]>([]);

    // Fetch procedures from API
    useEffect(() => {
        const fetchProcedures = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams();
                if (selectedCategory !== 'all') {
                    params.append('category', selectedCategory);
                }

                const res = await fetch(`/api/client/procedures?${params}`);
                if (!res.ok) {
                    throw new Error('Failed to fetch procedures');
                }

                const data = await res.json();
                setProcedures(data);
                setError('');
            } catch (err) {
                setError((err as Error).message || 'Có lỗi xảy ra khi tải dữ liệu');
                console.error('Error fetching procedures:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProcedures();
    }, [selectedCategory]);

    // Get unique categories from procedures
    const categories = ['all', ...Array.from(new Set(procedures.map((p) => p.category)))];

    // Filter procedures by category
    const filteredProcedures =
        selectedCategory === 'all' ? procedures : procedures.filter((p) => p.category === selectedCategory);

    // Icon mapping for categories
    const getCategoryIcon = (category: string) => {
        const iconMap: { [key: string]: React.ReactNode } = {
            'Học sinh': <SchoolIcon />,
            'Tuyển sinh': <PersonIcon />,
            'Học tập': <GavelIcon />,
            'An toàn': <SecurityIcon />,
            'Khen thưởng': <EmojiEventsIcon />,
        };
        return iconMap[category] || <SchoolIcon />;
    };

    // Image gallery functions
    const handleOpenImageGallery = (procedure: Procedure, imageIndex: number = 0) => {
        const imageFiles = procedure.files.filter((file) => file.fileType === 'image');
        if (imageFiles.length > 0) {
            setCurrentProcedureImages(imageFiles);
            setSelectedImageIndex(imageIndex);
            setOpenImageGallery(true);
        }
    };

    const handleCloseImageGallery = () => {
        setOpenImageGallery(false);
        setSelectedImageIndex(0);
        setCurrentProcedureImages([]);
    };

    const handlePrevImage = () => {
        setSelectedImageIndex(selectedImageIndex === 0 ? currentProcedureImages.length - 1 : selectedImageIndex - 1);
    };

    const handleNextImage = () => {
        setSelectedImageIndex(selectedImageIndex === currentProcedureImages.length - 1 ? 0 : selectedImageIndex + 1);
    };

    // File download function
    const handleDownload = (file: ProcedureFile) => {
        try {
            const link = document.createElement('a');
            link.href = file.fileUrl;
            link.download = file.fileName || 'file';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('Đang tải file...');
        } catch {
            toast.error('Có lỗi xảy ra khi tải file');
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedCategory(newValue);
    };

    return (
        <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh' }}>
            {/* Header */}
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
                        Nội Quy & Quy Chế
                    </Typography>
                    <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
                        Các quy định và quy chế của trường AMIS
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ pb: 6 }}>
                {/* Tabs Navigation */}
                <Box sx={{ borderBottom: 2, borderColor: 'divider', mb: 4 }}>
                    <Tabs
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                            '& .MuiTab-root': {
                                fontWeight: 600,
                                fontSize: '1rem',
                                textTransform: 'none',
                            },
                            '& .Mui-selected': {
                                color: 'var(--primary-color) !important',
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: 'var(--primary-color)',
                                height: 3,
                            },
                        }}
                    >
                        <Tab label="Tất cả" value="all" />
                        {categories.slice(1).map((category) => (
                            <Tab key={category} label={category} value={category} />
                        ))}
                    </Tabs>
                </Box>

                {/* Procedures Grid */}
                <Grid container spacing={3}>
                    {filteredProcedures.length === 0 ? (
                        <Grid size={{ xs: 12 }}>
                            <Box sx={{ textAlign: 'center', py: 8 }}>
                                <Typography variant="h6" sx={{ color: '#666', mb: 2 }}>
                                    {procedures.length === 0
                                        ? 'Chưa có quy chế nào được công bố'
                                        : 'Không tìm thấy quy chế nào trong danh mục này'}
                                </Typography>
                            </Box>
                        </Grid>
                    ) : (
                        filteredProcedures.map((procedure) => (
                            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={procedure.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: 4,
                                            transform: 'translateY(-4px)',
                                        },
                                    }}
                                >
                                    {/* Card Header */}
                                    <Box
                                        sx={{
                                            p: 3,
                                            background:
                                                'linear-gradient(135deg, rgba(124, 179, 66, 0.1) 0%, rgba(124, 179, 66, 0.05) 100%)',
                                            borderBottom: '2px solid var(--primary-color)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                p: 1.5,
                                                borderRadius: '50%',
                                                bgcolor: 'var(--primary-color)',
                                                color: 'white',
                                                fontSize: 28,
                                            }}
                                        >
                                            {getCategoryIcon(procedure.category)}
                                        </Box>
                                        <Box>
                                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                                {procedure.title}
                                            </Typography>
                                            <Chip
                                                label={procedure.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'var(--primary-color)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Card Content */}
                                    <Box sx={{ p: 3, flex: 1, overflow: 'auto' }}>
                                        <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                            {procedure.description}
                                        </Typography>

                                        {/* Content Sections */}
                                        {procedure.content.slice(0, 2).map((section, idx) => (
                                            <Box key={idx} sx={{ mb: 2 }}>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: 'var(--primary-color)',
                                                        mb: 1,
                                                    }}
                                                >
                                                    {section.title}
                                                </Typography>
                                                <List sx={{ py: 0 }}>
                                                    {section.items.slice(0, 2).map((item, itemIdx) => (
                                                        <ListItem
                                                            key={itemIdx}
                                                            sx={{
                                                                py: 0.5,
                                                                px: 0,
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                            }}
                                                        >
                                                            <ListItemIcon
                                                                sx={{
                                                                    minWidth: 24,
                                                                    color: 'var(--primary-color)',
                                                                }}
                                                            >
                                                                <CheckCircleIcon sx={{ fontSize: 16 }} />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={item}
                                                                primaryTypographyProps={{
                                                                    variant: 'body2',
                                                                    sx: { color: '#555' },
                                                                }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                    {section.items.length > 2 && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: 'var(--primary-color)',
                                                                fontWeight: 600,
                                                                display: 'block',
                                                                mt: 0.5,
                                                            }}
                                                        >
                                                            +{section.items.length - 2} mục khác
                                                        </Typography>
                                                    )}
                                                </List>
                                                {idx < procedure.content.slice(0, 2).length - 1 && (
                                                    <Divider sx={{ my: 1.5 }} />
                                                )}
                                            </Box>
                                        ))}

                                        {procedure.content.length > 2 && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'var(--primary-color)',
                                                    fontWeight: 600,
                                                    display: 'block',
                                                    mt: 1,
                                                }}
                                            >
                                                +{procedure.content.length - 2} mục khác
                                            </Typography>
                                        )}
                                    </Box>

                                    {/* Card Footer - File Actions */}
                                    {procedure.files.length > 0 && (
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderTop: '1px solid #e0e0e0',
                                                bgcolor: '#f9f9f9',
                                            }}
                                        >
                                            {procedure.files.some((f) => f.fileType === 'image') ? (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => handleOpenImageGallery(procedure, 0)}
                                                    sx={{
                                                        bgcolor: 'var(--primary-color)',
                                                        '&:hover': { bgcolor: 'var(--accent-color)' },
                                                    }}
                                                >
                                                    Xem ảnh
                                                </Button>
                                            ) : (
                                                <Button
                                                    fullWidth
                                                    variant="contained"
                                                    startIcon={<DownloadIcon />}
                                                    onClick={() => handleDownload(procedure.files[0])}
                                                    sx={{
                                                        bgcolor: 'var(--primary-color)',
                                                        '&:hover': { bgcolor: 'var(--accent-color)' },
                                                    }}
                                                >
                                                    Tải xuống {procedure.files[0].fileType.toUpperCase()}
                                                </Button>
                                            )}
                                        </Box>
                                    )}
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>

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
                        {currentProcedureImages.length > 0 && (
                            <>
                                {currentProcedureImages.length > 1 && (
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
                                    src={currentProcedureImages[selectedImageIndex]?.fileUrl}
                                    alt={`Image ${selectedImageIndex + 1}`}
                                    sx={{
                                        maxWidth: '100%',
                                        maxHeight: '80vh',
                                        objectFit: 'contain',
                                    }}
                                />

                                {currentProcedureImages.length > 1 && (
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

                    {currentProcedureImages.length > 1 && (
                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'white',
                                py: 2,
                            }}
                        >
                            {selectedImageIndex + 1} / {currentProcedureImages.length}
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
