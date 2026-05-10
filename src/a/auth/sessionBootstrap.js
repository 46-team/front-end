import {requestWS} from "../../api/wsClient";
import {clearAuthData, clearStoredUser, getDeviceToken, storeSessionPayload} from "./authStorage";

export async function bootstrapStoredSession(setPage, request = requestWS) {
    if (!getDeviceToken()) {
        clearStoredUser();
        setPage("auth");
        return {status: "auth"};
    }

    setPage("loading");

    try {
        const payload = await request("get_me");
        storeSessionPayload(payload);
        setPage("main");
        return {status: "main", payload};
    } catch (error) {
        clearAuthData();
        setPage("auth");
        return {status: "auth", error};
    }
}
