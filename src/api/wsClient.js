import {sendWS, subscribeWS} from "../utils/Websocket";

const DEFAULT_TIMEOUT = 10000;
const ERROR_RESPONSE_TYPES = ["null", "error"];

export class WSRequestError extends Error {
    constructor(message, code = "WS_ERROR", raw = null) {
        super(message);
        this.name = "WSRequestError";
        this.code = code;
        this.raw = raw;
    }
}

export class WSTimeoutError extends WSRequestError {
    constructor(type, timeout) {
        super(`WebSocket request "${type}" timed out after ${timeout}ms`, "WS_TIMEOUT");
        this.name = "WSTimeoutError";
        this.type = type;
        this.timeout = timeout;
    }
}

export function normalizeWSError(message) {
    if (message instanceof WSRequestError) return message;

    const code = message?.err_code || message?.code || "WS_ERROR";
    const text = message?.error || message?.message || "WebSocket request failed";

    return new WSRequestError(text, code, message);
}

function isErrorResponse(message) {
    return Boolean(
        message?.err_code ||
        message?.is_ok === false ||
        ERROR_RESPONSE_TYPES.includes(message?.type)
    );
}

function withDeviceToken(payload, auth) {
    if (auth === false) return payload;

    const deviceToken = localStorage.getItem("device_token");
    if (!deviceToken) return payload;

    return {
        ...payload,
        device_token: deviceToken,
    };
}

export function requestWS(type, payload = {}, options = {}) {
    const timeout = options.timeout || DEFAULT_TIMEOUT;
    const requestPayload = {
        ...withDeviceToken(payload, options.auth),
        type,
    };

    return new Promise((resolve, reject) => {
        let settled = false;
        let timer = null;
        const unsubscribers = [];

        const cleanup = () => {
            clearTimeout(timer);
            unsubscribers.forEach(unsubscribe => unsubscribe());
        };

        const settle = (handler, value) => {
            if (settled) return;
            settled = true;
            cleanup();
            handler(value);
        };

        const onSuccess = (message) => {
            if (isErrorResponse(message)) {
                settle(reject, normalizeWSError(message));
                return;
            }

            settle(resolve, message);
        };

        const onError = (message) => {
            settle(reject, normalizeWSError(message));
        };

        timer = setTimeout(() => {
            settle(reject, new WSTimeoutError(type, timeout));
        }, timeout);

        unsubscribers.push(subscribeWS(type, onSuccess));
        if (settled) return;

        ERROR_RESPONSE_TYPES.forEach(errorType => {
            if (errorType !== type) {
                unsubscribers.push(subscribeWS(errorType, onError));
            }
        });
        if (settled) return;

        sendWS(requestPayload).catch(error => {
            settle(reject, normalizeWSError({
                code: "WS_SEND_FAILED",
                message: error?.message || "Failed to send WebSocket request",
                error,
            }));
        });
    });
}
