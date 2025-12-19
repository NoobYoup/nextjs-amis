import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Grid from '@mui/material/Grid';

export default function Tuition() {
    const primaryColor = '#7cb342';
    const secondaryColor = '#2e7d32';

    const elementaryData = [
        { grade: 'Pre', tuition: '5,690,000' },
        { grade: 'Lớp 1', tuition: '5,690,000' },
        { grade: 'Lớp 2', tuition: '5,690,000' },
        { grade: 'Lớp 3', tuition: '6,290,000' },
        { grade: 'Lớp 4', tuition: '6,490,000' },
        { grade: 'Lớp 5', tuition: '6,390,000' },
    ];

    const middleSchoolData = [
        { grade: 'Lớp 6', tuition: '7,290,000' },
        { grade: 'Lớp 7', tuition: '7,590,000' },
        { grade: 'Lớp 8', tuition: '7,590,000' },
        { grade: 'Lớp 9', tuition: '7,690,000' },
    ];

    const includedFees = ['Chi phí ăn sáng, ăn trưa và ăn xế'];

    const notIncludedFees = [
        'Phí đồng phục',
        'Phí ngoại khóa',
        'Phí sách giáo khoa',
        'Phí cơ sở vật chất (2,990,000 đồng/năm)',
    ];

    const discountPolicy = [
        { description: 'Học sinh thứ 2 trong cùng gia đình', discount: 'Giảm 5%' },
        { description: 'Học sinh thứ 3 trong cùng gia đình', discount: 'Giảm 10%' },
    ];

    const TuitionTable = ({ data, title }: { data: typeof elementaryData; title: string }) => (
        <Box sx={{ mb: 4 }}>
            <Typography
                variant="h5"
                sx={{
                    fontWeight: 700,
                    color: secondaryColor,
                    mb: 2,
                    textAlign: 'center',
                }}
            >
                {title}
            </Typography>
            <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: primaryColor }}>
                            <TableCell
                                sx={{
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                }}
                            >
                                Lớp / Grade
                            </TableCell>
                            <TableCell
                                sx={{
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    textAlign: 'center',
                                }}
                            >
                                Học phí/tháng (VND)
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow
                                key={index}
                                sx={{
                                    backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white',
                                    '&:hover': {
                                        backgroundColor: 'rgba(124, 179, 66, 0.1)',
                                    },
                                }}
                            >
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>{row.grade}</TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: secondaryColor,
                                        textAlign: 'center',
                                        fontSize: '1.05rem',
                                    }}
                                >
                                    {row.tuition}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );

    return (
        <section style={{ padding: '80px 0', background: '#f8f9fa' }}>
            <Container maxWidth="lg">
                {/* Header */}
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: 700,
                        textAlign: 'center',
                        color: primaryColor,
                        mb: 2,
                    }}
                >
                    Học Phí
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                        display: 'block',
                        textAlign: 'center',
                        mb: 5,
                        color: '#555',
                    }}
                >
                    Chương trình giáo dục chất lượng cao với mức học phí hợp lý
                </Typography>

                {/* Tuition Tables */}
                <Box sx={{ mb: 5 }}>
                    <TuitionTable data={elementaryData} title="Tiểu Học (Grade 1-5)" />
                    <TuitionTable data={middleSchoolData} title="Trung Học Cơ Sở (Grade 6-9)" />
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Enrollment Fee */}
                <Box sx={{ mb: 5 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: secondaryColor,
                            mb: 2,
                        }}
                    >
                        Phí Ghi Danh
                    </Typography>
                    <Paper sx={{ p: 3, backgroundColor: 'rgba(124, 179, 66, 0.05)' }}>
                        <Typography sx={{ fontSize: '1.1rem', color: '#333' }}>
                            <strong>1,500,000 đồng / học sinh</strong>
                        </Typography>
                        <Typography sx={{ fontSize: '0.95rem', color: '#666', mt: 1 }}>
                            (Áp dụng khi học sinh xác nhận đăng ký)
                        </Typography>
                    </Paper>
                </Box>

                {/* Included and Not Included */}
                <Grid container spacing={3} sx={{ mb: 5 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                color: secondaryColor,
                                mb: 2,
                            }}
                        >
                            ✓ Học Phí Bao Gồm
                        </Typography>
                        <List sx={{ p: 0 }}>
                            {includedFees.map((fee, index) => (
                                <ListItem key={index} sx={{ p: 1, pl: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <CheckCircleIcon sx={{ color: primaryColor }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={fee}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                fontWeight: 500,
                                                color: '#333',
                                            },
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                color: secondaryColor,
                                mb: 2,
                            }}
                        >
                            ✗ Học Phí Chưa Bao Gồm
                        </Typography>
                        <List sx={{ p: 0 }}>
                            {notIncludedFees.map((fee, index) => (
                                <ListItem key={index} sx={{ p: 1, pl: 0 }}>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <CancelIcon sx={{ color: '#d32f2f' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={fee}
                                        sx={{
                                            '& .MuiListItemText-primary': {
                                                fontWeight: 500,
                                                color: '#333',
                                            },
                                        }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Discount Policy */}
                <Box sx={{ mb: 5 }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: secondaryColor,
                            mb: 2,
                        }}
                    >
                        Chính Sách Giảm Học Phí
                    </Typography>
                    <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: secondaryColor }}>
                                    <TableCell
                                        sx={{
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                        }}
                                    >
                                        Điều Kiện
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '1rem',
                                            textAlign: 'center',
                                        }}
                                    >
                                        Mức Giảm
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {discountPolicy.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{
                                            backgroundColor: index % 2 === 0 ? '#f5f5f5' : 'white',
                                            '&:hover': {
                                                backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                            },
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 500 }}>{row.description}</TableCell>
                                        <TableCell
                                            sx={{
                                                fontWeight: 700,
                                                color: primaryColor,
                                                textAlign: 'center',
                                                fontSize: '1.05rem',
                                            }}
                                        >
                                            {row.discount}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Payment Schedule */}
                <Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: secondaryColor,
                            mb: 2,
                        }}
                    >
                        Lịch Nộp Học Phí (4 đợt/năm học)
                    </Typography>
                    <Grid container spacing={2}>
                        {[
                            { period: 'Đợt 1', date: '01/08/2025', months: '2 tháng' },
                            { period: 'Đợt 2', date: '01/10/2025', months: '3 tháng' },
                            { period: 'Đợt 3', date: '01/01/2026', months: '2 tháng' },
                            { period: 'Đợt 4', date: '01/03/2026', months: '3 tháng' },
                        ].map((schedule, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                <Paper
                                    sx={{
                                        p: 3,
                                        textAlign: 'center',
                                        backgroundColor: 'rgba(124, 179, 66, 0.08)',
                                        border: `2px solid ${primaryColor}`,
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            color: secondaryColor,
                                            fontSize: '1.1rem',
                                            mb: 1,
                                        }}
                                    >
                                        {schedule.period}
                                    </Typography>
                                    <Typography sx={{ color: '#555', fontWeight: 600, mb: 1 }}>
                                        {schedule.date}
                                    </Typography>
                                    <Typography sx={{ color: primaryColor, fontWeight: 700 }}>
                                        {schedule.months}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>
        </section>
    );
}
