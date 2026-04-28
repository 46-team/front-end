import {useEffect, useState} from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Footer from "../../components/Footer";
import Swal from 'sweetalert2';
import {showError} from "../../utils/Modal";
import {sendWS, subscribeWS} from "../../utils/Websocket";
import { motion } from 'framer-motion';

export default function Login({setPage}) {
    localStorage.clear();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [login, setLogin] = useState(undefined);
    const [password, setPassword] = useState(undefined);

    useEffect(() => {
        const disableContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', disableContextMenu);
        return () => document.removeEventListener('contextmenu', disableContextMenu);
    }, []);

    function handleLogin(e) {
        if (!login || !password) {
            showError("Error", "Some required data for authorization is missing.")
        } else {
            sendWS({
                "type": "auth",
                "login": login,
                "password": password
            })
        }
    }

    subscribeWS("auth", (payload) => {
        localStorage.setItem("usr_acc", JSON.stringify(payload.user));
        localStorage.setItem("device_token", payload.token);
        setPage("main");
    })

    subscribeWS("null", (payload) => {
        if (!payload.is_ok) {
            showError('Error',payload['error']);
        }
    });

    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    const textVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i = 1) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.2, duration: 0.2 }
        })
    };

    function handleKey(e) {
        if (e.key === 'Enter') {
            handleLogin(e);
        }
    }

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
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
                >
                    <Card
                        sx={{
                            maxWidth: 450,
                            width: '100%',
                            textAlign: 'center',
                            p: isMobile ? 3 : 5,
                            borderRadius: 3,
                            boxShadow: 6,
                            mx: 2,
                        }}
                    >
                        <CardContent>
                            <motion.div custom={1} variants={textVariants}>
                                <LockOpenIcon sx={{ fontSize: isMobile ? 60 : 80, color: 'primary.main' }} />
                            </motion.div>
                            <motion.div custom={2} variants={textVariants}>
                                <Typography variant={isMobile ? 'h4' : 'h3'} component="h1" sx={{ mt: 2, fontWeight: 'bold' }}>
Login                                </Typography>
                            </motion.div>
                            <motion.div custom={3} variants={textVariants}>
                                <Typography sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
                                    Enter your login details                                </Typography>
                            </motion.div>

                            <motion.div custom={4} variants={textVariants}>
                                <TextField
                                    label="Login"
                                    variant="outlined"
                                    fullWidth
                                    autoComplete="off"
                                    sx={{ mb: 2 }}
                                    value={login}
                                    onChange={e => setLogin(e.target.value)}
                                    onKeyPress={e => handleKey(e)}

                                />
                            </motion.div>
                            <motion.div custom={5} variants={textVariants}>
                                <TextField
                                    label="Password"
                                    type="password"
                                    variant="outlined"
                                    autoComplete="off"

                                    fullWidth
                                    sx={{ mb: 3 }}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyPress={e => handleKey(e)}
                                />
                            </motion.div>

                            <motion.div custom={6} variants={textVariants}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1rem',
                                        textTransform: 'none',
                                        borderRadius: 2,
                                    }}
                                    onClick={(e) => {handleLogin(e)}}
                                >
                                    Sign in
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </Box>

            <Footer/>
        </Box>
    );
}
