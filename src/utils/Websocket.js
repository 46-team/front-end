import {decrypt, encrypt} from "./FGProto";
import {handshake, loadKey} from "./FGProto"

export let socket = null
let isConnected = false

// очередь отправки
const sendQueue = []

// очередь получения
const listeners = {};
const queues = {};

let serverKey = null;
let keyPair = null;
const url = "ws://192.168.0.204:8000/apiws"
export let key = null;    

export function pushMessage(msg) {
    const { type } = msg;

    if (!queues[type]) {
        queues[type] = [];
    }

    if (!listeners[type] || listeners[type].length === 0) {
        queues[type].push(msg);
        return;
    }

    const listener = listeners[type].shift();
    listener(msg);
}

function flushSendQueue() {
    if (!socket || !isConnected) return

    while (sendQueue.length > 0) {
        const msg = sendQueue.shift()
        if (!msg) continue

        socket.send(JSON.stringify(msg))
    }
}

export async function connectWebSocket(setStatus, status) {

    if (socket) return

    socket = new WebSocket(url)

    socket.onopen = async () => {
        isConnected = true
        key = await loadKey();  // <--- убрали let
        if (!key) {
            keyPair = await handshake(socket);
        }
        flushSendQueue();
    }

    socket.onmessage = async (event) => {
        // если ключ ещё не получен
        if (!key) {
            let text;
            if (event.data instanceof Blob) {
                text = await event.data.text();
            } else {
                text = event.data;
            }
            const serverKeyBuffer = pemToArrayBuffer(text);
            const serverPublicKey = await crypto.subtle.importKey(
                "spki",
                serverKeyBuffer,
                { name: "ECDH", namedCurve: "P-256" },
                true,
                []
            );

            const sharedSecret = await crypto.subtle.deriveBits(
                { name: "ECDH", public: serverPublicKey },
                keyPair.privateKey,
                256
            );

            key = new Uint8Array(sharedSecret);
            socket.binaryType = "arraybuffer";
            setStatus("connected");
            return;
        }

        // дешифруем все остальные сообщения
        let data = event.data;
        if (data instanceof Blob) data = await data.arrayBuffer();
        try {
            let msg = await decrypt(data, key.buffer);
            const parsed = JSON.parse(msg);
            pushMessage(parsed);
        } catch (e) {
            console.error("Ошибка при расшифровке/парсинге сообщения:", e, data);
        }
    }

    socket.onclose = () => {
        isConnected = false
        socket = null
    }

    socket.onerror = () => {
        isConnected = false
    }
}

export async function sendWS(data) {

    if (!socket || !isConnected) {
        sendQueue.push(data)
        return
    }
if (key !== null) {
    await socket.send(await encrypt(JSON.stringify(data), key))
} else {
    await socket.send(JSON.stringify(data))
}
}
export function subscribeWS(type, callback) {
    if (!listeners[type]) {
        listeners[type] = [];
    }

    if (!queues[type]) {
        queues[type] = [];
    }

    // если сообщение уже есть — отдаём сразу
    if (queues[type].length > 0) {
        const msg = queues[type].shift();
        callback(msg);
        return () => {};
    }

    listeners[type].push(callback);

    return () => {
        listeners[type] = listeners[type].filter(cb => cb !== callback);
    };
}

function pemToArrayBuffer(pem) {

    const base64 = pem
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replace(/\n/g, "")
        .trim();

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes.buffer;
}