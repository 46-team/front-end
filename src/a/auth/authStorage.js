export function clearAuthData() {
    localStorage.removeItem("usr_acc");
    localStorage.removeItem("device_token");
}

export function clearStoredUser() {
    localStorage.removeItem("usr_acc");
}

export function getDeviceToken() {
    return localStorage.getItem("device_token");
}

export function getStoredUser() {
    try {
        const storedUser = localStorage.getItem("usr_acc");
        return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        clearStoredUser();
        return null;
    }
}

export function storeDeviceToken(token) {
    if (!token) return;
    localStorage.setItem("device_token", token);
}

export function storeAuthData(user, token) {
    localStorage.setItem("usr_acc", JSON.stringify(user));
    storeDeviceToken(token);
}

export function storeUser(user) {
    localStorage.setItem("usr_acc", JSON.stringify(user));
}

export function storeSessionPayload(payload) {
    if (payload?.user) {
        storeUser(payload.user);
    }

    if (payload?.token) {
        storeDeviceToken(payload.token);
    }
}
