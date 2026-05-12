import {Button, Typography, useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import CenteredCard from "./CenteredCard";

export default function StatusCard({
    icon,
    code,
    title,
    description,
    actionLabel,
    actionIcon,
    onAction,
    actionComponent,
    maxWidth = 500,
}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const action = (
        <Button
            variant="contained"
            startIcon={actionIcon}
            sx={{
                px: 4,
                py: 1.5,
                fontSize: "1rem",
            }}
            onClick={onAction}
        >
            {actionLabel}
        </Button>
    );

    return (
        <CenteredCard maxWidth={maxWidth} sx={{p: isMobile ? 3 : 5}}>
            {icon}
            <Typography variant={isMobile ? "h3" : "h1"} component="h1" sx={{mt: 2}}>
                {code}
            </Typography>
            <Typography variant={isMobile ? "h5" : "h4"} sx={{mt: 1, color: "text.secondary"}}>
                {title}
            </Typography>
            <Typography sx={{mt: 2, mb: 4, color: "text.secondary"}}>
                {description}
            </Typography>
            {actionComponent ? actionComponent(action) : action}
        </CenteredCard>
    );
}
