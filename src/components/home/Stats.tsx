import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export default function Stats() {
    const stats = [
        { label: 'Năm kinh nghiệm', value: '10+' },
        { label: 'Học sinh', value: '100+' },
        { label: 'Giáo viên', value: '10+' },
        { label: 'Chất lượng', value: '100%' },
    ];

    return (
        <section style={{ padding: '60px 0', background: '#f8f9fa' }}>
            <Container maxWidth="lg">
                <Grid container spacing={3} justifyContent="center" alignItems="center">
                    {stats.map((s) => (
                        <Grid size={{ xs: 6, md: 3 }} key={s.label}>
                            <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }} elevation={3}>
                                <Typography variant="h3" sx={{ color: '#7cb342', fontWeight: 800 }}>
                                    {s.value}
                                </Typography>
                                <Typography sx={{ mt: 1 }}>{s.label}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </section>
    );
}
