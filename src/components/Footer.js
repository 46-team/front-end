import {Box, Typography, useMediaQuery} from "@mui/material";
import {useTheme} from "@mui/material/styles";

export default function Footer() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
    <Box
        component="footer"
        sx={{
            width: '100%',
            bgcolor: 'grey.100',
            borderTop: 1,
            borderColor: 'divider',
            py: 2,
            px: 2,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'center',
            alignItems: 'center',
            boxSizing: 'border-box',
        }}
    >


        <Typography
            variant={isMobile ? 'body2' : 'body1'}
            color="text.secondary"
            textAlign={isMobile ? 'center' : 'right'}
        >
            Version 1.0 | © 2026. All rights reserved.
        </Typography>
    </Box>
    );
}
