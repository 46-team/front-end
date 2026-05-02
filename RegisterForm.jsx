import React, { useState, useEffect } from 'react';
import { useAuthSocket } from './useAuthSocket';
import './RegisterForm.css'; // Importing your CSS file

const RegisterForm = () => {
  const { registerAccount, response, isConnected } = useAuthSocket('ws://localhost:8080');

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (response && response.type === 'register_account') {
      if (response.is_ok) {
        setIsSuccess(true);
        setErrorMessage('');
      } else {
        setIsSuccess(false);
        setErrorMessage(response.error || 'Registration failed');
      }
    }
  }, [response]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSuccess(false);
    registerAccount(login, password, fullName);
  };

  return (
    // The "card" class from your CSS
    <div className="card">
      <h2>Create an Account</h2>
      
      <form onSubmit={handleSubmit}>
        {/* The "input-group" class from your CSS */}
        <div className="input-group">
          <label>Login:</label>
          <input 
            type="text" 
            value={login} 
            onChange={(e) => setLogin(e.target.value)} 
            required 
          />
        </div>

        <div className="input-group">
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <div className="input-group">
          <label>Full Name:</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" disabled={!isConnected}>
          Register
        </button>
      </form>

      {/* The "statusMessage" ID from your CSS */}
      {!isConnected && <div id="statusMessage">Connecting to server...</div>}
      {errorMessage && <div id="statusMessage">{errorMessage}</div>}

      {/* The "resultWindow" ID from your CSS. 
          React overrides the "display: none" from your CSS when isSuccess is true */}
      <div 
        id="resultWindow" 
        style={{ display: isSuccess ? 'block' : 'none', marginTop: '20px' }}
      >
        <div className="result-item">
          <b>Status:</b> <span>Success!</span>
        </div>
        
        {response?.user && (
          <div className="result-item">
            <b>User:</b> <span>{response.user.full_name}</span>
          </div>
        )}
        
        {response?.token && (
          <div className="result-item">
            <b>Token:</b> <span>{response.token}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;