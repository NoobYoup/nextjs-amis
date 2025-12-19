'use client';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

function BackToTop({ threshold = 200 }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > threshold);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    const handleClick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <Button
            variant="contained"
            color="primary"
            onClick={handleClick}
            aria-label="Back to top"
            sx={{
                position: 'fixed',
                bottom: 20,
                right: 20,
                minWidth: 'auto',
                width: 40,
                height: 40,
                borderRadius: '50%',

                backgroundColor: '#1976d2',
                '&:hover': {
                    backgroundColor: '#1565c0',
                },
                display: visible ? 'flex' : 'none',
            }}
        >
            <KeyboardArrowUpIcon />
        </Button>
    );
}

export default BackToTop;
