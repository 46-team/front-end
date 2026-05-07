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

export function storeAuthData(user, token) {
    localStorage.setItem("usr_acc", JSON.stringify(user));
    localStorage.setItem("device_token", token);
}

export function storeUser(user) {
    localStorage.setItem("usr_acc", JSON.stringify(user));
}
