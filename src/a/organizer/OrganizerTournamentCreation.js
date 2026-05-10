import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {requestWS} from "../../api/wsClient";
import {getDeviceToken} from "../auth/authStorage";
import {showError} from "../../utils/Modal";
import AppSurface from "../../ui/AppSurface";

const EMPTY_FORM = {
    title: "",
    description: "",
    startDate: "",
    endDate: "",
};

const ERROR_MESSAGES = {
    "Authentication required": "Please sign in again.",
    "Invalid token": "Please sign in again.",
    "Access denied": "Only organizers can create tournaments.",
    "Invalid tournament data: 'title' is required": "Tournament title is required.",
    "Invalid tournament dates": "Tournament dates must be valid.",
    "Invalid tournament dates: 'start_date' must be earlier than 'end_date'":
        "Start date must be earlier than end date.",
};

function getErrorMessage(error) {
    const rawMessage = error?.message || error?.error || "Request failed. Please try again.";
    return ERROR_MESSAGES[rawMessage] || rawMessage;
}

function formatTournamentDate(value) {
    if (!value) return "-";

    try {
        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(new Date(value));
    } catch (error) {
        return value;
    }
}

export default function OrganizerTournamentCreation() {
    const navigate = useNavigate();
    const [form, setForm] = useState(EMPTY_FORM);
    const [createdTournaments, setCreatedTournaments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    function updateField(field, value) {
        setForm(currentForm => ({
            ...currentForm,
            [field]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const title = form.title.trim();
        if (!title) {
            const message = ERROR_MESSAGES["Invalid tournament data: 'title' is required"];
            setError(message);
            setSuccess("");
            showError("Tournament creation failed", message);
            return;
        }

        if (!getDeviceToken()) {
            const message = ERROR_MESSAGES["Authentication required"];
            setError(message);
            setSuccess("");
            showError("Tournament creation failed", message);
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            const payload = await requestWS("create_tournament", {
                title,
                description: form.description.trim() || null,
                start_date: form.startDate || null,
                end_date: form.endDate || null,
            });

            if (payload.tournament) {
                setCreatedTournaments(currentTournaments => [
                    payload.tournament,
                    ...currentTournaments,
                ]);
            }

            setForm(EMPTY_FORM);
            setSuccess("Tournament created successfully.");
        } catch (createError) {
            const message = getErrorMessage(createError);
            setError(message);
            showError("Tournament creation failed", message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Stack spacing={2}>
            <AppSurface>
                <Stack spacing={2} component="form" onSubmit={handleSubmit}>
                    <Box>
                        <Typography variant="h5" component="h2">
                            Create tournament
                        </Typography>
                        <Typography variant="body2" sx={{mt: 0.5, color: "text.secondary"}}>
                            Set up a tournament draft for teams and judges.
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

                    <TextField
                        label="Title"
                        value={form.title}
                        onChange={event => updateField("title", event.target.value)}
                        required
                        fullWidth
                        autoComplete="off"
                        error={Boolean(error) && !form.title.trim()}
                        helperText={!form.title.trim() ? "Required" : " "}
                    />

                    <TextField
                        label="Description"
                        value={form.description}
                        onChange={event => updateField("description", event.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                    />

                    <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
                        <TextField
                            label="Start date"
                            type="date"
                            value={form.startDate}
                            onChange={event => updateField("startDate", event.target.value)}
                            fullWidth
                            InputLabelProps={{shrink: true}}
                        />
                        <TextField
                            label="End date"
                            type="date"
                            value={form.endDate}
                            onChange={event => updateField("endDate", event.target.value)}
                            fullWidth
                            InputLabelProps={{shrink: true}}
                        />
                    </Stack>

                    <Box>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={isSubmitting ? <CircularProgress color="inherit" size={18}/> : <AddIcon/>}
                            disabled={isSubmitting}
                            sx={{minWidth: 180}}
                        >
                            Create tournament
                        </Button>
                    </Box>
                </Stack>
            </AppSurface>

            {createdTournaments.length > 0 && (
                <AppSurface>
                    <Typography variant="h6" component="h2">
                        Created tournaments
                    </Typography>
                    <Stack divider={<Divider flexItem/>} spacing={2} sx={{mt: 2}}>
                        {createdTournaments.map(tournament => (
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
                                    <Typography sx={{fontWeight: 700, wordBreak: "break-word"}}>
                                        {tournament.title}
                                    </Typography>
                                    <Typography variant="body2" sx={{color: "text.secondary"}}>
                                        {tournament.status || "Draft"} | {formatTournamentDate(tournament.start_date)} - {formatTournamentDate(tournament.end_date)}
                                    </Typography>
                                    {tournament.description && (
                                        <Typography variant="body2" sx={{mt: 0.75, wordBreak: "break-word"}}>
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
                </AppSurface>
            )}
        </Stack>
    );
}
