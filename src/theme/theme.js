import { createTheme } from "@mui/material/styles";

const BORDER_RADIUS = 8;
const BRAND_ORANGE = "#EF7F1A";
const BRAND_MAGENTA = "#A82682";
const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_ORANGE} 0%, ${BRAND_MAGENTA} 100%)`;

const theme = createTheme({
    palette: {
        primary: {
            main: BRAND_MAGENTA,
            light: "#C14B9E",
            dark: "#7D1D61",
            contrastText: "#FFFFFF",
        },
        secondary: {
            main: BRAND_ORANGE,
            light: "#F39B48",
            dark: "#B95D0E",
            contrastText: "#FFFFFF",
        },
        brand: {
            orange: BRAND_ORANGE,
            magenta: BRAND_MAGENTA,
            gradient: BRAND_GRADIENT,
        },
        text: {
            primary: "#111111",
            secondary: "#5F6368",
        },
        background: {
            default: "#F7F8FA",
            paper: "#FFFFFF",
            contrast: BRAND_GRADIENT,
        },
        divider: "rgba(17, 17, 17, 0.12)",
    },
    typography: {
        fontFamily: '"Montserrat", "Helvetica Neue", Arial, sans-serif',
        fontWeightRegular: 400,
        fontWeightBold: 900,
        h1: {
            color: BRAND_MAGENTA,
            fontWeight: 900,
        },
        h2: {
            color: BRAND_MAGENTA,
            fontWeight: 900,
        },
        h3: {
            color: BRAND_MAGENTA,
            fontWeight: 900,
        },
        h4: {
            color: BRAND_MAGENTA,
            fontWeight: 900,
        },
        h5: {
            color: BRAND_MAGENTA,
            fontWeight: 900,
        },
        h6: {
            color: BRAND_MAGENTA,
            fontWeight: 900,
        },
        subtitle1: {
            color: BRAND_ORANGE,
            fontWeight: 900,
        },
        subtitle2: {
            color: BRAND_ORANGE,
            fontWeight: 900,
        },
        button: {
            textTransform: "none",
            fontWeight: 700,
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
                    color: "#111111",
                    backgroundColor: "#F7F8FA",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: BORDER_RADIUS,
                    textTransform: "none",
                },
                containedPrimary: {
                    backgroundImage: BRAND_GRADIENT,
                    boxShadow: "0 8px 18px rgba(168, 38, 130, 0.22)",
                    "&:hover": {
                        boxShadow: "0 10px 22px rgba(168, 38, 130, 0.28)",
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: BORDER_RADIUS,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
                rounded: {
                    borderRadius: BORDER_RADIUS,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: BORDER_RADIUS,
                    fontWeight: 700,
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: "none",
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: BORDER_RADIUS,
                    "&.Mui-selected": {
                        backgroundColor: "rgba(255, 255, 255, 0.18)",
                    },
                    "&.Mui-selected:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.24)",
                    },
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
