import {Box} from "@mui/material";
import Footer from "../components/Footer";

export default function CenteredPage({children, footer = true, contentSx, sx}) {
    return (
        <Box
            sx={{
                minHeight: "98vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: footer ? "space-between" : "center",
                bgcolor: "background.default",
                overflow: "hidden",
                ...sx,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flex: footer ? "1 0 auto" : undefined,
                    width: "100%",
                    ...contentSx,
                }}
            >
                {children}
            </Box>

            {footer && <Footer/>}
        </Box>
    );
}
