export function formatDate(value) {
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

export function formatDateTime(value) {
    if (!value) return "-";

    const timestamp = typeof value === "number" ? value * 1000 : value;

    try {
        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(new Date(timestamp));
    } catch (error) {
        return String(value);
    }
}

export function getTournamentErrorMessage(error) {
    const code = String(error?.code || error?.raw?.err_code || "").replace(/^#/, "");
    const rawMessage = error?.message || error?.raw?.error || "Request failed. Please try again.";

    if (code === "INVALID_ID") return "Invalid tournament id.";
    if (code === "NOT_FOUND") return "Tournament was not found.";
    if (code === "INCOMPLETE_REQUEST") return "Tournament id is missing.";
    if (code === "INSECURE_CONNECTION" || code === "AUTH_TOKEN_EMPTY" || rawMessage === "Invalid token") {
        return "Please sign in again.";
    }

    return rawMessage;
}

export function isAuthError(error) {
    const code = String(error?.code || error?.raw?.err_code || "").replace(/^#/, "");
    const rawMessage = error?.message || error?.raw?.error || "";

    return (
        code === "INSECURE_CONNECTION" ||
        code === "AUTH_TOKEN_EMPTY" ||
        code === "SESSION_TOKEN_EXPIRED" ||
        rawMessage === "Invalid token" ||
        rawMessage === "Authentication required"
    );
}
