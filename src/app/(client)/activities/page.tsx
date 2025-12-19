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
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Pagination from '@mui/material/Pagination';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ImageIcon from '@mui/icons-material/Image';

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

interface Category {
    id: string;
    name: string;
}

export default function ActivitiesPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 9;

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const res = await fetch('/api/client/categories/activity');
                if (res.ok) {
                    const data = await res.json();
                    setCategories(data);
                }
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };
        loadCategories();
    }, []);

    // Load activities
    const loadActivities = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                limit: itemsPerPage.toString(),
            });

            if (selectedCategory !== 'all') {
                params.append('categoryId', selectedCategory);
            }

            const res = await fetch(`/api/client/activities?${params}`);
            if (res.ok) {
                const { data, pages } = await res.json();
                setActivities(data);
                setTotalPages(pages);
            }
        } catch (error) {
            console.error('Error loading activities:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedCategory]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    const handleCategoryChange = (event: React.SyntheticEvent, newValue: string) => {
        setSelectedCategory(newValue);
        setCurrentPage(1);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setCurrentPage(value);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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
                        Hoạt động của trường
                    </Typography>
                    <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
                        Khám phá những hoạt động sôi nổi và ý nghĩa tại AMIS
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
                            <Tab key={category.id} label={category.name} value={category.id} />
                        ))}
                    </Tabs>
                </Box>

                {/* Activities Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {loading ? (
                        <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
                            <Typography>Đang tải...</Typography>
                        </Box>
                    ) : activities.length === 0 ? (
                        <Box sx={{ width: '100%', textAlign: 'center', py: 8 }}>
                            <Typography>Không có hoạt động nào</Typography>
                        </Box>
                    ) : (
                        activities.map((activity) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={activity.id}>
                                <Card
                                    sx={{
                                        height: '100%',
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        cursor: 'pointer',
                                        transition: 'transform 0.3s, box-shadow 0.3s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 4,
                                        },
                                    }}
                                    onClick={() => router.push(`/activities/${activity.id}`)}
                                >
                                    <Box sx={{ position: 'relative' }}>
                                        <CardMedia
                                            component="img"
                                            height={400}
                                            width={400}
                                            image={activity.thumbnail || '/images/hero_backround.jpg'}
                                            alt={activity.title}
                                            // sx={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                        />

                                        <Chip
                                            label={activity.category.name}
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
                                    <CardContent sx={{ flexGrow: 1 }}>
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
                                            {activity.title}
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: 'vertical',
                                            }}
                                        >
                                            {activity.description}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', fontSize: '0.875rem' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <CalendarTodayIcon
                                                    sx={{ fontSize: 14, color: 'var(--primary-color)' }}
                                                />
                                                <Typography variant="caption">
                                                    {new Date(activity.date).toLocaleDateString('vi-VN')}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <ImageIcon sx={{ fontSize: 14, color: 'var(--primary-color)' }} />
                                                <Typography variant="caption">
                                                    {activity.images?.length || 0} ảnh
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="large"
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    fontWeight: 600,
                                },
                                '& .Mui-selected': {
                                    bgcolor: 'var(--primary-color) !important',
                                },
                            }}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    );
}
