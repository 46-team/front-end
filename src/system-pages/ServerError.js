import {useEffect} from 'react';
import {useMediaQuery} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import {Link} from 'react-router-dom';
import RefreshIcon from '@mui/icons-material/Refresh';
import CenteredPage from "../ui/CenteredPage";
import StatusCard from "../ui/StatusCard";

export default function ServerError() {
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
                icon={<ErrorOutlineIcon sx={{fontSize: isMobile ? 60 : 100, color: 'error.main'}}/>}
                code="500"
                title="Server error"
                description="An internal server error has occurred. We are working to fix it. Try refreshing the page or coming back later."
                actionLabel="Refresh page"
                actionIcon={<RefreshIcon/>}
                actionComponent={(action) => (
                    <Link to="/" onClick={(event) => {
                        event.preventDefault();
                        window.location.reload();
                    }}>
                        {action}
                    </Link>
                )}
            />
        </CenteredPage>
    );
}
