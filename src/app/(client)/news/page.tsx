'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface NewsArticle {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string;
    thumbnail: string | null;
}

export default function NewsPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const itemsPerPage = 9;

    const categories = ['all', 'Tiểu học', 'Trung học'];

    // Fetch news from API
    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            if (selectedCategory !== 'all') {
                params.append('category', selectedCategory);
            }

            const response = await fetch(`/api/client/news?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }

            const data = await response.json();
            setNews(data.data);
            setTotalPages(data.pagination.pages);
            setError('');
        } catch (err) {
            console.error('Error fetching news:', err);
            setError('Có lỗi xảy ra khi tải tin tức');
            // Fallback to empty array
            setNews([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedCategory, itemsPerPage]);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedCategory(newValue);
        setCurrentPage(1);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN');
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
                        Tin tức giáo dục
                    </Typography>
                    <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
                        Cập nhật tin tức mới nhất về hoạt động giáo dục tại trường
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Tabs Navigation */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
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
                        {categories.map((category) => (
                            <Tab key={category} label={category === 'all' ? 'Tất cả' : category} value={category} />
                        ))}
                    </Tabs>
                </Box>

                {/* Loading State */}
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                )}

                {/* Error State */}
                {error && !loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="error" sx={{ mb: 2 }}>
                            {error}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Vui lòng thử lại sau
                        </Typography>
                    </Box>
                )}

                {/* Empty State */}
                {!loading && !error && news.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
                            Chưa có tin tức nào
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {selectedCategory === 'all'
                                ? 'Chưa có tin tức nào được đăng tải'
                                : `Chưa có tin tức nào trong danh mục "${selectedCategory}"`}
                        </Typography>
                    </Box>
                )}

                {/* News Grid */}
                {!loading && !error && news.length > 0 && (
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {news.map((article) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={article.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4,
                                        },
                                    }}
                                    onClick={() => router.push(`/news/${article.id}`)}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height={200}
                                            image={article.thumbnail || '/images/hero_backround.jpg'}
                                            alt={article.title}
                                            sx={{ objectFit: 'cover' }}
                                        />
                                        <Chip
                                            label={article.category}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                bgcolor: 'var(--primary-color)',
                                                color: 'white',
                                                fontWeight: 600,
                                            }}
                                        />
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 700,
                                                mb: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {article.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                flexGrow: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {article.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', fontSize: '0.875rem' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarTodayIcon
                                                    sx={{ fontSize: 14, color: 'var(--primary-color)' }}
                                                />
                                                <Typography variant="caption">{formatDate(article.date)}</Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Pagination */}
                {!loading && !error && totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    '&.Mui-selected': {
                                        bgcolor: 'var(--primary-color)',
                                        '&:hover': {
                                            bgcolor: 'var(--accent-color)',
                                        },
                                    },
                                },
                            }}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    );
}
