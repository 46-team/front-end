import {useState} from "react";
import {
    AppBar,
    Box,
    Button,
    Chip,
    Divider,
    Drawer,
    IconButton,
    Stack,
    Toolbar,
    Typography,
    useMediaQuery,
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import RoleNavigation from "./RoleNavigation";
import UserSummary from "./UserSummary";
import {normalizeUser} from "./userUtils";

const DRAWER_WIDTH = 280;

export default function AuthenticatedLayout({user, activeItem, onNavigate, onLogout, children}) {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const normalizedUser = normalizeUser(user);

    function handleNavigate(itemId) {
        onNavigate(itemId);
        setIsDrawerOpen(false);
    }

    const drawerContent = (
        <Stack sx={{height: "100%"}}>
            <Box sx={{p: 2}}>
                <Typography variant="h6" component="div" sx={{fontWeight: 800}}>
                    SFLU
                </Typography>
                <Typography variant="body2" sx={{color: "text.secondary"}}>
                    Authenticated app
                </Typography>
            </Box>
            <Divider/>
            <Box sx={{p: 2}}>
                <UserSummary user={normalizedUser}/>
            </Box>
            <RoleNavigation
                role={normalizedUser.role}
                activeItem={activeItem}
                onNavigate={handleNavigate}
            />
            <Box sx={{flexGrow: 1}}/>
            <Box sx={{p: 2}}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    startIcon={<LogoutIcon/>}
                    onClick={onLogout}
                    sx={{justifyContent: "flex-start", textTransform: "none"}}
                >
                    Logout
                </Button>
            </Box>
        </Stack>
    );

    return (
        <Box sx={{minHeight: "100vh", bgcolor: "background.default"}}>
            <AppBar
                position="fixed"
                color="inherit"
                elevation={0}
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    width: {md: `calc(100% - ${DRAWER_WIDTH}px)`},
                    ml: {md: `${DRAWER_WIDTH}px`},
                }}
            >
                <Toolbar sx={{gap: 1.5}}>
                    {!isDesktop && (
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="Open navigation"
                            onClick={() => setIsDrawerOpen(true)}
                        >
                            <MenuIcon/>
                        </IconButton>
                    )}
                    <Box sx={{flexGrow: 1, minWidth: 0}}>
                        <Typography variant="h6" component="h1" sx={{fontWeight: 800, lineHeight: 1.2}}>
                            Dashboard
                        </Typography>
                        <Chip
                            label={normalizedUser.roleLabel}
                            size="small"
                            sx={{display: {xs: "inline-flex", md: "none"}, mt: 0.5, borderRadius: 1}}
                        />
                    </Box>
                    <Box sx={{display: {xs: "none", sm: "block"}, maxWidth: 280}}>
                        <UserSummary user={normalizedUser} compact/>
                    </Box>
                    <IconButton color="inherit" aria-label="Logout" onClick={onLogout}>
                        <LogoutIcon/>
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{width: {md: DRAWER_WIDTH}, flexShrink: {md: 0}}}
                aria-label="Application navigation"
            >
                <Drawer
                    variant="temporary"
                    open={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    ModalProps={{keepMounted: true}}
                    sx={{
                        display: {xs: "block", md: "none"},
                        "& .MuiDrawer-paper": {width: DRAWER_WIDTH},
                    }}
                >
                    {drawerContent}
                </Drawer>
                <Drawer
                    variant="permanent"
                    open
                    sx={{
                        display: {xs: "none", md: "block"},
                        "& .MuiDrawer-paper": {width: DRAWER_WIDTH, boxSizing: "border-box"},
                    }}
                >
                    {drawerContent}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    ml: {md: `${DRAWER_WIDTH}px`},
                    pt: {xs: 9, sm: 10},
                    px: {xs: 2, sm: 3, md: 4},
                    pb: 4,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}
