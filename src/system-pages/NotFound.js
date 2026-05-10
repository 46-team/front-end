import { useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Link } from 'react-router-dom';
import CenteredPage from "../ui/CenteredPage";
import StatusCard from "../ui/StatusCard";

export default function NotFound() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const disableContextMenu = (e) => e.preventDefault();
        document.addEventListener('contextmenu', disableContextMenu);
        return () => document.removeEventListener('contextmenu', disableContextMenu);
    }, []);

    return (
        <CenteredPage>
            <StatusCard
                icon={<ErrorOutlineIcon sx={{fontSize: isMobile ? 60 : 100, color: 'primary.main'}}/>}
                code="404"
                title="Page not found"
                description="Unfortunately, there is no such page on our platform. You may have made a mistake in the link or the page has been moved."
                actionLabel="Back"
                actionComponent={(action) => <Link to="/">{action}</Link>}
            />
        </CenteredPage>
    );
}
