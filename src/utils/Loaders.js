import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/system";
import { Card, CardContent, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CenteredPage from "../ui/CenteredPage";
import {rotate} from "../ui/animations";

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
        <CenteredPage footer={false}>
            <Card
                sx={{
                    maxWidth: 400,
                    width: '100%',
                    textAlign: 'center',
                    p: isMobile ? 3 : 5,
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
        </CenteredPage>
    );
}
