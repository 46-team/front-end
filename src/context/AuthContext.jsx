import React, { createContext, useState, useEffect, useRef } from 'react';
import { connect, sendWS, subscribeWS } from '../api/wsClient'; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [deviceToken, setDeviceToken] = useState(localStorage.getItem('device_token'));
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // NEW: Track request status
  const [error, setError] = useState(null);
  const isInitialMount = useRef(true);

  const sendBinary = (payload) => {
    setIsLoading(true); // Start loading
    setError(null);     // Clear previous errors
    const encoder = new TextEncoder();
    sendWS(encoder.encode(JSON.stringify(payload)));
  };

  useEffect(() => {
    connect();

    const handleResponse = (res) => {
      setIsLoading(false); // Stop loading when any response arrives
      
      if (!res.is_ok) {
        setError(res.message || "Server error");
        return;
      }

      if (res.type === 'server-auth') {
        setDeviceToken(res.data);
        localStorage.setItem('device_token', res.data);
        setIsReady(true);
      } else {
        setUser(res.data);
        setIsReady(true);
      }
    };

    const types = ['server-auth', 'login-account', 'register-account', 'resume-session', 'get_me'];
    types.forEach(type => subscribeWS(type, handleResponse));

    if (isInitialMount.current) {
      const savedToken = localStorage.getItem('device_token');
      if (savedToken) {
        sendBinary({ type: 'resume-session', device_token: savedToken });
      } else {
        sendBinary({ type: 'server-auth' });
      }
      isInitialMount.current = false;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      deviceToken, user, isReady, isLoading, error, 
      setError, sendBinary 
    }}>
      {children}
    </AuthContext.Provider>
  );
};