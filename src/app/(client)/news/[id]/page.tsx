'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface NewsImage {
    id: string;
    imageUrl: string;
    order: number;
}

interface NewsArticle {
    id: string;
    title: string;
    description: string;
    content: string;
    category: string;
    date: string;
    thumbnail: string | null;
    images: NewsImage[];
}

export default function NewsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const newsId = params.id as string;

    const [news, setNews] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openImageGallery, setOpenImageGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Fetch news from API
    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/client/news/${newsId}`);

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Không tìm thấy tin tức');
                    } else {
                        setError('Có lỗi xảy ra khi tải tin tức');
                    }
                    return;
                }

                const data = await response.json();
                setNews(data);
                setError('');
            } catch (err) {
                console.error('Error fetching news:', err);
                setError('Có lỗi xảy ra khi tải tin tức');
            } finally {
                setLoading(false);
            }
        };

        if (newsId) {
            fetchNews();
        }
    }, [newsId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const handleOpenImageGallery = (index: number) => {
        setSelectedImageIndex(index);
        setOpenImageGallery(true);
    };

    const handlePrevImage = () => {
        if (news && news.images.length > 0) {
            setSelectedImageIndex((prev) => (prev === 0 ? news.images.length - 1 : prev - 1));
        }
    };

    const handleNextImage = () => {
        if (news && news.images.length > 0) {
            setSelectedImageIndex((prev) => (prev === news.images.length - 1 ? 0 : prev + 1));
        }
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: news?.title,
                text: news?.description,
                url: window.location.href,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !news) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" color="error" sx={{ mb: 2 }}>
                        {error || 'Không tìm thấy tin tức'}
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.push('/news')}
                        sx={{
                            bgcolor: 'var(--primary-color)',
                            '&:hover': { bgcolor: 'var(--accent-color)' },
                        }}
                    >
                        Quay lại danh sách tin tức
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh' }}>
            <Container maxWidth="lg" sx={{ py: 4 }}>
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/news')}
                    sx={{ mb: 3, color: 'var(--primary-color)' }}
                >
                    Quay lại danh sách tin tức
                </Button>

                <Grid container spacing={4}>
                    {/* Main Content */}
                    <Grid item xs={12} md={8}>
                        <Card sx={{ mb: 3 }}>
                            {/* Featured Image */}
                            {news.thumbnail && (
                                <CardMedia
                                    component="img"
                                    height={400}
                                    image={news.thumbnail}
                                    alt={news.title}
                                    sx={{ objectFit: 'cover' }}
                                />
                            )}

                            <CardContent sx={{ p: 4 }}>
                                {/* Category and Meta */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Chip
                                        label={news.category}
                                        sx={{ bgcolor: 'var(--primary-color)', color: 'white', fontWeight: 600 }}
                                    />
                                </Box>

                                {/* Title */}
                                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: '#333' }}>
                                    {news.title}
                                </Typography>

                                {/* Meta Info */}
                                <Box sx={{ display: 'flex', gap: 3, mb: 3, color: '#666' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CalendarTodayIcon sx={{ fontSize: 18 }} />
                                        <Typography variant="body2">{formatDate(news.date)}</Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ mb: 3 }} />

                                {/* Description */}
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 3,
                                        color: '#555',
                                        fontStyle: 'italic',
                                        lineHeight: 1.6,
                                    }}
                                >
                                    {news.description}
                                </Typography>

                                {/* Content */}
                                <Box
                                    sx={{
                                        '& p': { mb: 2, lineHeight: 1.8 },
                                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                                            color: 'var(--primary-color)',
                                            fontWeight: 700,
                                            mt: 3,
                                            mb: 2,
                                        },
                                        '& ul, & ol': { pl: 3, mb: 2 },
                                        '& li': { mb: 1 },
                                        '& img': { maxWidth: '100%', height: 'auto', borderRadius: 1 },
                                    }}
                                    dangerouslySetInnerHTML={{ __html: news.content }}
                                />
                            </CardContent>
                        </Card>

                        {/* Image Gallery */}
                        {news.images.length > 0 && (
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                        Hình ảnh ({news.images.length})
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {news.images.map((image, index) => (
                                            <Grid item xs={6} sm={4} md={3} key={image.id}>
                                                <CardMedia
                                                    component="img"
                                                    height={120}
                                                    image={image.imageUrl}
                                                    alt={`Image ${index + 1}`}
                                                    sx={{
                                                        objectFit: 'cover',
                                                        borderRadius: 1,
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.3s',
                                                        '&:hover': {
                                                            transform: 'scale(1.05)',
                                                        },
                                                    }}
                                                    onClick={() => handleOpenImageGallery(index)}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ position: 'sticky', top: 20 }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Chia sẻ bài viết
                                </Typography>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    startIcon={<ShareIcon />}
                                    onClick={handleShare}
                                    sx={{
                                        borderColor: 'var(--primary-color)',
                                        color: 'var(--primary-color)',
                                        '&:hover': {
                                            bgcolor: 'rgba(124, 179, 66, 0.1)',
                                            borderColor: 'var(--accent-color)',
                                        },
                                    }}
                                >
                                    Chia sẻ
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

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
                        {news.images.length > 1 && (
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
                            src={news.images[selectedImageIndex]?.imageUrl}
                            alt={`Image ${selectedImageIndex + 1}`}
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '80vh',
                                objectFit: 'contain',
                            }}
                        />

                        {news.images.length > 1 && (
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

                    {news.images.length > 1 && (
                        <Typography
                            sx={{
                                textAlign: 'center',
                                color: 'white',
                                py: 2,
                            }}
                        >
                            {selectedImageIndex + 1} / {news.images.length}
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
