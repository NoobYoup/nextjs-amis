'use client';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Image from 'next/image';

export default function Hero() {
    return (
        <section
            style={{
                background: 'linear-gradient(135deg, #7cb342 0%, #4caf50 100%)',
                color: 'white',
                padding: '80px 0',
            }}
        >
            <Container maxWidth="lg">
                <Grid container alignItems="center" spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                            <Typography
                                variant="h3"
                                sx={{ fontWeight: 800, textShadow: '2px 2px 6px rgba(0,0,0,0.2)' }}
                            >
                                AMIS School
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 2, opacity: 0.95 }}>
                                Trường Tiểu học & Trung học Cơ sở Quốc tế Mỹ Úc
                            </Typography>
                            <Typography sx={{ mt: 2 }}>
                                Công nghệ đào tạo tiên tiến - Chất lượng giảng dạy vượt trội
                            </Typography>
                            {/* <Button
                                variant="contained"
                                sx={{ mt: 3, borderRadius: 8, background: 'white', color: '#7cb342', fontWeight: 700 }}
                            >
                                Tìm hiểu thêm
                            </Button> */}
                        </Box>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Image
                                src="/images/hero_backround.jpg"
                                alt="AMIS"
                                width={400}
                                height={400}
                                style={{
                                    borderRadius: 12,
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Container>
        </section>
    );
}
