'use client';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import FacebookIcon from '@mui/icons-material/Facebook';
import YouTubeIcon from '@mui/icons-material/YouTube';
// import TikTokIcon from '@mui/icons-material/TikTok';

export default function Footer() {
    return (
        <Box component="footer" sx={{ background: '#183f6d', color: 'white', py: 4, mt: 6 }}>
            <Container maxWidth="lg">
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ flex: '1 1 260px' }}>
                        <Typography variant="h5" sx={{ color: '#7cb342', fontWeight: 700 }}>
                            AMIS School
                        </Typography>
                        <Typography sx={{ mt: 1 }}>
                            Australian American International School - Nơi ươm mầm tương lai cho thế hệ trẻ.
                        </Typography>
                    </Box>
                    <Box sx={{ flex: '1 1 200px' }}>
                        <Typography>Liên kết nhanh</Typography>
                        <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Link
                                href="https://www.facebook.com/TruongQuocTeMyUc.AMIS"
                                target="_blank"
                                style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center' }}
                            >
                                <FacebookIcon sx={{ mr: 1 }} /> Facebook
                            </Link>
                            <Link
                                href="https://www.youtube.com/@AmisTruongQT"
                                target="_blank"
                                style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center' }}
                            >
                                <YouTubeIcon sx={{ mr: 1 }} /> YouTube
                            </Link>
                            <Link
                                href="https://www.tiktok.com/@_truongquoctemyuc_"
                                target="_blank"
                                style={{ color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center' }}
                            >
                                <i
                                    className="fa-brands fa-tiktok"
                                    style={{ marginRight: '12px', fontSize: '16px' }}
                                ></i>{' '}
                                TikTok
                            </Link>
                        </Box>
                    </Box>
                    <Box sx={{ flex: '1 1 200px' }}>
                        <Typography variant="subtitle1">Đối tác</Typography>
                        <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.8)' }}>
                            University of Cambridge
                            <br />
                            University of Wisconsin
                            <br />
                            University of Michigan
                            <br />
                            ETS - Educational Testing Service
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography>
                        &copy; 2025 AMIS School. Powered by{' '}
                        <Link
                            href={'https://www.facebook.com/noobyoup'}
                            style={{ textDecoration: 'underline', color: 'var(--primary-color)' }}
                            target="_blank"
                        >
                            Trung
                        </Link>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
