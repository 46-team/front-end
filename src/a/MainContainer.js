import {useEffect, useMemo, useState} from "react";
import {matchPath, useLocation, useNavigate} from "react-router-dom";
import {Box, Button, Chip, Divider, Paper, Stack, Typography} from "@mui/material";
import AboutProject from "./about/AboutProject";
import AdminRoleManagement from "./admin/AdminRoleManagement";
import {getStoredUser} from "./auth/authStorage";
import AuthenticatedLayout from "./layout/AuthenticatedLayout";
import {getNavigationForRole} from "./layout/appNavigation";
import {normalizeUser} from "./layout/userUtils";
import OrganizerTournamentCreation from "./organizer/OrganizerTournamentCreation";
import TournamentDetailView from "./tournaments/TournamentDetailView";
import TournamentListView from "./tournaments/TournamentListView";

const PAGE_TITLES = {
    overview: "Overview",
    tournaments: "Tournaments",
    team: "Team",
    judging: "Judging",
    organizer: "Organizer",
    "role-management": "Role management",
    "about-project": "About Project",
};

function WorkspacePanel({title, subtitle}) {
    return (
        <AppSurface>
            <Typography variant="h5" component="h2">
                {title}
            </Typography>
            <Typography sx={{mt: 1, color: "text.secondary"}}>
                {subtitle}
            </Typography>
        </AppSurface>
    );
}

function TeamWorkspace({user, onOpenTournaments}) {
    const references = [
        ["Team name", user.full_name || user.displayName],
        ["Login", user.login || "-"],
        ["Contact email", user.email || "-"],
        ["Account id", user._id || "-"],
    ];

    const actions = [
        {
            title: "Register for tournaments",
            description: "Open the tournaments list to join available competitions during registration.",
        },
        {
            title: "Track participation",
            description: "Check current status, dates, and participant details for tournaments assigned to your team.",
        },
        {
            title: "Submit your project",
            description: "When a tournament starts, use its detail page to send the repository, demo video, and optional links.",
        },
    ];

    return (
        <Stack spacing={2}>
            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack spacing={2}>
                    <Stack direction={{xs: "column", sm: "row"}} spacing={1.5} alignItems={{xs: "flex-start", sm: "center"}}>
                        <Box sx={{minWidth: 0, flex: 1}}>
                            <Typography variant="h5" component="h2" sx={{fontWeight: 800, wordBreak: "break-word"}}>
                                {user.full_name || user.displayName}
                            </Typography>
                            <Typography sx={{mt: 0.5, color: "text.secondary"}}>
                                Team workspace for participation, registration, and submissions.
                            </Typography>
                        </Box>
                        <Chip label="Team account" sx={{fontWeight: 700}}/>
                    </Stack>

                    <Button
                        variant="contained"
                        onClick={onOpenTournaments}
                        sx={{textTransform: "none", alignSelf: "flex-start"}}
                    >
                        Open tournaments
                    </Button>
                </Stack>
            </Paper>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {xs: "1fr", md: "1.2fr 1fr"},
                    gap: 2,
                }}
            >
                <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                    <Typography variant="h6" component="h2" sx={{fontWeight: 800}}>
                        Team profile
                    </Typography>
                    <Stack spacing={1.5} sx={{mt: 2}}>
                        {references.map(([label, value]) => (
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

                <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                    <Typography variant="h6" component="h2" sx={{fontWeight: 800}}>
                        Access
                    </Typography>
                    <Stack spacing={1.25} sx={{mt: 2}}>
                        <DetailTag label="Role" value={user.roleLabel}/>
                        <DetailTag label="Login" value={user.login || "-"}/>
                        <DetailTag label="Email" value={user.email || "-"}/>
                    </Stack>
                </Paper>
            </Box>

            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Typography variant="h6" component="h2" sx={{fontWeight: 800}}>
                    What your team can do
                </Typography>
                <Stack divider={<Divider flexItem/>} spacing={2} sx={{mt: 2}}>
                    {actions.map(action => (
                        <Box key={action.title}>
                            <Typography sx={{fontWeight: 700}}>
                                {action.title}
                            </Typography>
                            <Typography variant="body2" sx={{mt: 0.5, color: "text.secondary"}}>
                                {action.description}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Paper>
        </Stack>
    );
}

function DetailTag({label, value}) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                px: 1.5,
                py: 1.25,
                borderRadius: 1,
                bgcolor: "grey.50",
            }}
        >
            <Typography variant="body2" sx={{color: "text.secondary"}}>
                {label}
            </Typography>
            <Typography sx={{fontWeight: 700, wordBreak: "break-word", textAlign: "right"}}>
                {value}
            </Typography>
        </Box>
    );
}

