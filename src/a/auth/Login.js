import {useEffect, useState} from 'react';
import { Typography, TextField, Button, useMediaQuery, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import {showError} from "../../utils/Modal";
import { motion } from 'framer-motion';
import {requestWS} from "../../api/wsClient";
import {storeAuthData} from "./authStorage";
import CenteredPage from "../../ui/CenteredPage";
import CenteredCard from "../../ui/CenteredCard";
import {cardEntranceVariants, staggeredItemVariants} from "../../ui/animations";

const MIN_PASSWORD_LENGTH = 8;

const REGISTER_ERROR_MESSAGES = {
    "#INCOMPLETE_REQUEST": "Please fill in all required fields.",
    "#INVALID_PASSWORD": "Password must be at least 8 characters long.",
    "#USER_ALREADY_EXISTS": "An account with this login or email already exists.",
};

export default function Login({setPage}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mode, setMode] = useState("login");
    const [login, setLogin] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const disableContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', disableContextMenu);
        return () => document.removeEventListener('contextmenu', disableContextMenu);
    }, []);

    async function handleLogin() {
        if (!login.trim() || !password) {
            showError("Error", "Some required data for authorization is missing.")
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = await requestWS("auth", {
                "email": login.trim(),
                "password": password
            }, {
                auth: false
            });

            handleAuthSuccess(payload);
        } catch (error) {
            showError('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleRegister() {
        const request = {
            login: login.trim(),
            full_name: fullName.trim(),
            email: email.trim(),
            password,
        };

        if (!request.login || !request.full_name || !request.email || !request.password || !passwordConfirmation) {
            showError("Registration failed", "Please fill in all required fields.");
            return;
        }

        if (request.password.length < MIN_PASSWORD_LENGTH) {
            showError("Registration failed", `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
            return;
        }

        if (request.password !== passwordConfirmation) {
            showError("Registration failed", "Password confirmation does not match.");
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = await requestWS("register_account", request, {
                auth: false
            });

            handleAuthSuccess(payload);
        } catch (error) {
            showError("Registration failed", getRegistrationErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleAuthSuccess(payload) {
        storeAuthData(payload.user, payload.token);
        setPage("main");
    }

    function getRegistrationErrorMessage(error) {
        if (REGISTER_ERROR_MESSAGES[error?.code]) {
            return REGISTER_ERROR_MESSAGES[error.code];
        }

        if (REGISTER_ERROR_MESSAGES[error?.message]) {
            return REGISTER_ERROR_MESSAGES[error.message];
        }

        return error?.message || "Registration failed. Please try again.";
    }

    function resetForm() {
        setLogin("");
        setFullName("");
        setEmail("");
        setPassword("");
        setPasswordConfirmation("");
    }

    function switchMode(nextMode) {
        if (mode === nextMode) {
            return;
        }

        resetForm();
        setMode(nextMode);
    }

    function handleSubmit() {
        if (mode === "register") {
            handleRegister();
        } else {
            handleLogin();
        }
    }

    function handleKey(e) {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    }

    const isRegister = mode === "register";
    const loginFieldLabel = isRegister ? "Login" : "Login or email";

    return (
        <CenteredPage>
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={cardEntranceVariants}
                    style={{ display: 'flex', justifyContent: 'center', width: '100%' }}
                >
                    <CenteredCard maxWidth={450}>
                            <motion.div custom={1} variants={staggeredItemVariants}>
                                {isRegister
                                    ? <PersonAddAlt1Icon sx={{ fontSize: isMobile ? 54 : 72, color: 'primary.main' }} />
                                    : <LockOpenIcon sx={{ fontSize: isMobile ? 54 : 72, color: 'primary.main' }} />
                                }
                            </motion.div>
                            <motion.div custom={2} variants={staggeredItemVariants}>
                                <Typography variant={isMobile ? 'h4' : 'h3'} component="h1" sx={{ mt: 2, fontWeight: 'bold' }}>
                                    {isRegister ? "Register" : "Login"}
                                </Typography>
                            </motion.div>
                            <motion.div custom={3} variants={staggeredItemVariants}>
                                <Typography sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
                                    {isRegister ? "Create your account" : "Enter your login or email"}
                                </Typography>
                            </motion.div>

                            <motion.div custom={4} variants={staggeredItemVariants}>
                                <TextField
                                    label={loginFieldLabel}
                                    fullWidth
                                    autoComplete="off"
                                    sx={{ mb: 2 }}
                                    value={login}
                                    onChange={e => setLogin(e.target.value)}
                                    onKeyDown={e => handleKey(e)}

                                />
                            </motion.div>
                            {isRegister && (
                                <>
                                    <motion.div custom={5} variants={staggeredItemVariants}>
                                        <TextField
                                            label="Full name"
                                            fullWidth
                                            autoComplete="name"
                                            sx={{ mb: 2 }}
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            onKeyDown={e => handleKey(e)}
                                        />
                                    </motion.div>
                                    <motion.div custom={6} variants={staggeredItemVariants}>
                                        <TextField
                                            label="Email"
                                            type="email"
                                            fullWidth
                                            autoComplete="email"
                                            sx={{ mb: 2 }}
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            onKeyDown={e => handleKey(e)}
                                        />
                                    </motion.div>
                                </>
                            )}
                            <motion.div custom={isRegister ? 7 : 5} variants={staggeredItemVariants}>
                                <TextField
                                    label="Password"
                                    type="password"
                                    autoComplete={isRegister ? "new-password" : "current-password"}

                                    fullWidth
                                    sx={{ mb: isRegister ? 2 : 3 }}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => handleKey(e)}
                                />
                            </motion.div>
                            {isRegister && (
                                <motion.div custom={8} variants={staggeredItemVariants}>
                                    <TextField
                                        label="Confirm password"
                                        type="password"
                                        autoComplete="new-password"
                                        fullWidth
                                        sx={{ mb: 3 }}
                                        value={passwordConfirmation}
                                        onChange={e => setPasswordConfirmation(e.target.value)}
                                        onKeyDown={e => handleKey(e)}
                                    />
                                </motion.div>
                            )}

                            <motion.div custom={isRegister ? 9 : 6} variants={staggeredItemVariants}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={isSubmitting}
                                    sx={{
                                        py: 1.5,
                                        fontSize: '1rem',
                                    }}
                                    onClick={() => {handleSubmit()}}
                                >
                                    {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
                                </Button>
                            </motion.div>
                            <motion.div custom={isRegister ? 10 : 7} variants={staggeredItemVariants}>
                                <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        {isRegister ? "Already have an account?" : "New here?"}
                                    </Typography>
                                    <Button
                                        variant="text"
                                        disabled={isSubmitting}
                                        sx={{ minWidth: 'auto', px: 1 }}
                                        onClick={() => switchMode(isRegister ? "login" : "register")}
                                    >
                                        {isRegister ? "Sign in" : "Register"}
                                    </Button>
                                </Stack>
                            </motion.div>
                    </CenteredCard>
                </motion.div>
        </CenteredPage>
    );
}
