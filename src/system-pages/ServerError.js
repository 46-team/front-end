import {useEffect} from 'react';
import {Box, Card, CardContent, Typography, Button, useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {Link} from 'react-router-dom';
import Footer from "../components/Footer";
import RefreshIcon from '@mui/icons-material/Refresh';

export default function ServerError() {
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
                        <ErrorOutlineIcon
                            sx={{
                                fontSize: isMobile ? 60 : 100,
                                color: 'error.main',
                            }}
                        />

                        <Typography
                            variant={isMobile ? 'h3' : 'h1'}
                            component="h1"
                            sx={{mt: 2, fontWeight: 'bold'}}
                        >
                            500
                        </Typography>

                        <Typography
                            variant={isMobile ? 'h5' : 'h4'}
                            sx={{mt: 1, color: 'text.secondary'}}
                        >
                            Server error
                        </Typography>

                        <Typography
                            sx={{mt: 2, mb: 4, color: 'text.secondary'}}
                        >
                            An internal server error has occurred. We are working to fix it.
                            Try refreshing the page or coming back later.
                        </Typography>

                        <Link to="/" onClick={(event) => {
                            event.preventDefault();
                            window.location.reload();
                        }}>
                            <Button
                                variant="contained"
                                startIcon={<RefreshIcon/>}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    fontSize: '1rem',
                                    textTransform: 'none',
                                    borderRadius: 2,
                                }}
                            >
                                Refresh page
                            </Button>
                        </Link>

                    </CardContent>
                </Card>
            </Box>

            <Footer/>
        </Box>
    );
}