function Overview({user}) {
    const quickActions = [
        {
            title: "Browse tournaments",
            description: "Open the tournaments section to track active competitions, statuses, and deadlines.",
        },
        {
            title: "Use your role workspace",
            description: user.role === "team"
                ? "Go to Team to manage participation context and team-specific activity."
                : user.role === "jury"
                    ? "Go to Judging to review assignments and judging-related work."
                    : user.role === "organizer"
                        ? "Go to Organizer to create tournaments and manage tournament flow."
                        : "Use the role-specific sections in the sidebar for your current responsibilities.",
        },
        {
            title: "Open tournament details",
            description: "Each tournament page gives access to participants, current state, and next actions.",
        },
    ];

    const workspaceNotes = [
        ["Current role", user.roleLabel],
        ["Available sections", user.role === "admin" ? "Overview, Tournaments, Role management" : "Overview and role-specific navigation"],
        ["Session", "Authenticated"],
    ];

    return (
        <Stack spacing={2}>
            <Paper
                sx={{
                    p: {xs: 2.5, sm: 3.5},
                    borderRadius: 1,
                    background: "linear-gradient(135deg, #f7f4ed 0%, #ffffff 100%)",
                    border: theme => `1px solid ${theme.palette.divider}`,
                }}
            >
                <Stack spacing={2}>
                    <Box>
                        <Typography
                            variant="overline"
                            sx={{letterSpacing: "0.12em", color: "text.secondary", fontWeight: 700}}
                        >
                            Workspace overview
                        </Typography>
                        <Typography variant="h4" component="h2" sx={{mt: 0.5, fontWeight: 800}}>
                            Welcome back, {user.displayName}
                        </Typography>
                        <Typography sx={{mt: 1, maxWidth: 720, color: "text.secondary"}}>
                            This is the main workspace entry point. Use it to orient yourself, then move into tournaments
                            or your role-specific section for actual work.
                        </Typography>
                    </Box>

                    <Stack direction={{xs: "column", sm: "row"}} spacing={1.25} flexWrap="wrap" useFlexGap>
                        <Chip label={user.roleLabel} sx={{fontWeight: 700, borderRadius: 1}}/>
                        <Chip label="Workspace active" variant="outlined" sx={{borderRadius: 1}}/>
                    </Stack>
                </Stack>
            </Paper>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {xs: "1fr", lg: "1.4fr 0.9fr"},
                    gap: 2,
                }}
            >
                <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                    <Typography variant="h6" component="h3" sx={{fontWeight: 800}}>
                        Getting started
                    </Typography>
                    <Stack spacing={1.5} sx={{mt: 2}}>
                        {quickActions.map(item => (
                            <Box
                                key={item.title}
                                sx={{
                                    p: 1.5,
                                    borderRadius: 1,
                                    bgcolor: "grey.50",
                                    border: theme => `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Typography sx={{fontWeight: 700, wordBreak: "break-word"}}>
                                    {item.title}
                                </Typography>
                                <Typography variant="body2" sx={{mt: 0.5, color: "text.secondary"}}>
                                    {item.description}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Paper>

                <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                    <Typography variant="h6" component="h3" sx={{fontWeight: 800}}>
                        Workspace status
                    </Typography>
                    <Stack spacing={1.25} sx={{mt: 2}}>
                        {workspaceNotes.map(([label, value]) => (
                            <DetailTag key={label} label={label} value={value}/>
                        ))}
                    </Stack>
                </Paper>
            </Box>
        </Stack>
    );
}

function renderPage(activeItem, user, onAuthError, tournamentId, onOpenTournaments) {
    if (activeItem === "about-project") {
        return <AboutProject/>;
    }

    if (activeItem === "role-management" && user.role === "admin") {
        return <AdminRoleManagement currentUser={user}/>;
    }

    if (activeItem === "team") {
        return <TeamWorkspace user={user} onOpenTournaments={onOpenTournaments}/>;
    }

    if (activeItem === "judging") {
        return <WorkspacePanel title="Judging workspace" subtitle="Assigned judging activity will appear here." />;
    }

    if (activeItem === "organizer" && user.role === "organizer") {
        return <OrganizerTournamentCreation/>;
    }

    if (activeItem === "tournaments") {
        if (tournamentId) {
            return <TournamentDetailView tournamentId={tournamentId} currentUser={user} onAuthError={onAuthError}/>;
        }

        return <TournamentListView onAuthError={onAuthError}/>;
    }

    return <Overview user={user}/>;
}

export default function MainContainer({onLogout}) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = normalizeUser(getStoredUser());
    const navigationItems = useMemo(() => getNavigationForRole(user.role), [user.role]);
    const firstItemId = navigationItems[0]?.id || "overview";
    const routeItem = location.pathname.startsWith("/tournaments")
        ? "tournaments"
        : location.pathname === "/about-project"
            ? "about-project"
            : null;
    const tournamentMatch = matchPath("/tournaments/:tournamentId", location.pathname);
    const tournamentId = tournamentMatch?.params?.tournamentId || "";
    const [activeItem, setActiveItem] = useState(routeItem || firstItemId);
    const isAllowedItem = navigationItems.some(item => item.id === activeItem);
    const visibleItem = isAllowedItem ? activeItem : firstItemId;

    useEffect(() => {
        if (routeItem) {
            setActiveItem(routeItem);
        }
    }, [routeItem]);

    function handleNavigate(itemId) {
        setActiveItem(itemId);

        if (itemId === "tournaments") {
            navigate("/tournaments");
            return;
        }

        if (itemId === "about-project") {
            navigate("/about-project");
            return;
        }

        if (location.pathname !== "/") {
            navigate("/");
        }
    }

    return (
        <AuthenticatedLayout
            user={user}
            activeItem={visibleItem}
            onNavigate={handleNavigate}
            onLogout={onLogout}
        >
            <Stack spacing={3} sx={{maxWidth: 1120, mx: "auto"}}>
                <Box>
                    <Typography variant="h4" component="h1">
                        {PAGE_TITLES[visibleItem] || PAGE_TITLES.overview}
                    </Typography>
                    <Typography sx={{mt: 0.5, color: "text.secondary"}}>
                        {user.roleLabel}
                    </Typography>
                </Box>
                {renderPage(visibleItem, user, onLogout, tournamentId, () => handleNavigate("tournaments"))}
            </Stack>
        </AuthenticatedLayout>
    );
}
