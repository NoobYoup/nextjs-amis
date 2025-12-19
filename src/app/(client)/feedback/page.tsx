'use client';

import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';
import { toast } from 'react-toastify';

export default function FeedbackPage() {
    const [formData, setFormData] = useState({
        parentName: '',
        studentName: '',
        studentClass: '',
        email: '',
        phone: '',
        feedbackType: '',
        subject: '',
        content: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const feedbackTypes = [
        'Chất lượng giảng dạy',
        'Cơ sở vật chất',
        'Hoạt động ngoại khóa',
        'Chế độ dinh dưỡng',
        'Thái độ giáo viên',
        'Học phí',
        'An toàn trường học',
        'Khác',
    ];

    const classes = [
        'Lớp 1A',
        'Lớp 1B',
        'Lớp 1C',
        'Lớp 2A',
        'Lớp 2B',
        'Lớp 2C',
        'Lớp 3A',
        'Lớp 3B',
        'Lớp 3C',
        'Lớp 4A',
        'Lớp 4B',
        'Lớp 4C',
        'Lớp 5A',
        'Lớp 5B',
        'Lớp 5C',
        'Lớp 6A',
        'Lớp 6B',
        'Lớp 6C',
        'Lớp 7A',
        'Lớp 7B',
        'Lớp 7C',
        'Lớp 8A',
        'Lớp 8B',
        'Lớp 8C',
        'Lớp 9A',
        'Lớp 9B',
        'Lớp 9C',
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        toast.info('Chức năng này đang phát triển');

        // if (validateForm()) {
        //     // Simulate form submission
        //     console.log('Form submitted:', formData);
        //     setSubmitted(true);

        //     // Reset form after 3 seconds
        //     setTimeout(() => {
        //         setFormData({
        //             parentName: '',
        //             studentName: '',
        //             studentClass: '',
        //             email: '',
        //             phone: '',
        //             feedbackType: '',
        //             subject: '',
        //             content: '',
        //         });
        //         setSubmitted(false);
        //     }, 3000);
        // }
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
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                        <FeedbackIcon sx={{ fontSize: 48 }} />
                        <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            Góp ý - Phản hồi
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
                        Ý kiến đóng góp của quý phụ huynh là nguồn động viên quý báu giúp nhà trường ngày càng hoàn
                        thiện hơn
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ pb: 8 }}>
                {/* Introduction */}
                <Card sx={{ p: 4, mb: 4, bgcolor: 'rgba(124, 179, 66, 0.05)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'var(--primary-color)' }}>
                        Kính gửi Quý Phụ huynh,
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
                        Nhà trường luôn mong muốn lắng nghe ý kiến đóng góp của Quý phụ huynh về mọi mặt hoạt động của
                        nhà trường. Mọi ý kiến của Quý phụ huynh đều được ghi nhận và xem xét một cách nghiêm túc.
                    </Typography>
                    <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                        Xin vui lòng điền đầy đủ thông tin vào form dưới đây. Nhà trường cam kết sẽ phản hồi trong vòng
                        3-5 ngày làm việc.
                    </Typography>
                </Card>

                {/* Success Alert */}
                {/* {submitted && (
                    <Alert icon={<CheckCircleIcon fontSize="inherit" />} severity="success" sx={{ mb: 4 }}>
                        Cảm ơn Quý phụ huynh đã gửi góp ý! Nhà trường sẽ phản hồi sớm nhất có thể.
                    </Alert>
                )} */}

                {/* Feedback Form */}
                <Card sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'var(--primary-color)' }}>
                        Form góp ý
                    </Typography>

                    <Box component="form" onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Parent Name */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Họ tên phụ huynh"
                                    name="parentName"
                                    value={formData.parentName}
                                    onChange={handleChange}
                                    error={!!errors.parentName}
                                    helperText={errors.parentName}
                                    placeholder="Nguyễn Văn A"
                                />
                            </Grid>

                            {/* Student Name */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Họ tên học sinh"
                                    name="studentName"
                                    value={formData.studentName}
                                    onChange={handleChange}
                                    error={!!errors.studentName}
                                    helperText={errors.studentName}
                                    placeholder="Nguyễn Văn B"
                                />
                            </Grid>

                            {/* Student Class */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    select
                                    label="Lớp"
                                    name="studentClass"
                                    value={formData.studentClass}
                                    onChange={handleChange}
                                    error={!!errors.studentClass}
                                    helperText={errors.studentClass}
                                >
                                    {classes.map((cls) => (
                                        <MenuItem key={cls} value={cls}>
                                            {cls}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Feedback Type */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    select
                                    label="Loại góp ý"
                                    name="feedbackType"
                                    value={formData.feedbackType}
                                    onChange={handleChange}
                                    error={!!errors.feedbackType}
                                    helperText={errors.feedbackType}
                                >
                                    {feedbackTypes.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {/* Email */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    type="email"
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={!!errors.email}
                                    helperText={errors.email}
                                    placeholder="example@email.com"
                                />
                            </Grid>

                            {/* Phone */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Số điện thoại"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={!!errors.phone}
                                    helperText={errors.phone}
                                    placeholder="0123456789"
                                />
                            </Grid>

                            {/* Subject */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Tiêu đề"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    error={!!errors.subject}
                                    helperText={errors.subject}
                                    placeholder="Nhập tiêu đề góp ý của bạn"
                                />
                            </Grid>

                            {/* Content */}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    required
                                    multiline
                                    rows={6}
                                    label="Nội dung góp ý"
                                    name="content"
                                    value={formData.content}
                                    onChange={handleChange}
                                    error={!!errors.content}
                                    helperText={errors.content || 'Tối thiểu 20 ký tự'}
                                    placeholder="Nhập nội dung góp ý chi tiết của bạn..."
                                />
                            </Grid>

                            {/* Submit Button */}
                            <Grid size={{ xs: 12 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    endIcon={<SendIcon />}
                                    sx={{
                                        bgcolor: 'var(--primary-color)',
                                        py: 1.5,
                                        fontSize: '1.1rem',
                                        fontWeight: 600,
                                        '&:hover': {
                                            bgcolor: 'var(--accent-color)',
                                        },
                                    }}
                                    onClick={handleSubmit}
                                >
                                    Gửi góp ý
                                </Button>
                            </Grid>
                        </Grid>
                    </Box>
                </Card>

                {/* Contact Info */}
                <Card sx={{ p: 4, mt: 4, bgcolor: 'rgba(124, 179, 66, 0.05)' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        Thông tin liên hệ trực tiếp
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Hotline:</strong> 024 1234 5678
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Email:</strong> feedback@amis.edu.vn
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                                <strong>Thời gian tiếp nhận:</strong> 7:30 - 17:00 (Thứ 2 - Thứ 6)
                            </Typography>
                            <Typography variant="body2">
                                <strong>Phòng:</strong> Văn phòng Hiệu trưởng - Tầng 1
                            </Typography>
                        </Grid>
                    </Grid>
                </Card>
            </Container>
        </Box>
    );
}
