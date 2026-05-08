import {useMemo, useState} from "react";
import {Box, Paper, Stack, Typography} from "@mui/material";
import AdminRoleManagement from "./admin/AdminRoleManagement";
import {getStoredUser} from "./auth/authStorage";
import AuthenticatedLayout from "./layout/AuthenticatedLayout";
import {getNavigationForRole} from "./layout/appNavigation";
import {normalizeUser} from "./layout/userUtils";
import OrganizerTournamentCreation from "./organizer/OrganizerTournamentCreation";

const PAGE_TITLES = {
    overview: "Overview",
    tournaments: "Tournaments",
    team: "Team",
    judging: "Judging",
    organizer: "Organizer",
    "role-management": "Role management",
};

function WorkspacePanel({title, subtitle}) {
    return (
        <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
            <Typography variant="h5" component="h2" sx={{fontWeight: 800}}>
                {title}
            </Typography>
            <Typography sx={{mt: 1, color: "text.secondary"}}>
                {subtitle}
            </Typography>
        </Paper>
    );
}

function Overview({user}) {
    const details = [
        ["Name", user.displayName],
        ["Email", user.email || "-"],
        ["Login", user.login || "-"],
        ["Role", user.roleLabel],
    ];

    return (
        <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
            <Typography variant="h5" component="h2" sx={{fontWeight: 800}}>
                Account summary
            </Typography>
            <Stack spacing={1.5} sx={{mt: 2}}>
                {details.map(([label, value]) => (
                    <Box
                        key={label}
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {xs: "1fr", sm: "140px 1fr"},
                            gap: {xs: 0.25, sm: 2},
                        }}
                    >
                        <Typography variant="body2" sx={{color: "text.secondary"}}>
                            {label}
                        </Typography>
                        <Typography sx={{fontWeight: 600, wordBreak: "break-word"}}>
                            {value}
                        </Typography>
                    </Box>
                ))}
            </Stack>
        </Paper>
    );
}

function renderPage(activeItem, user) {
    if (activeItem === "role-management" && user.role === "admin") {
        return <AdminRoleManagement currentUser={user}/>;
    }

    if (activeItem === "team") {
        return <WorkspacePanel title="Team workspace" subtitle="Team tournament activity will appear here." />;
    }

    if (activeItem === "judging") {
        return <WorkspacePanel title="Judging workspace" subtitle="Assigned judging activity will appear here." />;
    }

    if (activeItem === "organizer" && user.role === "organizer") {
        return <OrganizerTournamentCreation/>;
    }

    if (activeItem === "tournaments") {
        return <WorkspacePanel title="Tournaments" subtitle="Available tournaments will appear here." />;
    }

    return <Overview user={user}/>;
}

export default function MainContainer({onLogout}) {
    const user = normalizeUser(getStoredUser());
    const navigationItems = useMemo(() => getNavigationForRole(user.role), [user.role]);
    const firstItemId = navigationItems[0]?.id || "overview";
    const [activeItem, setActiveItem] = useState(firstItemId);
    const isAllowedItem = navigationItems.some(item => item.id === activeItem);
    const visibleItem = isAllowedItem ? activeItem : firstItemId;

    return (
        <AuthenticatedLayout
            user={user}
            activeItem={visibleItem}
            onNavigate={setActiveItem}
            onLogout={onLogout}
        >
            <Stack spacing={3} sx={{maxWidth: 1120, mx: "auto"}}>
                <Box>
                    <Typography variant="h4" component="h1" sx={{fontWeight: 800}}>
                        {PAGE_TITLES[visibleItem] || PAGE_TITLES.overview}
                    </Typography>
                    <Typography sx={{mt: 0.5, color: "text.secondary"}}>
                        {user.roleLabel}
                    </Typography>
                </Box>
                {renderPage(visibleItem, user)}
            </Stack>
        </AuthenticatedLayout>
    );
}
