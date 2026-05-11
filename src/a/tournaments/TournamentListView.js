import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
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
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {requestWS} from "../../api/wsClient";
import {formatDate, isAuthError} from "./tournamentFormatters";

const ACTUAL_TOURNAMENT_ERROR_MESSAGES = {
    "Authentication required": "Please sign in again.",
    "Invalid token": "Please sign in again.",
};

function getActualTournamentsErrorMessage(error) {
    const rawMessage = error?.message || error?.raw?.error || "Could not load tournaments. Please try again.";

    return ACTUAL_TOURNAMENT_ERROR_MESSAGES[rawMessage] || rawMessage;
}

function formatTournamentDates(startDate, endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export default function TournamentListView({onAuthError}) {
    const navigate = useNavigate();
    const [tournaments, setTournaments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadTournaments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError("");

            const payload = await requestWS("get_actual_tournaments");
            setTournaments(Array.isArray(payload.tournaments) ? payload.tournaments : []);
        } catch (loadError) {
            setTournaments([]);
            setError(getActualTournamentsErrorMessage(loadError));

            if (isAuthError(loadError)) {
                onAuthError?.();
            }
        } finally {
            setIsLoading(false);
        }
    }, [onAuthError]);

    useEffect(() => {
        loadTournaments();
    }, [loadTournaments]);

    if (isLoading) {
        return (
            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <CircularProgress size={22}/>
                    <Typography>Loading tournaments...</Typography>
                </Stack>
            </Paper>
        );
    }

    if (error) {
        return (
            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack spacing={2} alignItems="flex-start">
                    <Alert severity="error" sx={{width: "100%"}}>
                        {error}
                    </Alert>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon/>}
                        onClick={loadTournaments}
                        sx={{textTransform: "none"}}
                    >
                        Try again
                    </Button>
                </Stack>
            </Paper>
        );
    }

    if (tournaments.length === 0) {
        return (
            <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
                <Stack spacing={1}>
                    <Typography variant="h5" component="h2" sx={{fontWeight: 800}}>
                        No tournaments yet
                    </Typography>
                    <Typography sx={{color: "text.secondary"}}>
                        You do not have any active tournaments assigned right now.
                    </Typography>
                </Stack>
            </Paper>
        );
    }

    return (
        <Paper sx={{p: {xs: 2, sm: 3}, borderRadius: 1}}>
            <Stack spacing={2}>
                <Box>
                    <Typography variant="h5" component="h2" sx={{fontWeight: 800}}>
                        Your tournaments
                    </Typography>
                    <Typography sx={{mt: 0.5, color: "text.secondary"}}>
                        Tournaments available for your current role.
                    </Typography>
                </Box>

                <Stack divider={<Divider flexItem/>} spacing={2}>
                    {tournaments.map(tournament => (
                        <Box
                            key={tournament._id || tournament.title}
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {xs: "1fr", sm: "1fr auto"},
                                gap: 1.5,
                                alignItems: "center",
                            }}
                        >
                            <Box sx={{minWidth: 0}}>
                                <Stack direction={{xs: "column", sm: "row"}} spacing={1} alignItems={{xs: "flex-start", sm: "center"}}>
                                    <Typography variant="h6" component="h3" sx={{fontWeight: 700, wordBreak: "break-word"}}>
                                        {tournament.title || "Untitled tournament"}
                                    </Typography>
                                    <Chip
                                        label={tournament.status || "Draft"}
                                        size="small"
                                        sx={{fontWeight: 700}}
                                    />
                                </Stack>
                                <Typography variant="body2" sx={{mt: 0.75, color: "text.secondary"}}>
                                    {formatTournamentDates(tournament.start_date, tournament.end_date)}
                                </Typography>
                                {tournament.description && (
                                    <Typography variant="body2" sx={{mt: 1, wordBreak: "break-word"}}>
                                        {tournament.description}
                                    </Typography>
                                )}
                            </Box>

                            {tournament._id && (
                                <Button
                                    type="button"
                                    variant="outlined"
                                    startIcon={<VisibilityIcon/>}
                                    onClick={() => navigate(`/tournaments/${tournament._id}`)}
                                    sx={{
                                        textTransform: "none",
                                        justifySelf: {xs: "start", sm: "end"},
                                        minWidth: 130,
                                    }}
                                >
                                    View details
                                </Button>
                            )}
                        </Box>
                    ))}
                </Stack>
            </Stack>
        </Paper>
    );
}
