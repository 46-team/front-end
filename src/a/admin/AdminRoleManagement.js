import {useCallback, useEffect, useMemo, useState} from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import {requestWS} from "../../api/wsClient";
import {showError} from "../../utils/Modal";

const ROLES = ["admin", "team", "jury", "organizer"];

const ERROR_MESSAGES = {
    "Authentication required": "Please sign in again.",
    "Access denied": "Only admins can manage user roles.",
    "Required data is missing": "User and role are required.",
    "Invalid role": "Selected role is not valid.",
    "User not found": "User was not found.",
    "Users cannot change their own role": "You cannot change your own role.",
};

function getErrorMessage(error) {
    const rawMessage = error?.message || error?.error || "Request failed. Please try again.";
    return ERROR_MESSAGES[rawMessage] || rawMessage;
}

export default function AdminRoleManagement({currentUser}) {
    const [query, setQuery] = useState("");
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [error, setError] = useState("");

    const currentUserId = currentUser?._id;

    const usersById = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user._id] = user;
            return acc;
        }, {});
    }, [users]);

    const loadUsers = useCallback(async (searchText = "") => {
        try {
            setIsLoading(true);
            setError("");
            const payload = await requestWS("search_users", {
                purpose: "role_management",
                query: searchText.trim(),
                limit: 50,
            });

            setUsers(Array.isArray(payload.users) ? payload.users : []);
        } catch (loadError) {
            const message = getErrorMessage(loadError);
            setError(message);
            showError("User search failed", message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUsers("");
    }, [loadUsers]);

    async function handleRoleChange(targetUserId, nextRole) {
        const targetUser = usersById[targetUserId];

        if (targetUserId === currentUserId) {
            const message = ERROR_MESSAGES["Users cannot change their own role"];
            setError(message);
            showError("Role update failed", message);
            return;
        }

        if (!ROLES.includes(nextRole)) {
            const message = ERROR_MESSAGES["Invalid role"];
            setError(message);
            showError("Role update failed", message);
            return;
        }

        if (!targetUser) {
            const message = ERROR_MESSAGES["User not found"];
            setError(message);
            showError("Role update failed", message);
            return;
        }

        try {
            setUpdatingUserId(targetUserId);
            setError("");
            await requestWS("update_user_role", {
                target_user_id: targetUserId,
                role: nextRole,
            });
            await loadUsers(query);
        } catch (updateError) {
            const message = getErrorMessage(updateError);
            setError(message);
            showError("Role update failed", message);
        } finally {
            setUpdatingUserId(null);
        }
    }

    function handleSearchSubmit(event) {
        event.preventDefault();
        loadUsers(query);
    }

    return (
        <Box>
            <Stack spacing={2}>
                <Typography variant="body2" sx={{color: "text.secondary"}}>
                    Search users and update their access role.
                </Typography>

                <Stack
                    component="form"
                    direction={{xs: "column", sm: "row"}}
                    spacing={1}
                    onSubmit={handleSearchSubmit}
                >
                    <TextField
                        label="Search users"
                        value={query}
                        onChange={event => setQuery(event.target.value)}
                        size="small"
                        fullWidth
                        autoComplete="off"
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={<SearchIcon/>}
                        disabled={isLoading}
                        sx={{textTransform: "none", minWidth: 120}}
                    >
                        Search
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        startIcon={<RefreshIcon/>}
                        disabled={isLoading}
                        onClick={() => loadUsers(query)}
                        sx={{textTransform: "none", minWidth: 120}}
                    >
                        Refresh
                    </Button>
                </Stack>

                {error && (
                    <Alert severity="error" onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                <TableContainer component={Paper} sx={{borderRadius: 1}}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>User</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Login</TableCell>
                                <TableCell sx={{width: 220}}>Role</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {isLoading && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{py: 4}}>
                                        <CircularProgress size={28}/>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && users.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{py: 4, color: "text.secondary"}}>
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}

                            {!isLoading && users.map(user => {
                                const isCurrentUser = user._id === currentUserId;
                                const isUpdating = updatingUserId === user._id;

                                return (
                                    <TableRow key={user._id}>
                                        <TableCell>
                                            <Typography variant="body2" sx={{fontWeight: 600}}>
                                                {user.full_name || "Unnamed user"}
                                            </Typography>
                                            {isCurrentUser && (
                                                <Typography variant="caption" sx={{color: "text.secondary"}}>
                                                    You cannot change your own role.
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{user.email || "-"}</TableCell>
                                        <TableCell>{user.login || "-"}</TableCell>
                                        <TableCell>
                                            <FormControl size="small" fullWidth disabled={isCurrentUser || isUpdating}>
                                                <InputLabel id={`role-label-${user._id}`}>Role</InputLabel>
                                                <Select
                                                    labelId={`role-label-${user._id}`}
                                                    label="Role"
                                                    value={ROLES.includes(user.role) ? user.role : ""}
                                                    onChange={event => handleRoleChange(user._id, event.target.value)}
                                                >
                                                    {ROLES.map(role => (
                                                        <MenuItem key={role} value={role}>
                                                            {role}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Stack>
        </Box>
    );
}
