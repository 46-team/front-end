import {Box, Paper, Typography, Button, Stack} from "@mui/material";
import AdminRoleManagement from "./admin/AdminRoleManagement";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Dashboard ({onLogout}) {
    const user = JSON.parse(localStorage.getItem("usr_acc")) || {
        first_name: "Unknown",
        last_name: "User",
        role: "Unknown role"
    };

    return (
        <Box sx={{maxWidth: 1100, mx: "auto", p: {xs: 2, md: 4}}}>
            <Paper sx={{p: 2, borderRadius: 1}}>
                <Stack spacing={2} alignItems="flex-start">
                    <Typography variant="h6" component="h1">
                        Logged in
                    </Typography>

                    <Typography
                        component="pre"
                        sx={{
                            m: 0,
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                            fontFamily: "monospace",
                            fontSize: 13,
                        }}
                    >
                        {JSON.stringify(user, null, 2)}
                    </Typography>

                    <Button variant="outlined" startIcon={<LogoutIcon />} onClick={onLogout}>
                        Log out
                    </Button>
                </Stack>
            </Paper>

            {user?.role === "admin" && (
                <AdminRoleManagement currentUser={user}/>
            )}
        </Box>
    );
}
