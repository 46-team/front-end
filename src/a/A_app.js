import {useEffect, useState} from "react"
import {connectWebSocket} from "../utils/Websocket"
import ServerError from "../system-pages/ServerError"
import Loader from "../utils/Loaders"
import Login from "./auth/Login";
import MainContainer from "./MainContainer";
import {requestWS} from "../api/wsClient";
import {clearAuthData, clearStoredUser, getDeviceToken, storeUser} from "./auth/authStorage";

let timeout = null;

export default function App_a() {
    const [status, setStatus] = useState("connecting")
    const [page, setPage] = useState("loading")

    async function handleLogout() {
        try {
            await requestWS("logout");
        } catch (error) {
            console.warn("Logout request failed", error);
        } finally {
            clearAuthData();
            setPage("auth");
        }
    }

    useEffect(() => {
        let inttimeout = null;
        async function init() {
            try {
                await connectWebSocket(setStatus)
            } catch (e) {
                inttimeout = setInterval(() => {init(); clearInterval(inttimeout);}, 2500)
                setStatus("failed")
            }
        }

        init()

    }, [])

    if (status === "connected") {
        clearTimeout(timeout);
    }

    useEffect(() => {
        if (status !== "connected") return

        async function bootstrapSession() {
            if (!getDeviceToken()) {
                clearStoredUser();
                setPage("auth");
                return;
            }

            setPage("loading");

            try {
                const payload = await requestWS("get_me");
                storeUser(payload.user);
                setPage("main");
            } catch (error) {
                clearAuthData();
                setPage("auth");
            }
        }

        bootstrapSession();
    }, [status]);

    useEffect(() => {
        if (status === "connected") return;

        const t = setTimeout(() => {
            if (status !== "connected") setStatus("failed");
        }, 5000);

        return () => clearTimeout(t);
    }, [status]);

    if (status === "failed") {
        return <ServerError/>
    }
    if (page === "main") {
        return <MainContainer onLogout={handleLogout} />
    }
    if (page === "loading") {
        return (
            <>
                <Loader text="Loading..."/>
            </>
        )
    }

    if (page === "auth") {
        return (
            <>
                <Login setPage={setPage} />
            </>
        )
    }

    return null
}
