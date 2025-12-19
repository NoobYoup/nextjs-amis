'use client';

import { useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SendIcon from '@mui/icons-material/Send';
import SchoolIcon from '@mui/icons-material/School';
import { toast } from 'react-toastify';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const contactInfo = [
        {
            icon: <LocationOnIcon sx={{ fontSize: 40 }} />,
            title: 'Địa chỉ',
            content: '62-62A Minh Phụng, Phường Bình Tây, Thành phố Hồ Chí Minh',
            color: '#e53935',
        },
        {
            icon: <PhoneIcon sx={{ fontSize: 40 }} />,
            title: 'Điện thoại',
            content: 'Hotline: 028.39695278 - 028.39695280\nTiến sĩ Tony Nguyễn: 0834566818',
            color: '#43a047',
        },
        {
            icon: <EmailIcon sx={{ fontSize: 40 }} />,
            title: 'Email',
            content: 'info@amis.edu.vn\nadmissions@amis.edu.vn',
            color: '#1e88e5',
        },
        {
            icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
            title: 'Giờ làm việc',
            content: 'Thứ 2 - Thứ 6: 7:30 - 17:00',
            color: '#fb8c00',
        },
    ];

    const departments = [
        {
            name: 'Phòng Tuyển sinh',
            phone: '024 1234 5678',
            email: 'tuyensinh@amis.edu.vn',
        },
        {
            name: 'Phòng Đào tạo',
            phone: '024 1234 5679',
            email: 'daotao@amis.edu.vn',
        },
        {
            name: 'Phòng Kế toán',
            phone: '024 1234 5680',
            email: 'ketoan@amis.edu.vn',
        },
        {
            name: 'Phòng Hành chính',
            phone: '024 1234 5681',
            email: 'hanhchinh@amis.edu.vn',
        },
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
        //     console.log('Form submitted:', formData);
        //     setSubmitted(true);

        //     setTimeout(() => {
        //         setFormData({
        //             name: '',
        //             email: '',
        //             phone: '',
        //             subject: '',
        //             message: '',
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
                        <SchoolIcon sx={{ fontSize: 48 }} />
                        <Typography variant="h2" sx={{ fontWeight: 700 }}>
                            Liên hệ
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
                        Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ pb: 8 }}>
                {/* Contact Info Cards */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    {contactInfo.map((info, index) => (
                        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                            <Card
                                sx={{
                                    height: '100%',
                                    textAlign: 'center',
                                    p: 3,
                                    transition: 'transform 0.3s, box-shadow 0.3s',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: 4,
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        display: 'inline-flex',
                                        p: 2,
                                        borderRadius: '50%',
                                        bgcolor: `${info.color}15`,
                                        color: info.color,
                                        mb: 2,
                                    }}
                                >
                                    {info.icon}
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    {info.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ color: '#666', whiteSpace: 'pre-line', lineHeight: 1.8 }}
                                >
                                    {info.content}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Grid container spacing={4}>
                    {/* Contact Form */}
                    <Grid size={{ xs: 12, md: 7 }}>
                        {/* Map */}
                        <Card sx={{ overflow: 'hidden' }}>
                            <Box
                                sx={{
                                    width: '100%',
                                    height: '100%',
                                    bgcolor: '#e0e0e0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d582.6843920596709!2d106.64234205038215!3d10.748526588654048!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752e629e55c4f1%3A0xe706055cf174c128!2zNjIgxJAuIE1pbmggUGjhu6VuZywgUGjGsOG7nW5nIDIsIFF14bqtbiA2LCBUaMOgbmggcGjhu5EgSOG7kyBDaMOtIE1pbmgsIFZp4buHdCBOYW0!5e0!3m2!1svi!2s!4v1761076138889!5m2!1svi!2s"
                                    width="100%"
                                    height="300"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="School Location"
                                />
                            </Box>
                        </Card>
                    </Grid>

                    {/* Departments & Map */}
                    <Grid size={{ xs: 12, md: 5 }}>
                        {/* Departments */}
                        <Card sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'var(--primary-color)' }}>
                                Các phòng ban
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {departments.map((dept, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 2,
                                            borderRadius: 1,
                                            bgcolor: 'rgba(124, 179, 66, 0.05)',
                                            borderLeft: '4px solid var(--primary-color)',
                                        }}
                                    >
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                            {dept.name}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                            <PhoneIcon sx={{ fontSize: 16, color: '#666' }} />
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                {dept.phone}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <EmailIcon sx={{ fontSize: 16, color: '#666' }} />
                                            <Typography variant="body2" sx={{ color: '#666' }}>
                                                {dept.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        </Card>
                    </Grid>
                </Grid>

                {/* FAQ Section */}
                <Card sx={{ p: 4, mt: 4, bgcolor: 'rgba(124, 179, 66, 0.05)' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: 'var(--primary-color)' }}>
                        Câu hỏi thường gặp
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                Làm thế nào để đăng ký tuyển sinh?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                Quý phụ huynh có thể liên hệ trực tiếp với Phòng Tuyển sinh qua hotline hoặc email để
                                được hướng dẫn chi tiết về thủ tục đăng ký.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                Nhà trường có xe đưa đón không?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                Có, nhà trường có dịch vụ xe đưa đón học sinh với nhiều tuyến khác nhau. Vui lòng liên
                                hệ Phòng Hành chính để biết thêm chi tiết.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                Học phí được thanh toán như thế nào?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                Học phí có thể thanh toán theo học kỳ hoặc theo tháng. Phụ huynh có thể thanh toán trực
                                tiếp tại trường hoặc chuyển khoản. Liên hệ Phòng Kế toán để biết thêm chi tiết.
                            </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                                Nhà trường có tổ chức các hoạt động ngoại khóa không?
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                Có, nhà trường thường xuyên tổ chức các hoạt động ngoại khóa, câu lạc bộ, và các chuyến
                                tham quan học tập để phát triển toàn diện cho học sinh.
                            </Typography>
                        </Grid>
                    </Grid>
                </Card>
            </Container>
        </Box>
    );
}
