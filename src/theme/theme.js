import { createTheme } from "@mui/material/styles";

const BORDER_RADIUS = 8;
const baseTheme = createTheme();

const theme = createTheme({
    palette: {
        primary: {
            main: baseTheme.palette.primary.main,
        },
        background: {
            default: baseTheme.palette.background.default,
            paper: baseTheme.palette.background.paper,
        },
    },
    typography: {
        fontFamily: baseTheme.typography.fontFamily,
        button: {
            textTransform: "none",
        },
    },
    shape: {
        borderRadius: BORDER_RADIUS,
    },
    spacing: 8,
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    margin: 0,
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: BORDER_RADIUS * 2,
                    textTransform: "none",
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: BORDER_RADIUS * 3,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                rounded: {
                    borderRadius: BORDER_RADIUS,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: "outlined",
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: BORDER_RADIUS,
                },
            },
        },
    },
});

export default theme;
