import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const LoginForm = () => {
  const { sendBinary, deviceToken, error, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    sendBinary({
      type: "login-account",
      device_token: deviceToken,
      email,
      password
    });
  };

  return (
    <div className="form-box">
      <h2>Login</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleLogin}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={isLoading} // Disable input while loading
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          disabled={isLoading}
          required 
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;