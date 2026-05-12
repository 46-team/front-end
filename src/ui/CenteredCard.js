import {Card, CardContent, useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";

export default function CenteredCard({children, maxWidth = 500, contentSx, sx}) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
        <Card
            sx={{
                maxWidth,
                width: "100%",
                textAlign: "center",
                p: isMobile ? 2 : 4,
                boxShadow: 6,
                mx: 2,
                ...sx,
            }}
        >
            <CardContent sx={contentSx}>
                {children}
            </CardContent>
        </Card>
    );
}
