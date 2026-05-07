import {Button, Stack} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Dashboard ({onLogout}) {
    const user = JSON.parse(localStorage.getItem("usr_acc")) || {
        first_name: "Unknown",
        last_name: "User",
        role: "Unknown role"
    };

    return (
        <Stack spacing={2} alignItems="flex-start">
            <div>
                logged in<br/> {JSON.stringify(user, null, 2)}
            </div>
            <Button variant="outlined" startIcon={<LogoutIcon />} onClick={onLogout}>
                Log out
            </Button>
        </Stack>
    );
}
