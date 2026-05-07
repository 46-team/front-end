export const SUPPORTED_ROLES = ["admin", "team", "jury", "organizer"];

export const ROLE_LABELS = {
    admin: "Admin",
    team: "Team",
    jury: "Jury",
    organizer: "Organizer",
};

export function normalizeRole(role) {
    if (typeof role !== "string") {
        return null;
    }

    const normalizedRole = role.trim().toLowerCase();
    return SUPPORTED_ROLES.includes(normalizedRole) ? normalizedRole : null;
}

export function getDisplayRole(role) {
    const normalizedRole = normalizeRole(role);
    return normalizedRole ? ROLE_LABELS[normalizedRole] : "Unknown role";
}

export function normalizeUser(user) {
    const safeUser = user && typeof user === "object" ? user : {};
    const role = normalizeRole(safeUser.role);
    const fullName = typeof safeUser.full_name === "string" ? safeUser.full_name.trim() : "";
    const login = typeof safeUser.login === "string" ? safeUser.login.trim() : "";
    const email = typeof safeUser.email === "string" ? safeUser.email.trim() : "";
    const id = typeof safeUser._id === "string" ? safeUser._id.trim() : "";

    return {
        ...safeUser,
        _id: id,
        email,
        full_name: fullName,
        login,
        role,
        displayName: fullName || login || email || "Unknown user",
        secondaryText: email || login || id || "Account details unavailable",
        roleLabel: getDisplayRole(role),
    };
}

export function getUserInitials(user) {
    const normalizedUser = normalizeUser(user);
    const parts = normalizedUser.displayName.split(/\s+/).filter(Boolean);

    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }

    return normalizedUser.displayName.slice(0, 2).toUpperCase();
}
