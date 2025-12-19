'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface Activity {
    id: string;
    title: string;
    description: string;
    categoryId: string;
    category: {
        id: string;
        name: string;
    };
    date: string;
    author: string;
    thumbnail: string | null;
    images: string[];
    videos: string[];
    createdAt: string;
}

export default function ActivityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [relatedActivities, setRelatedActivities] = useState<Activity[]>([]);
    const [openGallery, setOpenGallery] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load activity detail
    useEffect(() => {
        const loadActivity = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/client/activities/${params.id}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Không tìm thấy hoạt động');
                    } else {
                        setError('Lỗi khi tải dữ liệu');
                    }
                    return;
                }
                const data = await res.json();

                setActivity(data);

                // Load related activities
                const relatedRes = await fetch(`/api/client/activities?categoryId=${data.categoryId}&limit=3`);
                if (relatedRes.ok) {
                    const { data: related } = await relatedRes.json();
                    setRelatedActivities(related.filter((a: Activity) => a.id !== data.id).slice(0, 3));
                }
            } catch (err) {
                console.error('Error loading activity:', err);
                setError('Lỗi khi tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            loadActivity();
        }
    }, [params.id]);

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h5">Đang tải...</Typography>
            </Container>
        );
    }

    if (error || !activity) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                    {error || 'Không tìm thấy hoạt động'}
                </Typography>
                <Button variant="contained" onClick={() => router.push('/activities')}>
                    Quay lại danh sách
                </Button>
            </Container>
        );
    }

    const handleOpenGallery = (index: number) => {
        setSelectedImageIndex(index);
        setOpenGallery(true);
    };

    const handleCloseGallery = () => {
        setOpenGallery(false);
    };

    const handlePrevImage = () => {
        setSelectedImageIndex((prev) => (prev === 0 ? activity.images.length - 1 : prev - 1));
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev === activity.images.length - 1 ? 0 : prev + 1));
    };

    // Hàm chuyển đổi URL YouTube sang embed URL
    const convertToEmbedUrl = (url: string): string => {
        // Xử lý URL YouTube dạng https://youtu.be/VIDEO_ID
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        }

        // Xử lý URL YouTube dạng https://www.youtube.com/watch?v=VIDEO_ID
        if (url.includes('youtube.com/watch')) {
            const urlObj = new URL(url);
            const videoId = urlObj.searchParams.get('v');
            return `https://www.youtube.com/embed/${videoId}`;
        }

        // Nếu đã là embed URL hoặc không phải YouTube, trả về nguyên bản
        return url;
    };

    return (
        <Box sx={{ bgcolor: 'var(--background)', minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">
                {/* Back Button */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/activities')}
                    sx={{ mb: 3, color: 'var(--primary-color)' }}
                >
                    Quay lại
                </Button>

                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip
                            label={activity.category.name}
                            sx={{
                                bgcolor: 'var(--primary-color)',
                                color: 'white',
                                fontWeight: 600,
                            }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 18, color: 'var(--primary-color)' }} />
                            <Typography variant="body2">
                                {new Date(activity.date).toLocaleDateString('vi-VN')}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PersonIcon sx={{ fontSize: 18, color: 'var(--primary-color)' }} />
                            <Typography variant="body2">{activity.author}</Typography>
                        </Box>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'var(--secondary-color)' }}>
                        {activity.title}
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#555', fontStyle: 'italic' }}>
                        {activity.description}
                    </Typography>
                </Box>

                {/* Video Section */}
                <Grid container spacing={2}>
                    {activity.videos &&
                        activity.videos.map((video, index) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                <Box sx={{ mb: 4 }} key={index}>
                                    <Card elevation={3}>
                                        <Box
                                            sx={{
                                                position: 'relative',
                                                paddingTop: '56.25%', // 16:9 aspect ratio
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <iframe
                                                src={convertToEmbedUrl(video)}
                                                title={activity.title}
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    border: 0,
                                                }}
                                            />
                                        </Box>
                                    </Card>
                                </Box>
                            </Grid>
                        ))}
                </Grid>

                {/* Content */}
                <Box
                    sx={{
                        mb: 4,
                        fontSize: '1.1rem',
                        lineHeight: 1.8,
                        color: '#333',
                        whiteSpace: 'pre-wrap',
                    }}
                >
                    {activity.description}
                </Box>

                {/* Image Gallery */}
                {activity.images && activity.images.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'var(--primary-color)' }}>
                            Thư viện ảnh ({activity.images.length})
                        </Typography>
                        <Grid container spacing={2}>
                            {activity.images.map((image, index) => (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                    <Card
                                        sx={{
                                            cursor: 'pointer',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                                boxShadow: 6,
                                            },
                                        }}
                                        onClick={() => handleOpenGallery(index)}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="250"
                                            image={image}
                                            alt={`${activity.title} - Ảnh ${index + 1}`}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}

                {/* Related Activities */}
                {relatedActivities.length > 0 && (
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'var(--primary-color)' }}>
                            Hoạt động liên quan
                        </Typography>
                        <Grid container spacing={3}>
                            {relatedActivities.map((relatedActivity) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={relatedActivity.id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            cursor: 'pointer',
                                            transition: 'transform 0.3s, box-shadow 0.3s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 4,
                                            },
                                        }}
                                        onClick={() => router.push(`/activities/${relatedActivity.id}`)}
                                    >
                                        <CardMedia
                                            component="img"
                                            height="200"
                                            image={relatedActivity.thumbnail || '/images/hero_backround.jpg'}
                                            alt={relatedActivity.title}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <Box sx={{ p: 2 }}>
                                            <Chip
                                                label={relatedActivity.category.name}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'var(--primary-color)',
                                                    color: 'white',
                                                    fontWeight: 600,
                                                    mb: 1,
                                                }}
                                            />
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: 700,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                }}
                                            >
                                                {relatedActivity.title}
                                            </Typography>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )}
            </Container>

            {/* Gallery Dialog */}
            <Dialog
                open={openGallery}
                onClose={handleCloseGallery}
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
                        onClick={handleCloseGallery}
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
                            src={activity.images[selectedImageIndex]}
                            alt={`${activity.title} - Ảnh ${selectedImageIndex + 1}`}
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
                    </Box>

                    <Typography
                        sx={{
                            textAlign: 'center',
                            color: 'white',
                            py: 2,
                        }}
                    >
                        {selectedImageIndex + 1} / {activity.images.length}
                    </Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
