import { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, useMediaQuery, Link as MuiLink } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link } from 'react-router-dom';
import Footer from "../components/Footer";

export default function NotFound() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const disableContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', disableContextMenu);
        return () => document.removeEventListener('contextmenu', disableContextMenu);
    }, []);

    return (
        <Box
            sx={{
                minHeight: '98vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: 'background.default',
                overflow: 'hidden',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: '1 0 auto',
                    width: '100%',
                }}
            >
                <Card
                    sx={{
                        maxWidth: 500,
                        width: '100%',
                        textAlign: 'center',
                        p: isMobile ? 3 : 5,
                        borderRadius: 3,
                        boxShadow: 6,
                        mx: 2,
                    }}
                >
                    <CardContent>
                        <ErrorOutlineIcon sx={{ fontSize: isMobile ? 60 : 100, color: 'primary.main' }} />
                        <Typography variant={isMobile ? 'h3' : 'h1'} component="h1" sx={{ mt: 2, fontWeight: 'bold' }}>
                            404
                        </Typography>
                        <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ mt: 1, color: 'text.secondary' }}>
                            Page not found
                        </Typography>
                        <Typography sx={{ mt: 2, mb: 4, color: 'text.secondary' }}>
                            Unfortunately, there is no such page on our platform. You may have made a mistake in the link or the page has been moved.
                        </Typography>
                        <Link to="/">
                            <Button
                                variant="contained"
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                }}
                            >
                                Back
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </Box>

        <Footer/>
        </Box>
    );
}
