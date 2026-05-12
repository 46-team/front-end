import {Paper} from "@mui/material";

export default function AppSurface({children, sx, ...props}) {
    return (
        <Paper
            {...props}
            sx={{
                p: {xs: 2, sm: 3},
                ...sx,
            }}
        >
            {children}
        </Paper>
    );
}
