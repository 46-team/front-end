import {useCallback, useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsIcon from "@mui/icons-material/Groups";
import RefreshIcon from "@mui/icons-material/Refresh";
import SaveIcon from "@mui/icons-material/Save";
import SearchIcon from "@mui/icons-material/Search";
import {requestWS} from "../../api/wsClient";
import {formatDate, formatDateTime, getTournamentErrorMessage, isAuthError} from "./tournamentFormatters";
import AppSurface from "../../ui/AppSurface";

const TOURNAMENT_STATUSES = ["Draft", "Registration", "Running", "Finished"];

const ASSIGNMENT_ERROR_MESSAGES = {
    "Authentication required": "Please sign in again.",
    "Invalid token": "Please sign in again.",
    "Access denied": "Only the tournament organizer can assign participants.",
    "Required data is missing": "Tournament and participant selection are required.",
    "Invalid tournament_id": "Invalid tournament id.",
    "Tournament not found": "Tournament was not found.",
    "Invalid participant_ids": "Participant selection is invalid.",
    "Invalid user_id": "One selected user has an invalid id.",
    "User not found": "One selected user was not found.",
};

const STATUS_ERROR_MESSAGES = {
    "Authentication required": "Please sign in again.",
    "Invalid token": "Please sign in again.",
    "Access denied": "Only the tournament organizer can change the status.",
    "Required data is missing": "Tournament and status are required.",
    "Invalid tournament_id": "Invalid tournament id.",
    "Invalid status": "Choose a valid tournament status.",
    "Tournament not found": "Tournament was not found.",
};

function getAssignmentErrorMessage(error) {
    const rawMessage = error?.message || error?.raw?.error || "Request failed. Please try again.";
    return ASSIGNMENT_ERROR_MESSAGES[rawMessage] || rawMessage;
}

function getStatusErrorMessage(error) {
    const code = String(error?.code || error?.raw?.err_code || "").replace(/^#/, "");
    const rawMessage = error?.message || error?.raw?.error || "Status update failed. Please try again.";

    if (code === "AUTH_TOKEN_EMPTY" || code === "INSECURE_CONNECTION") return "Please sign in again.";
    if (code === "FORBIDDEN") return "Only the tournament organizer can change the status.";
    if (code === "INCOMPLETE_REQUEST") return "Tournament and status are required.";
    if (code === "INVALID_ID") return "Invalid tournament id.";
    if (code === "INVALID_STATUS") return "Choose a valid tournament status.";
    if (code === "NOT_FOUND") return "Tournament was not found.";

    return STATUS_ERROR_MESSAGES[rawMessage] || rawMessage;
}

function DetailRow({label, value}) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {xs: "1fr", sm: "150px 1fr"},
                gap: {xs: 0.25, sm: 2},
            }}
        >
            <Typography variant="body2" sx={{color: "text.secondary"}}>
                {label}
            </Typography>
            <Typography sx={{fontWeight: 600, wordBreak: "break-word"}}>
                {value || "-"}
            </Typography>
        </Box>
    );
}

function ParticipantName({participant}) {
    const displayName = participant.full_name || participant.login || participant.email || participant._id;

    return (
        <Box sx={{minWidth: 0}}>
            <Typography sx={{fontWeight: 700, wordBreak: "break-word"}}>
                {displayName}
            </Typography>
            <Typography variant="body2" sx={{color: "text.secondary", wordBreak: "break-word"}}>
                {participant.email || "-"}
            </Typography>
        </Box>
    );
}

function getUserLabel(user) {
    return user.full_name || user.login || user.email || user._id || "Unnamed user";
}

function getUserId(userOrId) {
    return typeof userOrId === "object" && userOrId !== null ? userOrId._id : userOrId;
}

function getTournamentCreatorLabel(tournament, currentUser) {
    const createdBy = tournament.created_by;
    const creatorId = getUserId(createdBy);

    if (createdBy && typeof createdBy === "object") {
        return getUserLabel(createdBy);
    }

    if (creatorId && creatorId === currentUser?._id) {
        return getUserLabel(currentUser);
    }

    return tournament.creator_name || tournament.created_by_name || "Unknown creator";
}

function mergeUsers(...userLists) {
    const usersById = new Map();

    userLists.flat().forEach(user => {
        if (user?._id && !usersById.has(user._id)) {
            usersById.set(user._id, user);
        }
    });

    return Array.from(usersById.values());
}

