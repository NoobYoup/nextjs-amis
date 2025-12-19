'use client';

import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { toast } from 'react-toastify';

interface ReformFile {
    id: string;
    fileUrl: string;
    fileType: string;
    order: number;
}

interface Reform {
    id: string;
    title: string;
    description: string;
    details: string[];
    createdAt: string;
    updatedAt: string;
    files: ReformFile[];
}

interface DisclosureItem {
    id: string;
    title: string;
    icon: React.ReactNode;
    description: string;
    details: string[];
    files: ReformFile[];
}

export default function Reform() {
    const [reforms, setReforms] = useState<Reform[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageUrls, setSelectedImageUrls] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [downloading, setDownloading] = useState<string | null>(null);

    // Default icons for different types of reforms
    const getIcon = (index: number) => {
        const icons = [
            <PeopleIcon key="people" />,
            <SchoolIcon key="school" />,
            <VerifiedUserIcon key="verified" />,
            <AssignmentIcon key="assignment" />,
        ];
        return icons[index % icons.length];
    };

    useEffect(() => {
        const loadReforms = async () => {
            try {
                const response = await fetch('/api/client/reforms');
                if (!response.ok) throw new Error('Error loading reforms');

                const { data } = await response.json();
                setReforms(data || []);
            } catch (err) {
                console.error('Error loading reforms:', err);
                setError('Có lỗi xảy ra khi tải thông tin công khai');
            } finally {
                setLoading(false);
            }
        };

        loadReforms();
    }, []);

    // Convert reforms to disclosure items format
    const disclosureItems: DisclosureItem[] = reforms.map((reform, index) => ({
        id: reform.id,
        title: reform.title,
        icon: getIcon(index),
        description: reform.description,
        details: reform.details,
        files: reform.files,
    }));

    const handleDownload = async (reform: Reform, fileType: string) => {
        setDownloading(reform.id);
        try {
            const firstFile = reform.files.find((f) => f.fileType !== 'image') || reform.files[0];
            const response = await fetch(`/api/client/download?url=${encodeURIComponent(firstFile.fileUrl)}`);

            if (!response.ok) {
                throw new Error('Download failed');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${reform.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileType}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Lỗi khi tải file. Vui lòng thử lại.');
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

    if (loading) {
        return (
            <Box
                sx={{
                    bgcolor: 'var(--background)',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress size={60} sx={{ color: 'var(--primary-color)' }} />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh', py: 8 }}>
                <Container maxWidth="lg">
                    <Alert severity="error" sx={{ mb: 4 }}>
                        {error}
                    </Alert>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh' }}>
            {/* Hero Section */}
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
                        Công Khai Thông Tin
                    </Typography>
                    <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
                        Theo Thông tư 09/2024/TT-BGDĐT
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ pb: 6 }}>
                {/* Header Info */}
                <Card
                    sx={{ p: 4, mb: 6, bgcolor: 'rgba(124, 179, 66, 0.05)', border: '2px solid var(--primary-color)' }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <PublicIcon sx={{ fontSize: 32, color: 'var(--primary-color)' }} />
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                            Công khai theo Thông tư 09/2024/TT-BGDĐT
                        </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
                        Trường AMIS cam kết công khai, minh bạch trong hoạt động giáo dục. Dưới đây là các thông tin
                        được công khai theo quy định của Bộ Giáo dục và Đào tạo:
                    </Typography>
                </Card>

                {/* Disclosure Items Grid */}
                <Grid container spacing={3}>
                    {disclosureItems.map((item) => (
                        <Grid size={{ xs: 12, md: 4 }} key={item.id}>
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
                                        {item.icon}
                                    </Box>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                                            {item.title}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Card Content */}
                                <Box sx={{ p: 3, flex: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                        {item.description}
                                    </Typography>

                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            fontWeight: 700,
                                            color: 'var(--primary-color)',
                                            mb: 1.5,
                                        }}
                                    >
                                        Nội dung công khai:
                                    </Typography>

                                    <List sx={{ py: 0 }}>
                                        {item.details.map((detail, idx) => (
                                            <ListItem
                                                key={idx}
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
                                                    primary={detail}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                        sx: { color: '#555' },
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>

                                {/* Card Footer - File Actions */}
                                {item.files && item.files.length > 0 && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            borderTop: '1px solid #e0e0e0',
                                            bgcolor: '#f9f9f9',
                                            display: 'flex',
                                            gap: 1,
                                        }}
                                    >
                                        {item.files.some((f) => f.fileType === 'image') && (
                                            <Button
                                                variant="contained"
                                                startIcon={<ImageIcon />}
                                                onClick={() =>
                                                    handleOpenImageGallery(
                                                        item.files
                                                            .filter((f) => f.fileType === 'image')
                                                            .map((f) => f.fileUrl),
                                                    )
                                                }
                                                sx={{
                                                    bgcolor: 'var(--primary-color)',
                                                    '&:hover': { bgcolor: 'var(--accent-color)' },
                                                    flex: 1,
                                                }}
                                            >
                                                Xem Hình Ảnh
                                            </Button>
                                        )}
                                        {item.files.some((f) => f.fileType !== 'image') && (
                                            <Button
                                                variant="contained"
                                                startIcon={<DownloadIcon />}
                                                disabled={downloading === item.id}
                                                onClick={() => {
                                                    const reform = reforms.find((r) => r.id === item.id);
                                                    const nonImageFile = item.files.find((f) => f.fileType !== 'image');
                                                    if (reform && nonImageFile) {
                                                        handleDownload(reform, nonImageFile.fileType);
                                                    }
                                                }}
                                                sx={{
                                                    bgcolor: 'var(--primary-color)',
                                                    '&:hover': { bgcolor: 'var(--accent-color)' },
                                                    flex: 1,
                                                }}
                                            >
                                                {downloading === item.id ? 'Đang tải...' : 'Tải xuống PDF'}
                                            </Button>
                                        )}
                                    </Box>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>

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
