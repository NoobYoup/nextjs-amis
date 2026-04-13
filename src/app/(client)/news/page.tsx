'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, getMediaUrl } from '@/lib/api';
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
    const [selectedCategory, setSelectedCategory] = useState('Tất cả');
    const [currentPage, setCurrentPage] = useState(1);
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [error, setError] = useState('');
    const itemsPerPage = 9;

    const categories = ['Tất cả', 'Tiểu học', 'Trung học'];

    // Fetch news from API
    const fetchNews = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            if (selectedCategory !== 'Tất cả') {
                params.append('category', selectedCategory);
            }

            const data = await api.get<{ data: NewsArticle[]; pages: number; current: number }>(`/client/news?${params}`);
            
            setNews(data.data);
            setTotalPages(data.pages || 1);
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
                            <Tab key={category} label={category} value={category} />
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
                            {selectedCategory === 'Tất cả'
                                ? 'Chưa có tin tức nào được đăng tải'
                                : `Chưa có tin tức nào trong danh mục "${selectedCategory}"`}
                        </Typography>
                    </Box>
                )}

                {/* News List */}
                {!loading && !error && news.length > 0 && (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
                        {news.map((article) => (
                            <Card
                                key={article.id}
                                sx={{
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    cursor: 'pointer',
                                    // overflow: 'hidden',
                                    // transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    // '&:hover': {
                                    //     transform: 'translateY(-4px)',
                                    //     boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                                    //     '& .news-image': {
                                    //         transform: 'scale(1.05)',
                                    //     }
                                    // },
                                    borderRadius: 4,
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    p: 1,
                                }}
                                onClick={() => router.push(`/news/${article.id}`)}
                            >
                                <Box sx={{ 
                                    width: { xs: '100%', md: 320 }, 
                                    height: { xs: 200, md: 'auto' },
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <CardMedia
                                        component="img"
                                        image={getMediaUrl(article.thumbnail)}
                                        alt={article.title}
                                        className="news-image"
                                        sx={{ 
                                            height: '100%', 
                                            width: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                    />
                                    {/* <Chip
                                        label={article.category}
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 16,
                                            left: 16,
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(4px)',
                                            color: 'var(--primary-color)',
                                            fontWeight: 700,
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                                        }}
                                    /> */}
                                </Box>
                                <CardContent sx={{ 
                                    flex: 1, 
                                    p: { xs: 3, md: 4 },
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'var(--primary-color)' }} />
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            {formatDate(article.date)}
                                        </Typography>
                                    </Box>
                                    
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 800,
                                            mb: 2,
                                            color: '#1a1a1a',
                                            lineHeight: 1.3,
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
                                        variant="body1"
                                        sx={{
                                            color: 'text.secondary',
                                            lineHeight: 1.6,
                                            mb: 0,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                        }}
                                    >
                                        {article.description}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
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