function TournamentParticipantAssignment({tournament, onAssigned, onAuthError}) {
    const assignedParticipants = useMemo(() => {
        return Array.isArray(tournament.participants) ? tournament.participants : [];
    }, [tournament.participants]);
    const [query, setQuery] = useState("");
    const [candidateUsers, setCandidateUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState(assignedParticipants);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const options = mergeUsers(selectedUsers, assignedParticipants, candidateUsers);

    const loadCandidateUsers = useCallback(async (searchText = "") => {
        try {
            setIsLoadingUsers(true);
            setError("");

            const payload = await requestWS("search_users", {
                purpose: "tournament_participants",
                query: searchText.trim(),
                limit: 50,
            });

            setCandidateUsers(Array.isArray(payload.users) ? payload.users : []);
        } catch (loadError) {
            const message = getAssignmentErrorMessage(loadError);
            setError(message);

            if (isAuthError(loadError)) {
                onAuthError?.();
            }
        } finally {
            setIsLoadingUsers(false);
        }
    }, [onAuthError]);

    useEffect(() => {
        setSelectedUsers(assignedParticipants);
    }, [tournament._id, assignedParticipants]);

    useEffect(() => {
        loadCandidateUsers("");
    }, [loadCandidateUsers]);

    function handleSearchSubmit(event) {
        event.preventDefault();
        loadCandidateUsers(query);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const participantIds = selectedUsers.map(user => user._id).filter(Boolean);

        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await requestWS("assign_tournament_participants", {
                tournament_id: tournament._id,
                participant_ids: participantIds,
            });

            await onAssigned?.();
            setSuccess("Participants assigned successfully.");
        } catch (assignError) {
            const message = getAssignmentErrorMessage(assignError);
            setError(message);

            if (isAuthError(assignError)) {
                onAuthError?.();
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AppSurface>
            <Stack spacing={2} component="form" onSubmit={handleSubmit}>
                <Box>
                    <Typography variant="h6" component="h2">
                        Assign participants
                    </Typography>
                    <Typography variant="body2" sx={{mt: 0.5, color: "text.secondary"}}>
                        Search users and choose who should participate in this tournament.
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" onClose={() => setSuccess("")}>
                        {success}
                    </Alert>
                )}

                <Stack
                    component="div"
                    direction={{xs: "column", sm: "row"}}
                    spacing={1}
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
                        type="button"
                        variant="outlined"
                        startIcon={isLoadingUsers ? <CircularProgress color="inherit" size={18}/> : <SearchIcon/>}
                        disabled={isLoadingUsers}
                        onClick={handleSearchSubmit}
                        sx={{minWidth: 120}}
                    >
                        Search
                    </Button>
                </Stack>

                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={options}
                    value={selectedUsers}
                    loading={isLoadingUsers}
                    getOptionLabel={getUserLabel}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    onChange={(event, nextUsers) => {
                        setSelectedUsers(nextUsers);
                        setSuccess("");
                    }}
                    renderOption={(props, option) => {
                        const {key, ...optionProps} = props;

                        return (
                            <Box component="li" {...optionProps} key={key}>
                                <Box sx={{minWidth: 0}}>
                                    <Typography variant="body2" sx={{fontWeight: 700, wordBreak: "break-word"}}>
                                        {getUserLabel(option)}
                                    </Typography>
                                    <Typography variant="caption" sx={{color: "text.secondary", wordBreak: "break-word"}}>
                                        {option.email || "-"} | {option.role || "participant"}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    }}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Participants"
                            placeholder="Choose users"
                            helperText={`${selectedUsers.length} selected`}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isLoadingUsers ? <CircularProgress color="inherit" size={18}/> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />

                <Box>
                    <Button
                        type="submit"
                        variant="contained"
                        startIcon={isSubmitting ? <CircularProgress color="inherit" size={18}/> : <SaveIcon/>}
                        disabled={isSubmitting}
                        sx={{minWidth: 190}}
                    >
                        Save participants
                    </Button>
                </Box>
            </Stack>
        </AppSurface>
    );
}

export default function TournamentDetailView({tournamentId: tournamentIdProp, currentUser, onAuthError}) {
    const {tournamentId: routeTournamentId} = useParams();
    const tournamentId = tournamentIdProp || routeTournamentId;
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusError, setStatusError] = useState("");
    const [statusSuccess, setStatusSuccess] = useState("");
    const [isStatusSubmitting, setIsStatusSubmitting] = useState(false);

    const loadTournament = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const payload = await requestWS("get_tournament", {
                tournament_id: tournamentId,
            });

            setTournament(payload.tournament || null);
        } catch (loadError) {
            const message = getTournamentErrorMessage(loadError);
            setTournament(null);
            setError(message);

            if (isAuthError(loadError)) {
                onAuthError?.();
            }
        } finally {
            setIsLoading(false);
        }
    }, [onAuthError, tournamentId]);

    useEffect(() => {
        loadTournament();
    }, [loadTournament]);

    async function handleStatusChange(event) {
        const nextStatus = event.target.value;

        if (!tournament || nextStatus === (tournament.status || "Draft")) {
            return;
        }

        try {
            setIsStatusSubmitting(true);
            setStatusError("");
            setStatusSuccess("");

            const payload = await requestWS("change_tournament_status", {
                tournament_id: tournament._id,
                status: nextStatus,
            });

            if (payload.tournament) {
                setTournament(payload.tournament);
            }

            await loadTournament();
            setStatusSuccess("Tournament status updated successfully.");
        } catch (changeError) {
            const message = getStatusErrorMessage(changeError);
            setStatusError(message);

            if (isAuthError(changeError)) {
                onAuthError?.();
            }
        } finally {
            setIsStatusSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <AppSurface>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={22}/>
                    <Typography>Loading tournament details...</Typography>
                </Stack>
            </AppSurface>
        );
    }

    if (error) {
        return (
            <AppSurface>
                <Stack spacing={2} alignItems="flex-start">
                    <Button
                        variant="text"
                        startIcon={<ArrowBackIcon/>}
                        onClick={() => navigate("/tournaments")}
                    >
                        Back to tournaments
                    </Button>
                    <Alert severity="error" sx={{width: "100%"}}>
                        {error}
                    </Alert>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon/>}
                        onClick={loadTournament}
                    >
                        Try again
                    </Button>
                </Stack>
            </AppSurface>
        );
    }

    if (!tournament) {
        return null;
    }

    const participants = Array.isArray(tournament.participants) ? tournament.participants : [];
    const creatorId = getUserId(tournament.created_by);
    const canManageTournament = currentUser?.role === "organizer" && creatorId === currentUser?._id;
    const currentStatus = tournament.status || "Draft";
    const creatorLabel = getTournamentCreatorLabel(tournament, currentUser);

    return (
        <Stack spacing={2}>
            <AppSurface>
                <Stack spacing={2}>
                    <Box>
                        <Button
                            variant="text"
                            startIcon={<ArrowBackIcon/>}
                            onClick={() => navigate("/tournaments")}
                            sx={{mb: 1}}
                        >
                            Back to tournaments
                        </Button>
                        <Stack direction={{xs: "column", sm: "row"}} spacing={1.5} alignItems={{xs: "flex-start", sm: "center"}}>
                            <Typography variant="h5" component="h2" sx={{wordBreak: "break-word"}}>
                                {tournament.title}
                            </Typography>
                            {canManageTournament ? (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TextField
                                        select
                                        label="Status"
                                        value={currentStatus}
                                        onChange={handleStatusChange}
                                        size="small"
                                        disabled={isStatusSubmitting}
                                        sx={{minWidth: 170}}
                                    >
                                        {TOURNAMENT_STATUSES.map(status => (
                                            <MenuItem key={status} value={status}>
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    {isStatusSubmitting && <CircularProgress size={20}/>}
                                </Stack>
                            ) : (
                                <Chip label={currentStatus} size="small"/>
                            )}
                        </Stack>
                        {tournament.description && (
                            <Typography sx={{mt: 1, color: "text.secondary"}}>
                                {tournament.description}
                            </Typography>
                        )}
                    </Box>

                    {statusError && (
                        <Alert severity="error" onClose={() => setStatusError("")}>
                            {statusError}
                        </Alert>
                    )}

                    {statusSuccess && (
                        <Alert severity="success" onClose={() => setStatusSuccess("")}>
                            {statusSuccess}
                        </Alert>
                    )}

                    <Divider/>

                    <Stack spacing={1.5}>
                        <DetailRow label="Start date" value={formatDate(tournament.start_date)}/>
                        <DetailRow label="End date" value={formatDate(tournament.end_date)}/>
                        <DetailRow label="Creator" value={creatorLabel}/>
                        <DetailRow label="Created" value={formatDateTime(tournament.created_at)}/>
                    </Stack>
                </Stack>
            </AppSurface>

            <AppSurface>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <GroupsIcon color="action"/>
                        <Typography variant="h6" component="h2">
                            Participants
                        </Typography>
                        <Chip label={participants.length} size="small"/>
                    </Stack>

                    {participants.length === 0 ? (
                        <Box>
                            <Typography sx={{fontWeight: 700}}>No participants assigned.</Typography>
                            <Typography variant="body2" sx={{mt: 0.5, color: "text.secondary"}}>
                                Assigned teams and judges will appear here.
                            </Typography>
                        </Box>
                    ) : (
                        <Stack divider={<Divider flexItem/>} spacing={1.5}>
                            {participants.map(participant => (
                                <Box
                                    key={participant._id}
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: {xs: "1fr", sm: "1fr auto"},
                                        gap: 1.5,
                                        alignItems: "center",
                                    }}
                                >
                                    <ParticipantName participant={participant}/>
                                    <Chip
                                        label={participant.role || "participant"}
                                        size="small"
                                        sx={{justifySelf: {xs: "start", sm: "end"}}}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </AppSurface>

            {canManageTournament && (
                <TournamentParticipantAssignment
                    tournament={tournament}
                    onAssigned={loadTournament}
                    onAuthError={onAuthError}
                />
            )}
        </Stack>
    );
}
