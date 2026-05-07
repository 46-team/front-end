import {Avatar, Box, Chip, Stack, Typography} from "@mui/material";
import {getUserInitials, normalizeUser} from "./userUtils";

export default function UserSummary({user, compact = false}) {
    const normalizedUser = normalizeUser(user);

    return (
        <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{minWidth: 0}}
        >
            <Avatar sx={{width: compact ? 36 : 44, height: compact ? 36 : 44}}>
                {getUserInitials(normalizedUser)}
            </Avatar>
            <Box sx={{minWidth: 0}}>
                <Typography
                    variant={compact ? "body2" : "subtitle1"}
                    sx={{fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}
                >
                    {normalizedUser.displayName}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{display: "block", color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}
                >
                    {normalizedUser.secondaryText}
                </Typography>
                {!compact && (
                    <Chip
                        label={normalizedUser.roleLabel}
                        size="small"
                        sx={{mt: 1, borderRadius: 1, fontWeight: 700}}
                    />
                )}
            </Box>
        </Stack>
    );
}
