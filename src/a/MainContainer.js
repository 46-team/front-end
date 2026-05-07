import {Box, Paper, Typography} from "@mui/material";
import AdminRoleManagement from "./admin/AdminRoleManagement";

export default function Dashboard () {
    const user = JSON.parse(localStorage.getItem("usr_acc")) || {
        first_name: "Unknown",
        last_name: "User",
        role: "Unknown role"
    };

    return (
        <Box sx={{maxWidth: 1100, mx: "auto", p: {xs: 2, md: 4}}}>
            <Paper sx={{p: 2, borderRadius: 1}}>
                <Typography variant="h6" component="h1">
                    Logged in
                </Typography>
                <Typography
                    component="pre"
                    sx={{
                        m: 0,
                        mt: 1,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        fontFamily: "monospace",
                        fontSize: 13,
                    }}
                >
                    {JSON.stringify(user, null, 2)}
                </Typography>
            </Paper>

            {user?.role === "admin" && (
                <AdminRoleManagement currentUser={user}/>
            )}
        </Box>
    );
}
