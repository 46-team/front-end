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
    Paper,
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

function getAssignmentErrorMessage(error) {
    const rawMessage = error?.message || error?.raw?.error || "Request failed. Please try again.";
    return ASSIGNMENT_ERROR_MESSAGES[rawMessage] || rawMessage;
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
        <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
            <Stack spacing={2} component="form" onSubmit={handleSubmit}>
                <Box>
                    <Typography variant="h6" component="h2" sx={{fontWeight: 800}}>
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
                        sx={{textTransform: "none", minWidth: 120}}
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
                        sx={{textTransform: "none", minWidth: 190}}
                    >
                        Save participants
                    </Button>
                </Box>
            </Stack>
        </Paper>
    );
}

export default function TournamentDetailView({tournamentId: tournamentIdProp, currentUser, onAuthError}) {
    const {tournamentId: routeTournamentId} = useParams();
    const tournamentId = tournamentIdProp || routeTournamentId;
    const navigate = useNavigate();
    const [tournament, setTournament] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (isLoading) {
        return (
            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={22}/>
                    <Typography>Loading tournament details...</Typography>
                </Stack>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack spacing={2} alignItems="flex-start">
                    <Button
                        variant="text"
                        startIcon={<ArrowBackIcon/>}
                        onClick={() => navigate("/tournaments")}
                        sx={{textTransform: "none"}}
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
                        sx={{textTransform: "none"}}
                    >
                        Try again
                    </Button>
                </Stack>
            </Paper>
        );
    }

    if (!tournament) {
        return null;
    }

    const participants = Array.isArray(tournament.participants) ? tournament.participants : [];
    const canAssignParticipants = currentUser?.role === "organizer" && tournament.created_by === currentUser?._id;

    return (
        <Stack spacing={2}>
            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack spacing={2}>
                    <Box>
                        <Button
                            variant="text"
                            startIcon={<ArrowBackIcon/>}
                            onClick={() => navigate("/tournaments")}
                            sx={{textTransform: "none", mb: 1}}
                        >
                            Back to tournaments
                        </Button>
                        <Stack direction={{xs: "column", sm: "row"}} spacing={1.5} alignItems={{xs: "flex-start", sm: "center"}}>
                            <Typography variant="h5" component="h2" sx={{fontWeight: 800, wordBreak: "break-word"}}>
                                {tournament.title}
                            </Typography>
                            <Chip label={tournament.status || "Draft"} size="small" sx={{borderRadius: 1}}/>
                        </Stack>
                        {tournament.description && (
                            <Typography sx={{mt: 1, color: "text.secondary"}}>
                                {tournament.description}
                            </Typography>
                        )}
                    </Box>

                    <Divider/>

                    <Stack spacing={1.5}>
                        <DetailRow label="Start date" value={formatDate(tournament.start_date)}/>
                        <DetailRow label="End date" value={formatDate(tournament.end_date)}/>
                        <DetailRow label="Creator" value={tournament.created_by}/>
                        <DetailRow label="Created" value={formatDateTime(tournament.created_at)}/>
                    </Stack>
                </Stack>
            </Paper>

            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack spacing={2}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <GroupsIcon color="action"/>
                        <Typography variant="h6" component="h2" sx={{fontWeight: 800}}>
                            Participants
                        </Typography>
                        <Chip label={participants.length} size="small" sx={{borderRadius: 1}}/>
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
                                        sx={{borderRadius: 1, justifySelf: {xs: "start", sm: "end"}}}
                                    />
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Paper>

            {canAssignParticipants && (
                <TournamentParticipantAssignment
                    tournament={tournament}
                    onAssigned={loadTournament}
                    onAuthError={onAuthError}
                />
            )}
        </Stack>
    );
}
