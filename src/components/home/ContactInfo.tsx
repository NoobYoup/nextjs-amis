import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

export default function ContactInfo() {
    const contacts = [
        {
            title: 'Địa chỉ trường',
            icon: <LocationOnIcon sx={{ fontSize: 36, color: '#7cb342' }} />,
            description: '62-62A Minh Phụng, Phường Bình Tây, Thành phố Hồ Chí Minh',
        },
        {
            title: 'Hotline tuyển sinh',
            icon: <PhoneIcon sx={{ fontSize: 36, color: '#7cb342' }} />,
            description: '028.39695278 - 028.39695280\nTiến sĩ Tony Nguyễn: 0834566818',
        },
    ];

    return (
        <section style={{ padding: '80px 0', background: '#f8f9fa' }}>
            <Container maxWidth="lg">
                <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', color: 'var(--primary-color)' }}>
                    Thông tin liên hệ
                </Typography>
                <Typography variant="h6" sx={{ display: 'block', textAlign: 'center', mb: 4, color: '#555' }}>
                    Liên hệ với chúng tôi để được tư vấn chi tiết
                </Typography>
                <Grid container spacing={4}>
                    {contacts.map((contact, index) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={index}>
                            <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }} elevation={3}>
                                <Box>{contact.icon}</Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, mt: 2 }}>
                                    {contact.title}
                                </Typography>
                                <Typography sx={{ mt: 1 }}>{contact.description}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </section>
    );
}
