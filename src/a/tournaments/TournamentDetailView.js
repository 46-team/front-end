import {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Divider,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import GroupsIcon from "@mui/icons-material/Groups";
import RefreshIcon from "@mui/icons-material/Refresh";
import {requestWS} from "../../api/wsClient";
import {formatDate, formatDateTime, getTournamentErrorMessage, isAuthError} from "./tournamentFormatters";

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

export default function TournamentDetailView({tournamentId: tournamentIdProp, onAuthError}) {
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
        </Stack>
    );
}
