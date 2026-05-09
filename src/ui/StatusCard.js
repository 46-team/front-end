import {Button, Card, CardContent, Typography, useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";

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
        <Card
            sx={{
                maxWidth,
                width: "100%",
                textAlign: "center",
                p: isMobile ? 3 : 5,
                boxShadow: 6,
                mx: 2,
            }}
        >
            <CardContent>
                {icon}
                <Typography variant={isMobile ? "h3" : "h1"} component="h1" sx={{mt: 2, fontWeight: "bold"}}>
                    {code}
                </Typography>
                <Typography variant={isMobile ? "h5" : "h4"} sx={{mt: 1, color: "text.secondary"}}>
                    {title}
                </Typography>
                <Typography sx={{mt: 2, mb: 4, color: "text.secondary"}}>
                    {description}
                </Typography>
                {actionComponent ? actionComponent(action) : action}
            </CardContent>
        </Card>
    );
}
