let socket;
let heartbeatInterval; // Timer reference
const listeners = new Map();

// Helper to start the heartbeat
const startHeartbeat = () => {
  // Clear any existing timer first
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  heartbeatInterval = setInterval(() => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Sending a standard 'ping' type
      // Your backend devs should be told to expect this type
      const ping = JSON.stringify({ type: "ping" });
      const encoder = new TextEncoder();
      socket.send(encoder.encode(ping));
      console.log("💓 Heartbeat sent");
    }
  }, 20000); // Send every 20 seconds
};

export const connect = () => {
  if (socket) return; // Prevent multiple connections

  const WS_URL = import.meta.env.VITE_WS_URL;
  socket = new WebSocket(WS_URL);
  socket.binaryType = "arraybuffer"; // Crucial for binary JSON requirement

  socket.onopen = () => {
    console.log("Connected to /apiws");
    startHeartbeat(); // Start the heart beating!
  };

  socket.onmessage = (event) => {
    try {
      // Convert Binary back to JSON
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(event.data);
      const message = JSON.parse(jsonString);

      // If server sends a 'pong' back, we just ignore it (or log it)
      if (message.type === "pong") return;

      // Trigger the specific listener for this "type"
      if (listeners.has(message.type)) {
        listeners.get(message.type)(message);
      }
    } catch (err) {
      console.error("Error parsing binary message:", err);
    }
  };

  socket.onclose = () => {
    console.log("WS Closed. Attempting reconnect...");
    socket = null;
    clearInterval(heartbeatInterval); // Stop heartbeat on disconnect
    setTimeout(connect, 3000); // Simple auto-reconnect
  };
};

export const sendWS = (data) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(data);
  } else {
    console.warn("Socket not open. Message not sent.");
  }
};

export const subscribeWS = (type, callback) => {
  listeners.set(type, callback);
};