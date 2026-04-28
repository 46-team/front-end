import {useEffect, useState} from "react"
import {connectWebSocket, sendWS, subscribeWS} from "../utils/Websocket"
import ServerError from "../system-pages/ServerError"
import Loader from "../utils/Loaders"
import Login from "./auth/Login";
import MainContainer from "./MainContainer";

let timeout = null;

export default function App_a() {
    const [status, setStatus] = useState("connecting")
    const [page, setPage] = useState("loading")

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
        if (localStorage.getItem("usr_acc") && localStorage.getItem("device_token")) {
            setPage("auth")

        } else {
            setPage("auth")
        }
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
        return <MainContainer setPage={setPage} />
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
