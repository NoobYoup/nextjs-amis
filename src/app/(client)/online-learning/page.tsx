'use client';

import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';

// interface OnlineClass {
//     id: number;
//     subject: string;
//     teacher: string;
//     grade: string;
//     time: string;
//     day: string;
//     platform: string;
//     link: string;
//     status: 'live' | 'upcoming' | 'recorded';
// }

export default function OnlineLearningPage() {
    const [selectedTab, setSelectedTab] = useState(0);

    // const onlineClasses: OnlineClass[] = [
    //     {
    //         id: 1,
    //         subject: 'Toán học',
    //         teacher: 'Cô Nguyễn Thị Lan',
    //         grade: 'Lớp 5',
    //         time: '08:00 - 09:00',
    //         day: 'Thứ 2, Thứ 4',
    //         platform: 'Google Meet',
    //         link: 'https://meet.google.com/abc-defg-hij',
    //         status: 'upcoming',
    //     },
    //     {
    //         id: 2,
    //         subject: 'Tiếng Việt',
    //         teacher: 'Cô Trần Thị Mai',
    //         grade: 'Lớp 4',
    //         time: '09:15 - 10:15',
    //         day: 'Thứ 3, Thứ 5',
    //         platform: 'Zoom',
    //         link: 'https://zoom.us/j/123456789',
    //         status: 'live',
    //     },
    //     {
    //         id: 3,
    //         subject: 'Tiếng Anh',
    //         teacher: 'Cô Lê Thị Hoa',
    //         grade: 'Lớp 3',
    //         time: '10:30 - 11:30',
    //         day: 'Thứ 2, Thứ 4, Thứ 6',
    //         platform: 'Microsoft Teams',
    //         link: 'https://teams.microsoft.com/l/meetup',
    //         status: 'upcoming',
    //     },
    //     {
    //         id: 4,
    //         subject: 'Khoa học',
    //         teacher: 'Thầy Phạm Văn Nam',
    //         grade: 'Lớp 5',
    //         time: '14:00 - 15:00',
    //         day: 'Thứ 3, Thứ 5',
    //         platform: 'Google Meet',
    //         link: 'https://meet.google.com/xyz-abcd-efg',
    //         status: 'recorded',
    //     },
    //     {
    //         id: 5,
    //         subject: 'Toán học',
    //         teacher: 'Cô Hoàng Thị Linh',
    //         grade: 'Lớp 6',
    //         time: '08:00 - 09:00',
    //         day: 'Thứ 2, Thứ 4, Thứ 6',
    //         platform: 'Zoom',
    //         link: 'https://zoom.us/j/987654321',
    //         status: 'upcoming',
    //     },
    //     {
    //         id: 6,
    //         subject: 'Văn học',
    //         teacher: 'Cô Đỗ Thị Hương',
    //         grade: 'Lớp 7',
    //         time: '09:15 - 10:15',
    //         day: 'Thứ 3, Thứ 5',
    //         platform: 'Google Meet',
    //         link: 'https://meet.google.com/klm-nopq-rst',
    //         status: 'upcoming',
    //     },
    // ];

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setSelectedTab(newValue);
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
                        Kế hoạch dạy học trực tuyến
                    </Typography>
                    <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
                        Kế hoạch và lịch trình dạy học trực tuyến các khối lớp
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg">
                {/* Tabs Navigation */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
                    <Tabs
                        value={selectedTab}
                        onChange={handleTabChange}
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
                        <Tab label="Kế hoạch dạy học" />
                        <Tab label="Hướng dẫn tham gia" />
                    </Tabs>
                </Box>

                {/* Tab 0: Kế hoạch dạy học */}
                {selectedTab === 0 && (
                    <Box>
                        {/* <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'var(--primary-color)' }}>
                            Kế hoạch dạy học trực tuyến
                        </Typography> */}
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'var(--primary-color)', mb: 2 }}>
                            Chức năng này đang phát triển
                        </Typography>

                        {/* <Box sx={{ mb: 3 }}>
                            <Tabs
                                value={selectedGrade}
                                onChange={handleGradeChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{
                                    '& .MuiTab-root': { minHeight: 40 },
                                    '& .Mui-selected': { color: 'var(--primary-color) !important' },
                                    '& .MuiTabs-indicator': { backgroundColor: 'var(--primary-color)' },
                                }}
                            >
                                {grades.map((grade) => (
                                    <Tab key={grade} label={grade === 'all' ? 'Tất cả' : grade} value={grade} />
                                ))}
                            </Tabs>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'rgba(124, 179, 66, 0.1)' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Môn học</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Giáo viên</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Lớp</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Thời gian</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Ngày học</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredClasses.map((cls) => (
                                        <TableRow key={cls.id} sx={{ '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' } }}>
                                            <TableCell sx={{ fontWeight: 600 }}>{cls.subject}</TableCell>
                                            <TableCell>{cls.teacher}</TableCell>
                                            <TableCell>{cls.grade}</TableCell>
                                            <TableCell>{cls.time}</TableCell>
                                            <TableCell>{cls.day}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={getStatusLabel(cls.status)}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: getStatusColor(cls.status),
                                                        color: 'white',
                                                        fontWeight: 600,
                                                    }}
                                                    icon={
                                                        cls.status === 'live' ? (
                                                            <LiveTvIcon sx={{ color: 'white !important' }} />
                                                        ) : undefined
                                                    }
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    sx={{
                                                        bgcolor: 'var(--primary-color)',
                                                        '&:hover': { bgcolor: 'var(--accent-color)' },
                                                    }}
                                                    href={cls.link}
                                                    target="_blank"
                                                >
                                                    {cls.status === 'live' ? 'Tham gia ngay' : 'Xem chi tiết'}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer> */}
                    </Box>
                )}

                {/* Tab 1: Hướng dẫn tham gia */}
                {selectedTab === 1 && (
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: 'var(--primary-color)' }}>
                            Hướng dẫn tham gia lớp học trực tuyến
                        </Typography>
                        <Grid container spacing={3}>
                            {[
                                {
                                    title: 'Cách tham gia lớp học trực tuyến',
                                    steps: [
                                        'Truy cập trang Dạy học trực tuyến',
                                        'Chọn lớp học phù hợp với khối lớp',
                                        'Click vào nút "Tham gia ngay" hoặc "Xem chi tiết"',
                                        'Nhập mã lớp học (nếu có) và tham gia',
                                    ],
                                },
                                {
                                    title: 'Yêu cầu kỹ thuật',
                                    steps: [
                                        'Máy tính hoặc thiết bị di động có kết nối Internet',
                                        'Trình duyệt: Chrome, Firefox, Safari (phiên bản mới nhất)',
                                        'Webcam và microphone (khuyến nghị)',
                                        'Tốc độ Internet tối thiểu: 5 Mbps',
                                    ],
                                },
                                {
                                    title: 'Quy định khi học trực tuyến',
                                    steps: [
                                        'Tham gia đúng giờ theo lịch học',
                                        'Bật camera và microphone khi giáo viên yêu cầu',
                                        'Trang phục lịch sự, không gian học tập yên tĩnh',
                                        'Tương tác tích cực, đặt câu hỏi khi cần',
                                    ],
                                },
                            ].map((guide, index) => (
                                <Grid size={{ xs: 12, md: 4 }} key={index}>
                                    <Card sx={{ p: 3, height: '100%' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                                            {guide.title}
                                        </Typography>
                                        <Box component="ol" sx={{ pl: 2 }}>
                                            {guide.steps.map((step, idx) => (
                                                <Typography component="li" key={idx} variant="body2" sx={{ mb: 1 }}>
                                                    {step}
                                                </Typography>
                                            ))}
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        <Card sx={{ p: 4, mt: 4, bgcolor: 'rgba(124, 179, 66, 0.05)' }}>
                            <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                                Cần hỗ trợ kỹ thuật?
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#666', mb: 3, textAlign: 'center' }}>
                                Liên hệ với bộ phận IT để được hỗ trợ về vấn đề kỹ thuật
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    sx={{
                                        bgcolor: 'var(--primary-color)',
                                        '&:hover': { bgcolor: 'var(--accent-color)' },
                                    }}
                                >
                                    Hotline: 024 1234 5678
                                </Button>
                                <Button
                                    variant="outlined"
                                    sx={{
                                        borderColor: 'var(--primary-color)',
                                        color: 'var(--primary-color)',
                                        '&:hover': {
                                            borderColor: 'var(--accent-color)',
                                            bgcolor: 'rgba(124, 179, 66, 0.05)',
                                        },
                                    }}
                                >
                                    Email: support@amis.edu.vn
                                </Button>
                            </Box>
                        </Card>
                    </Box>
                )}
            </Container>
        </Box>
    );
}
