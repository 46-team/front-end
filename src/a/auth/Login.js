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
const EMAIL_FORMAT_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOGIN_FORMAT_RE = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;

const REGISTER_ERROR_MESSAGES = {
    "#INCOMPLETE_REQUEST": "Please fill in all required fields.",
    "#INVALID_PASSWORD": "Password must be at least 8 characters long.",
    "#INVALID_LOGIN": "Login must be 3-30 characters and use Latin letters, digits, '.', '_' or '-'.",
    "#INVALID_EMAIL": "Please enter a valid email address.",
    "#USER_ALREADY_EXISTS": "An account with this login or email already exists.",
};

const EMPTY_FIELD_ERRORS = {};

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
    const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);

    useEffect(() => {
        const disableContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', disableContextMenu);
        return () => document.removeEventListener('contextmenu', disableContextMenu);
    }, []);

    async function handleLogin() {
        const nextFieldErrors = {};

        if (!login.trim()) {
            nextFieldErrors.login = "Login or email is required.";
        }

        if (!password) {
            nextFieldErrors.password = "Password is required.";
        }

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            showError("Error", "Some required data for authorization is missing.");
            return;
        }

        try {
            setIsSubmitting(true);
            setFieldErrors(EMPTY_FIELD_ERRORS);
            const payload = await requestWS("auth", {
                "email": login.trim(),
                "password": password
            }, {
                auth: false
            });

            handleAuthSuccess(payload);
        } catch (error) {
            if (error?.code === "#INCORRECT_LOGIN") {
                setFieldErrors({
                    login: "Check your login or email.",
                    password: "Check your password.",
                });
            }
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
        const nextFieldErrors = validateRegistration(request, passwordConfirmation);

        if (Object.keys(nextFieldErrors).length > 0) {
            setFieldErrors(nextFieldErrors);
            showError("Registration failed", Object.values(nextFieldErrors)[0]);
            return;
        }

        try {
            setIsSubmitting(true);
            setFieldErrors(EMPTY_FIELD_ERRORS);
            const payload = await requestWS("register_account", request, {
                auth: false
            });

            handleAuthSuccess(payload);
        } catch (error) {
            setFieldErrors(getRegistrationFieldErrors(error));
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
        setFieldErrors(EMPTY_FIELD_ERRORS);
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

    function updateField(field, valueSetter, value) {
        valueSetter(value);
        if (!fieldErrors[field] && !(field === "password" && fieldErrors.passwordConfirmation)) {
            return;
        }

        setFieldErrors(currentErrors => {
            if (!shouldClearFieldError(field, value)) {
                return currentErrors;
            }

            const nextErrors = {...currentErrors};
            delete nextErrors[field];

            if (field === "password") {
                const nextPasswordMatches = passwordConfirmation && value === passwordConfirmation;
                if (nextPasswordMatches) {
                    delete nextErrors.passwordConfirmation;
                }
            }

            return nextErrors;
        });
    }

    function shouldClearFieldError(field, value) {
        const trimmedValue = typeof value === "string" ? value.trim() : value;

        switch (field) {
            case "login":
                return isRegister
                    ? Boolean(
                        trimmedValue
                        && trimmedValue.length >= 3
                        && trimmedValue.length <= 30
                        && LOGIN_FORMAT_RE.test(trimmedValue.toLowerCase())
                    )
                    : Boolean(trimmedValue);
            case "fullName":
                return Boolean(trimmedValue);
            case "email":
                return Boolean(trimmedValue && EMAIL_FORMAT_RE.test(trimmedValue));
            case "password":
                return Boolean(value && (!isRegister || value.length >= MIN_PASSWORD_LENGTH));
            case "passwordConfirmation":
                return Boolean(value && password === value);
            default:
                return true;
        }
    }

    function validateRegistration(request, confirmation) {
        const nextFieldErrors = {};

        if (!request.login) {
            nextFieldErrors.login = "Login is required.";
        } else if (
            request.login.length < 3
            || request.login.length > 30
            || !LOGIN_FORMAT_RE.test(request.login.toLowerCase())
        ) {
            nextFieldErrors.login = REGISTER_ERROR_MESSAGES["#INVALID_LOGIN"];
        }

        if (!request.full_name) {
            nextFieldErrors.fullName = "Full name is required.";
        }

        if (!request.email) {
            nextFieldErrors.email = "Email is required.";
        } else if (!EMAIL_FORMAT_RE.test(request.email)) {
            nextFieldErrors.email = REGISTER_ERROR_MESSAGES["#INVALID_EMAIL"];
        }

        if (!request.password) {
            nextFieldErrors.password = "Password is required.";
        } else if (request.password.length < MIN_PASSWORD_LENGTH) {
            nextFieldErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
        }

        if (!confirmation) {
            nextFieldErrors.passwordConfirmation = "Password confirmation is required.";
        } else if (request.password && request.password !== confirmation) {
            nextFieldErrors.passwordConfirmation = "Password confirmation does not match.";
        }

        return nextFieldErrors;
    }

    function getRegistrationFieldErrors(error) {
        const message = getRegistrationErrorMessage(error);

        switch (error?.code) {
            case "#INVALID_LOGIN":
                return {login: message};
            case "#INVALID_EMAIL":
                return {email: message};
            case "#INVALID_PASSWORD":
                return {password: message};
            case "#INCOMPLETE_REQUEST":
                return validateRegistration({
                    login: login.trim(),
                    full_name: fullName.trim(),
                    email: email.trim(),
                    password,
                }, passwordConfirmation);
            case "#USER_ALREADY_EXISTS":
                return {
                    login: message,
                    email: message,
                };
            default:
                return EMPTY_FIELD_ERRORS;
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
                                    onChange={e => updateField("login", setLogin, e.target.value)}
                                    onKeyDown={e => handleKey(e)}
                                    error={Boolean(fieldErrors.login)}
                                    helperText={fieldErrors.login || " "}

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
                                            onChange={e => updateField("fullName", setFullName, e.target.value)}
                                            onKeyDown={e => handleKey(e)}
                                            error={Boolean(fieldErrors.fullName)}
                                            helperText={fieldErrors.fullName || " "}
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
                                            onChange={e => updateField("email", setEmail, e.target.value)}
                                            onKeyDown={e => handleKey(e)}
                                            error={Boolean(fieldErrors.email)}
                                            helperText={fieldErrors.email || " "}
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
                                    onChange={e => updateField("password", setPassword, e.target.value)}
                                    onKeyDown={e => handleKey(e)}
                                    error={Boolean(fieldErrors.password)}
                                    helperText={fieldErrors.password || " "}
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
                                        onChange={e => updateField("passwordConfirmation", setPasswordConfirmation, e.target.value)}
                                        onKeyDown={e => handleKey(e)}
                                        error={Boolean(fieldErrors.passwordConfirmation)}
                                        helperText={fieldErrors.passwordConfirmation || " "}
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
