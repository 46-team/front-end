import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/system";
import { Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CenteredPage from "../ui/CenteredPage";
import CenteredCard from "../ui/CenteredCard";
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
            <CenteredCard maxWidth={400} sx={{p: isMobile ? 3 : 5}}>
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
            </CenteredCard>
        </CenteredPage>
    );
}
