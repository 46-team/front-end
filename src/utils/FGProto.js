export function convertSpkiToPem(spkiBuffer) {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(spkiBuffer)))
    const formatted = base64.match(/.{1,64}/g).join('\n')
    return `-----BEGIN PUBLIC KEY-----\n${formatted}\n-----END PUBLIC KEY-----`
}

export async function generateECDHKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        ["deriveKey", "deriveBits"]
    );

    const publicKeySpki = await crypto.subtle.exportKey("spki", keyPair.publicKey)
    const publicKeyPem = convertSpkiToPem(publicKeySpki)

    return {
        privateKey: keyPair.privateKey,
        publicKey: keyPair.publicKey,
        publicKeyPem,
    }
}

export async function importPemPublicKey(pem) {
    const pemContents = pem
        .replace("-----BEGIN PUBLIC KEY-----", "")
        .replace("-----END PUBLIC KEY-----", "")
        .replace(/\s/g, "")

    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0))

    return crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        []
    )
}

export async function deriveSharedSecret(privateKey, serverPublicKey) {
    const shared = await crypto.subtle.deriveBits(
        {
            name: "ECDH",
            public: serverPublicKey,
        },
        privateKey,
        256
    )

    return new Uint8Array(shared)
}

export async function handshake(socket) {

    const keyPair = await crypto.subtle.generateKey(
        {
            name: "ECDH",
            namedCurve: "P-256"
        },
        true,
        ["deriveBits"]
    );

    const publicKey = await crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
    );

    const base64 = arrayBufferToBase64(publicKey);
    const pem = toPEM(base64);

    socket.send(JSON.stringify({
        type: "handshake_request",
        client_public_key: pem
    }));

    return keyPair;
}
export async function encrypt(data, keyBytes) {
    // Импортируем ключ из Uint8Array(32)
    const key = await crypto.subtle.importKey(
        "raw",
        keyBytes.buffer,
        { name: "AES-GCM" },
        false,
        ["encrypt"]
    );

    const encodedData = new TextEncoder().encode(data);
    const nonce = crypto.getRandomValues(new Uint8Array(12)); // IV

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: nonce },
        key,
        encodedData
    );

    const encryptedBytes = new Uint8Array(encryptedBuffer);

    const tagLength = 16;
    const tag = encryptedBytes.slice(encryptedBytes.length - tagLength);
    const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - tagLength);

    // Формируем пакет: nonce + tag + ciphertext
    const result = new Uint8Array(nonce.length + tag.length + ciphertext.length);
    result.set(nonce, 0);                    // первые 12 байт — nonce
    result.set(tag, nonce.length);           // следующие 16 байт — tag
    result.set(ciphertext, nonce.length + tag.length); // остальное — ciphertext

    return result;
}

export async function decrypt(encryptedData, keyBytes) {
    // Преобразуем в Uint8Array если это строка Base64
    if (typeof encryptedData === "string") {
        encryptedData = base64ToUint8Array(encryptedData);
    }
    // Если это ArrayBuffer, конвертируем в Uint8Array
    else if (encryptedData instanceof ArrayBuffer) {
        encryptedData = new Uint8Array(encryptedData);
    }

    if (!(encryptedData instanceof Uint8Array)) {
        throw new Error("encryptedData должен быть Uint8Array, ArrayBuffer или Base64 строкой");
    }

    if (encryptedData.length < 28) {
        throw new Error("Зашифрованные данные слишком короткие");
    }

    const nonce = encryptedData.subarray(0, 12);
    const tag = encryptedData.subarray(12, 28);
    const ciphertext = encryptedData.subarray(28);

    const combinedCiphertext = new Uint8Array(ciphertext.length + tag.length);
    combinedCiphertext.set(ciphertext, 0);
    combinedCiphertext.set(tag, ciphertext.length);

    const cryptoKey = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    );

    const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: nonce, tagLength: 128 },
        cryptoKey,
        combinedCiphertext
    );

    return new TextDecoder().decode(decryptedBuffer);
}

// Вспомогательная функция для Base64 → Uint8Array
export function base64ToUint8Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

export async function loadKey() {

    const base64Key = localStorage.getItem("DC1_SRV_KEY")

    if (!base64Key) return null

    const raw = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0))

    return crypto.subtle.importKey(
        "raw",
        raw,
        {name: "AES-GCM"},
        false,
        ["encrypt", "decrypt"]
    )
}

function arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}

function toPEM(base64) {
    const lines = base64.match(/.{1,64}/g).join("\n");

    return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}
