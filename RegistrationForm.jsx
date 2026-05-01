import React, { useState, useEffect, useRef } from 'react';
import './RegistrationForm.css';

const RegistrationForm = () => {
  // State for form inputs
  const [formData, setFormData] = useState({
    login: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  // State for UI management
  const [statusMessage, setStatusMessage] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [userData, setUserData] = useState(null);

  // Reference for the WebSocket connection
  const ws = useRef(null);

  useEffect(() => {
    // Initialize WebSocket on component mount
    ws.current = new WebSocket('ws://localhost:8080');

    ws.current.onopen = () => {
      console.log("Connected to the server.");
    };

    ws.current.onclose = () => {
      setStatusMessage("Connection to the server lost.");
    };

    ws.current.onmessage = (event) => {
      const response = JSON.parse(event.data);

      if (response.type === "register_account") {
        if (response.is_ok) {
          setUserData(response.user);
          setIsRegistered(true);
        } else {
          setStatusMessage(response.error || "Registration failed.");
        }
      }
    };

    // Cleanup function to close the WebSocket when component unmounts
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatusMessage('');

    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      setStatusMessage("No connection to the server!");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setStatusMessage("Passwords do not match!");
      return;
    }

    const requestData = {
      type: "register_account",
      data: {
        login: formData.login,
        email: formData.email,
        full_name: formData.fullName,
        password: formData.password
      }
    };

    ws.current.send(JSON.stringify(requestData));
  };

  // React specific: Instead of location.reload(), we just reset the state
  const handleReset = () => {
    setIsRegistered(false);
    setUserData(null);
    setFormData({
      login: '',
      email: '',
      fullName: '',
      password: '',
      confirmPassword: ''
    });
    setStatusMessage('');
  };

  return (
    <div className="app-container">
      {!isRegistered ? (
        <div className="card">
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Login</label>
              <input 
                type="text" 
                name="login" 
                value={formData.login} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Email</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>

            <button type="submit">Register</button>
            {statusMessage && <div className="status-message">{statusMessage}</div>}
          </form>
        </div>
      ) : (
        <div className="card">
          <h2>Account Created!</h2>
          <div className="result-item">
            ID: <span>{userData?.id}</span>
          </div>
          <div className="result-item">
            Login: <span>{userData?.login}</span>
          </div>
          <div className="result-item">
            Email: <span>{userData?.email}</span>
          </div>
          <div className="result-item">
            Name: <span>{userData?.full_name}</span>
          </div>

          <button onClick={handleReset} style={{ marginTop: '20px' }}>Go Back</button>
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
