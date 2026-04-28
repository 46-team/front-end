import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { styled, keyframes } from "@mui/system";
import Box from "@mui/material/Box";
import { Card, CardContent, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const rotate = keyframes`
  0% { transform: rotate(0deg);}
  100% { transform: rotate(360deg);}
`;

const Spinner = styled(CircularProgress)(() => ({
    color: "#00adef",
    animationDuration: "1.2s",
    "& .MuiCircularProgress-svg": {
        transformOrigin: "center center",
        animation: `${rotate} 1.2s linear infinite`,
    },
    "& .MuiCircularProgress-circle": {
        strokeLinecap: "round",
    },
}));

export default function Loader({ text = "Loading..." }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Box
            sx={{
                minHeight: '98vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default',
                overflow: 'hidden',
            }}
        >
            <Card
                sx={{
                    maxWidth: 400,
                    width: '100%',
                    textAlign: 'center',
                    p: isMobile ? 3 : 5,
                    borderRadius: 3,
                    boxShadow: 6,
                    mx: 2,
                }}
            >
                <CardContent>
                    <Spinner
                        size={isMobile ? 50 : 60}
                        thickness={5}
                        variant="indeterminate"
                    />

                    <Typography
                        variant={isMobile ? "h6" : "h5"}
                        sx={{
                            mt: 3,
                            color: "text.secondary",
                        }}
                    >
                        {text}
                    </Typography>
                </CardContent>
            </Card>
        </Box>
    );
}