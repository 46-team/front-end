import React, { useState } from 'react';
import useAuth from '../../hooks/useAuth';

const RegisterForm = () => {
  const { sendBinary, deviceToken, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();
    setError(null); // Reset UI error before trying

    sendBinary({
      type: "register-account", // Ensure this matches your back-end's string
      device_token: deviceToken,
      email,
      password
    });
  };

  return (
    <div className="form-box">
      <h2>Register</h2>
      
      {/* Display server error if is_ok was false */}
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleRegister}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
};

export default RegisterForm;