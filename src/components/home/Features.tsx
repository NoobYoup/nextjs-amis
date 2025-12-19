import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Icon from '@mui/material/Icon';
import ChatIcon from '@mui/icons-material/Chat';
import GroupIcon from '@mui/icons-material/Group';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const features = [
    {
        title: 'Kỹ năng giao tiếp',
        icon: <ChatIcon />,
        desc: 'Phát triển khả năng giao tiếp hiệu quả bằng tiếng Anh và tiếng Việt',
    },
    {
        title: 'Kỹ năng làm việc nhóm',
        icon: <GroupIcon />,
        desc: 'Học cách hợp tác, lãnh đạo và làm việc hiệu quả trong nhóm',
    },
    {
        title: 'Kỹ năng thuyết trình',
        icon: <LightbulbIcon />,
        desc: 'Tự tin thể hiện ý tưởng và trình bày trước đám đông',
    },
];

export default function Features() {
    return (
        <section style={{ padding: '80px 0' }}>
            <Container maxWidth="lg">
                <Typography variant="h3" sx={{ fontWeight: 700, textAlign: 'center', color: 'var(--primary-color)' }}>
                    Chương trình đào tạo
                </Typography>
                <Typography variant="h6" sx={{ display: 'block', textAlign: 'center', mb: 4, color: '#555' }}>
                    Chương trình giảng dạy theo phương châm 5T và chuẩn quốc tế
                </Typography>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {features.map((f) => (
                        <Grid size={{ xs: 6, sm: 4, md: 4 }} key={f.title}>
                            <Paper sx={{ p: 4, borderRadius: 3, height: '100%' }} elevation={4}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Icon
                                        sx={{
                                            fontSize: 36,
                                            color: '#7cb342',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        {f.icon}
                                    </Icon>
                                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                        {f.title}
                                    </Typography>
                                </Box>
                                <Typography>{f.desc}</Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </section>
    );
}
